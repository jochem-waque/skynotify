/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package main

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"slices"
	"strconv"
	"strings"
	"syscall"
	"time"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/errorutils"
	"firebase.google.com/go/v4/messaging"
	"github.com/Jochem-W/skynotify/server/db"
	"github.com/Jochem-W/skynotify/server/heartbeat"
	"github.com/Jochem-W/skynotify/server/post"
	"github.com/Jochem-W/skynotify/server/repost"
	"github.com/Jochem-W/skynotify/server/retry"
	"github.com/Jochem-W/skynotify/server/user"
	"github.com/bluesky-social/indigo/api/atproto"
	"github.com/bluesky-social/indigo/api/bsky"
	"github.com/bluesky-social/indigo/events"
	"github.com/bluesky-social/indigo/events/schedulers/parallel"
	"github.com/bluesky-social/indigo/repo"
	"github.com/gorilla/websocket"
	influxdb "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	"github.com/influxdata/influxdb-client-go/v2/api/write"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lpernett/godotenv"
	"google.golang.org/api/option"
)

var messagingClient *messaging.Client

var querier *db.DBQuerier

var nWriteApi api.WriteAPI
var fWriteApi api.WriteAPI

var retryMessages *retry.RetryMessages = &retry.RetryMessages{
	Retries: 10,
	Delay:   5 * time.Minute,
	Action:  sendMessage,
}

func loadEnv() error {
	if _, err := os.Stat(".env"); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil
		}

		return fmt.Errorf("loadEnv: %w", err)
	}

	if err := godotenv.Load(); err != nil {
		return fmt.Errorf("loadEnv: %w", err)
	}

	return nil
}

func loadFirebase() error {
	opt := option.WithCredentialsFile("firebase.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return fmt.Errorf("loadFirebase: %w", err)
	}

	messagingClient, err = app.Messaging(context.Background())
	if err != nil {
		return fmt.Errorf("loadFirebase: %w", err)
	}

	return nil
}

func loadQuerier() (*pgxpool.Pool, error) {
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		return nil, fmt.Errorf("loadQuerier: environment variable DATABASE_URL is not set")
	}

	dbpool, err := pgxpool.New(context.Background(), url)
	if err != nil {
		return nil, fmt.Errorf("loadQuerier: %w", err)
	}

	querier = db.NewQuerier(dbpool)

	return dbpool, nil
}

func loadInflux() (influxdb.Client, error) {
	token := os.Getenv("INFLUXDB_ADMIN_TOKEN")

	if token == "" {
		return nil, nil
	}

	influxClient := influxdb.NewClient("http://influx:8086", token)

	nWriteApi = influxClient.WriteAPI("skynotify", "notification")

	organizations := influxClient.OrganizationsAPI()
	org, err := organizations.FindOrganizationByName(context.Background(), "skynotify")
	if err != nil {
		return influxClient, fmt.Errorf("loadInflux: %w", err)
	}

	buckets := influxClient.BucketsAPI()
	_, err = buckets.FindBucketByName(context.Background(), "firehose")
	if err != nil {
		if err.Error() != "bucket 'firehose' not found" {
			return influxClient, fmt.Errorf("loadInflux: %w", err)
		}

		_, err = buckets.CreateBucketWithName(context.Background(), org, "firehose")
		if err != nil {
			return influxClient, fmt.Errorf("loadInflux: %w", err)
		}
	}

	fWriteApi = influxClient.WriteAPI("skynotify", "firehose")

	_, err = buckets.FindBucketByName(context.Background(), "firehose-downsampled")
	if err != nil {
		if err.Error() != "bucket 'firehose-downsampled' not found" {
			return influxClient, fmt.Errorf("loadInflux: %w", err)
		}

		_, err = buckets.CreateBucketWithName(context.Background(), org, "firehose-downsampled")
		if err != nil {
			return influxClient, fmt.Errorf("loadInflux: %w", err)
		}
	}

	tasksApi := influxClient.TasksAPI()
	tasks, err := tasksApi.FindTasks(context.Background(), &api.TaskFilter{Name: "firehose-downsample"})
	if err != nil {
		return influxClient, fmt.Errorf("loadInflux: %w", err)
	}

	for _, task := range tasks {
		if task.Name == "firehose-downsample" {
			return influxClient, nil
		}
	}

	_, err = tasksApi.CreateTaskWithEvery(context.Background(), "firehose-downsample", `from(bucket: "firehose")
  |> range(start: -task.every)
  |> filter(fn: (r) => r._measurement == "commit" and r._field == "ops")
  |> aggregateWindow(every: 1s, fn: sum)
  |> to(bucket: "firehose-downsampled")`, "1m", *org.Id)

	if err != nil {
		return influxClient, fmt.Errorf("loadInflux: %w", err)
	}

	return influxClient, nil
}

func writeNotificationPoint(notificationType string, success bool, value int) {
	if nWriteApi == nil {
		return
	}

	nWriteApi.WritePoint(write.NewPoint("sent", map[string]string{
		"type":    notificationType,
		"success": strconv.FormatBool(success),
	}, map[string]interface{}{
		"value": value,
	}, time.Now()))
}

func writeCommitPoint(evt *atproto.SyncSubscribeRepos_Commit) error {
	if fWriteApi == nil {
		return nil
	}

	t, err := time.Parse(time.RFC3339, evt.Time)
	if err != nil {
		return fmt.Errorf("writeCommitPoint: %w", err)
	}

	p := write.NewPoint("commit", map[string]string{
		"tooBig": strconv.FormatBool(evt.TooBig),
	}, map[string]interface{}{
		"value": 1,
		"seq":   evt.Seq,
	}, t)
	if evt.Ops != nil {
		p.AddField("ops", len(evt.Ops))
	}

	fWriteApi.WritePoint(p)

	return nil
}

func getLastSeq(client influxdb.Client) (int64, error) {
	if client == nil {
		return 0, nil
	}

	q := client.QueryAPI("skynotify")
	// range could be up to 3d, but is very slow and would be very spammy
	res, err := q.Query(context.Background(), `from(bucket: "firehose")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "commit")
  |> filter(fn: (r) => r._field == "seq")
  |> sort(columns: ["_value"])
  |> last()`)
	if err != nil {
		return 0, fmt.Errorf("getLastSeq: %w", err)
	}

	if !res.Next() {
		return 0, nil
	}

	val := res.Record().Value()
	if val == nil {
		return 0, nil
	}

	seq, ok := val.(int64)
	if !ok {
		return 0, fmt.Errorf("getLastSeq: couldn't read seq field as int64")
	}

	return seq, nil
}

func main() {
	if err := loadEnv(); err != nil {
		slog.Error("main", "error", err)
	}

	if err := loadFirebase(); err != nil {
		slog.Error("main", "error", err)
		os.Exit(1)
	}

	pool, err := loadQuerier()
	if err != nil {
		slog.Error("main", "error", err)
		os.Exit(1)
	}

	defer pool.Close()

	influx, err := loadInflux()
	if err != nil {
		slog.Error("main", "error", err)
		os.Exit(1)
	}

	var seq int64 = 0

	if influx != nil {
		defer influx.Close()
		seq, err = getLastSeq(influx)
		if err != nil {
			slog.Error("main", "error", err)
			os.Exit(1)
		}
	}

	if nWriteApi != nil {
		nErrorsCh := nWriteApi.Errors()
		go func() {
			for err := range nErrorsCh {
				slog.Error("nWriteApi", "error", err)
			}
		}()
	}

	if fWriteApi != nil {
		fErrorsCh := fWriteApi.Errors()
		go func() {
			for err := range fErrorsCh {
				slog.Error("fWriteApi", "error", err)
			}
		}()
	}

	uri := "wss://bsky.network/xrpc/com.atproto.sync.subscribeRepos"
	if seq != 0 {
		slog.Info("main: resuming from", "seq", seq)
		uri = fmt.Sprintf("%s?cursor=%d", uri, seq)
	}

	con, _, err := websocket.DefaultDialer.Dial(uri, http.Header{})
	if err != nil {
		slog.Error("main", "error", err)
		os.Exit(1)
	}

	defer con.Close()

	h, hCtx := heartbeat.NewHeartbeat(time.Minute * 5)
	ctx, cancel := signal.NotifyContext(hCtx, os.Interrupt, syscall.SIGTERM)

	rsc := &events.RepoStreamCallbacks{
		RepoIdentity: func(evt *atproto.SyncSubscribeRepos_Identity) error {
			h.Reset()

			if err := user.DefaultCache.UpdateIdentity(evt.Did, evt); err != nil {
				slog.Error("rsc.RepoIdentity", "error", err)
			}

			return nil
		},
		RepoCommit: func(evt *atproto.SyncSubscribeRepos_Commit) error {
			h.Reset()

			if err := processCommit(evt); err != nil {
				slog.Error("rsc.RepoCommit", "error", err)
			}

			return nil
		},
		Error: func(evt *events.ErrorFrame) error {
			slog.Error("rsc.Error", "error", evt.Error, "message", evt.Message)
			cancel()
			return nil
		},
	}

	sched := parallel.NewScheduler(runtime.NumCPU(), 500, "firehose", rsc.EventHandler)
	if err = events.HandleRepoStream(ctx, con, sched, slog.Default()); err != nil {
		slog.Error("main", "error", err)
	}

	slog.Info("main: graceful exit")
}

func hasUsefulOp(evt *atproto.SyncSubscribeRepos_Commit) bool {
	for _, op := range evt.Ops {
		if op.Action == "update" && op.Path == "app.bsky.actor.profile/self" {
			return true
		}

		if op.Action == "create" && strings.HasPrefix(op.Path, "app.bsky.feed.repost/") {
			return true
		}

		if op.Action == "create" && strings.HasPrefix(op.Path, "app.bsky.feed.post/") {
			return true
		}
	}

	return false
}

func processCommit(evt *atproto.SyncSubscribeRepos_Commit) error {
	err := writeCommitPoint(evt)
	if err != nil {
		slog.Warn("processCommit", "error", err)
	}

	if evt.TooBig {
		// fmt.Println("skipping too big commit")
		return nil
	}

	if !hasUsefulOp(evt) {
		return nil
	}

	rows, err := querier.GetSubscriptions(context.Background(), evt.Repo)
	if err != nil {
		return fmt.Errorf("processCommit: %w", err)
	}

	if len(rows) == 0 && !user.DefaultCache.Exists(evt.Repo) {
		return nil
	}

	messages, err := processOps(evt, rows)
	if err != nil {
		return fmt.Errorf("processCommit: %w", err)
	}

	for _, message := range messages {
		// I think setting the Topic header might act like an FCM topic? Was getting RESOURCE_EXHAUSTED (QUOTA_EXCEEDED)
		// message.Webpush.Headers["Topic"] = message.Data["tag"]
		message.Webpush = &messaging.WebpushConfig{Headers: make(map[string]string)}
		message.Webpush.Headers["TTL"] = "43200" // 12 hours
		message.Webpush.Headers["Urgency"] = "normal"
		sendMulticast(&message)
	}

	return nil
}

func sendMulticast(message *messaging.MulticastMessage) {
	responses, _ := messagingClient.SendEachForMulticast(context.Background(), message)

	successCount := 0
	failCount := 0
	tag := message.FCMOptions.AnalyticsLabel
	if tag == "" {
		tag = "unknown"
	}

	for i, response := range responses.Responses {
		if response.Success {
			successCount += 1
			continue
		}

		failCount += 1

		if !errorutils.IsNotFound(response.Error) {
			slog.Error("processCommit", "error", response.Error)
			singleMessage := messaging.Message{
				Data:         message.Data,
				Notification: message.Notification,
				Android:      message.Android,
				Webpush:      message.Webpush,
				APNS:         message.APNS,
				FCMOptions:   message.FCMOptions,
				Token:        message.Tokens[i],
			}
			retryMessages.Retry(&singleMessage)
			continue
		}

		token := message.Tokens[i]
		if _, err := querier.InvalidateToken(context.Background(), token); err != nil {
			slog.Error("processCommit", "error", err)
			continue
		}

		slog.Info("processCommit: invalidated token", "token", token)
	}

	writeNotificationPoint(tag, true, successCount)
	writeNotificationPoint(tag, false, failCount)
}

func sendMessage(message *messaging.Message) error {
	_, err := messagingClient.Send(context.Background(), message)
	tag := message.FCMOptions.AnalyticsLabel
	if tag == "" {
		tag = "unknown"
	}

	writeNotificationPoint(tag, err == nil, 1)
	return fmt.Errorf("sendMessage: %w", err)
}

func openRepo(evt *atproto.SyncSubscribeRepos_Commit, r **repo.Repo) error {
	if *r != nil {
		return nil
	}

	reader := bytes.NewReader(evt.Blocks)
	newRepo, err := repo.ReadRepoFromCar(context.Background(), reader)
	if err != nil {
		return fmt.Errorf("openRepo: %w", err)
	}

	*r = newRepo
	return nil
}

func processOps(evt *atproto.SyncSubscribeRepos_Commit, rows []db.GetSubscriptionsRow) ([]messaging.MulticastMessage, error) {
	var r *repo.Repo
	messages := []messaging.MulticastMessage{}

	userData, err := user.DefaultCache.GetOrFetch(evt.Repo)
	if err != nil {
		return messages, fmt.Errorf("processOps: %w", err)
	}

	for _, op := range evt.Ops {
		if op.Action == "update" && op.Path == "app.bsky.actor.profile/self" {
			if err = openRepo(evt, &r); err != nil {
				return messages, fmt.Errorf("processOps: %w", err)
			}

			_, rec, err := r.GetRecord(context.Background(), op.Path)
			if err != nil {
				return messages, fmt.Errorf("processOps: %w", err)
			}

			pr, ok := rec.(*bsky.ActorProfile)
			if !ok {
				return messages, fmt.Errorf("processOps: couldn't read profile record")
			}

			user.DefaultCache.Update(evt.Repo, pr)

			continue
		}

		if op.Action == "create" && strings.HasPrefix(op.Path, "app.bsky.feed.repost/") && len(rows) > 0 {
			tokens := []string{}
			for _, row := range rows {
				if row.Reposts {
					tokens = append(tokens, row.Token)
				}
			}

			if len(tokens) == 0 {
				continue
			}

			if err = openRepo(evt, &r); err != nil {
				return messages, fmt.Errorf("processOps: %w", err)
			}

			_, record, err := r.GetRecord(context.Background(), op.Path)
			if err != nil {
				return messages, fmt.Errorf("processOps: %w", err)
			}

			rp, ok := record.(*bsky.FeedRepost)
			if !ok {
				return messages, fmt.Errorf("processOps: couldn't read repost record")
			}

			message, err := repost.MakeMessage(userData, op.Path, rp)
			if err != nil {
				return messages, fmt.Errorf("processOps: %w", err)
			}

			for chunk := range slices.Chunk(tokens, 500) {
				message.Tokens = chunk
				messages = append(messages, message)
			}

			continue
		}

		if op.Action == "create" && strings.HasPrefix(op.Path, "app.bsky.feed.post/") && len(rows) > 0 {
			if err = openRepo(evt, &r); err != nil {
				return messages, fmt.Errorf("processOps: %w", err)
			}

			_, record, err := r.GetRecord(context.Background(), op.Path)
			if err != nil {
				return messages, fmt.Errorf("processOps: %w", err)
			}

			p, ok := record.(*bsky.FeedPost)
			if !ok {
				return messages, fmt.Errorf("processOps: couldn't read post record")
			}

			message, reply, err := post.MakeMessage(userData, op.Path, p)
			if err != nil {
				return messages, fmt.Errorf("processOps: %w", err)
			}

			tokens := []string{}
			for _, row := range rows {
				if reply && row.Replies || !reply && row.Posts {
					tokens = append(tokens, row.Token)
				}
			}

			for chunk := range slices.Chunk(tokens, 500) {
				message.Tokens = chunk
				messages = append(messages, message)
			}

			continue
		}
	}

	return messages, nil
}

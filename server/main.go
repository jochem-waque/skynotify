/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package main

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"runtime"
	"slices"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/errorutils"
	"firebase.google.com/go/v4/messaging"
	"github.com/Jochem-W/skynotify/server/db"
	"github.com/Jochem-W/skynotify/server/post"
	"github.com/Jochem-W/skynotify/server/repost"
	"github.com/Jochem-W/skynotify/server/user"
	"github.com/bluesky-social/indigo/api/atproto"
	"github.com/bluesky-social/indigo/api/bsky"
	"github.com/bluesky-social/indigo/events"
	"github.com/bluesky-social/indigo/events/schedulers/parallel"
	"github.com/bluesky-social/indigo/repo"
	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lpernett/godotenv"
	"google.golang.org/api/option"
)

var env = struct {
	databaseUrl string
}{}

var messagingClient *messaging.Client

var querier *db.DBQuerier

func loadEnv() {
	_, err := os.Stat(".env")
	if err == nil {
		err := godotenv.Load()
		if err != nil {
			log.Fatalln(err)
		}
	}

	env.databaseUrl = os.Getenv("DATABASE_URL")
	if env.databaseUrl == "" {
		log.Fatalln("Environment variable DATABASE_URL is not set")
	}
}

func loadFirebase() {
	opt := option.WithCredentialsFile("firebase.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Fatalln(err)
	}

	messagingClient, err = app.Messaging(context.Background())
	if err != nil {
		log.Fatalln(err)
	}
}

func main() {
	loadEnv()
	loadFirebase()

	dbpool, err := pgxpool.New(context.Background(), env.databaseUrl)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v\n", err)
	}
	defer dbpool.Close()

	querier = db.NewQuerier(dbpool)

	uri := "wss://bsky.network/xrpc/com.atproto.sync.subscribeRepos"
	con, _, err := websocket.DefaultDialer.Dial(uri, http.Header{})
	if err != nil {
		log.Fatalln(err)
	}

	rsc := &events.RepoStreamCallbacks{
		RepoIdentity: func(evt *atproto.SyncSubscribeRepos_Identity) error {
			processIdentity(evt)
			return nil
		},
		RepoCommit: func(evt *atproto.SyncSubscribeRepos_Commit) error {
			err := processCommit(evt)
			if err != nil {
				fmt.Println(err)
			}

			return nil
		},
		Error: func(evt *events.ErrorFrame) error {
			fmt.Printf("ERROR: %s (%s)\n", evt.Error, evt.Message)
			return nil
		},
	}

	sched := parallel.NewScheduler(runtime.NumCPU(), 500, "firehose", rsc.EventHandler)
	events.HandleRepoStream(context.Background(), con, sched)
}

func processIdentity(evt *atproto.SyncSubscribeRepos_Identity) {
	if evt.Handle != nil {
		user.UpdateHandle(evt.Did, *evt.Handle)
	}
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
	if evt.TooBig {
		// fmt.Println("skipping too big commit")
		return nil
	}

	if !hasUsefulOp(evt) {
		return nil
	}

	rows, err := querier.GetSubscriptions(context.Background(), evt.Repo)
	if err != nil {
		return err
	}

	if len(rows) == 0 && !user.Exists(evt.Repo) {
		return nil
	}

	messages, err := processOps(evt, rows)
	if err != nil {
		return err
	}

	for _, message := range messages {
		message.Webpush = &messaging.WebpushConfig{Headers: make(map[string]string)}
		message.Webpush.Headers["TTL"] = "43200" // 12 hours
		message.Webpush.Headers["Urgency"] = "normal"
		// I think setting the Topic header might act like an FCM topic? Was getting RESOURCE_EXHAUSTED (QUOTA_EXCEEDED)
		// message.Webpush.Headers["Topic"] = message.Data["tag"]
		responses, _ := messagingClient.SendEachForMulticast(context.Background(), &message)
		for i, response := range responses.Responses {
			if response.Success {
				continue
			}

			if !errorutils.IsNotFound(response.Error) {
				fmt.Printf("%#v\n", response.Error)
				continue
			}

			token := message.Tokens[i]
			_, err := querier.InvalidateToken(context.Background(), token)
			if err != nil {
				fmt.Println(err)
				continue
			}

			fmt.Printf("Invalidated token %s\n", token)
		}
	}

	return nil
}

func openRepo(evt *atproto.SyncSubscribeRepos_Commit, r **repo.Repo) error {
	if *r != nil {
		return nil
	}

	reader := bytes.NewReader(evt.Blocks)
	newRepo, err := repo.ReadRepoFromCar(context.Background(), reader)
	if err != nil {
		return err
	}

	*r = newRepo
	return nil
}

func processOps(evt *atproto.SyncSubscribeRepos_Commit, rows []db.GetSubscriptionsRow) ([]messaging.MulticastMessage, error) {
	var r *repo.Repo
	messages := []messaging.MulticastMessage{}

	userData, err := user.GetOrFetch(evt.Repo)
	if err != nil {
		fmt.Println(err)
		userData.Did = evt.Repo
	}

	for _, op := range evt.Ops {
		if op.Action == "update" && op.Path == "app.bsky.actor.profile/self" {
			err := openRepo(evt, &r)
			if err != nil {
				return messages, err
			}

			_, rec, err := r.GetRecord(context.Background(), op.Path)
			if err != nil {
				return messages, err
			}

			pr, ok := rec.(*bsky.ActorProfile)
			if !ok {
				return messages, fmt.Errorf("couldn't read profile record")
			}

			err = user.Update(evt.Repo, pr)
			if err != nil {
				return messages, err
			}

			continue
		}

		if op.Action == "create" && strings.HasPrefix(op.Path, "app.bsky.feed.repost/") && len(rows) > 0 {
			// TODO check applicable tokens early
			err := openRepo(evt, &r)
			if err != nil {
				return messages, err
			}

			_, record, err := r.GetRecord(context.Background(), op.Path)
			if err != nil {
				return messages, err
			}

			rp, ok := record.(*bsky.FeedRepost)
			if !ok {
				return messages, fmt.Errorf("couldn't read repost record")
			}

			message, err := repost.MakeMessage(userData, op.Path, rp)
			if err != nil {
				return messages, err
			}

			tokens := []string{}
			for _, row := range rows {
				if row.Reposts {
					tokens = append(tokens, row.Token)
				}
			}

			for chunk := range slices.Chunk(tokens, 500) {
				message.Tokens = chunk
				messages = append(messages, message)
			}

			continue
		}

		if op.Action == "create" && strings.HasPrefix(op.Path, "app.bsky.feed.post/") && len(rows) > 0 {
			// TODO check applicable tokens early
			err := openRepo(evt, &r)
			if err != nil {
				return messages, err
			}

			_, record, err := r.GetRecord(context.Background(), op.Path)
			if err != nil {
				return messages, err
			}

			p, ok := record.(*bsky.FeedPost)
			if !ok {
				return messages, fmt.Errorf("couldn't read post record")
			}

			message, reply, err := post.MakeMessage(userData, op.Path, p)
			if err != nil {
				return messages, err
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

	return messages, err
}

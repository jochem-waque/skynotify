/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package main

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"math/rand/v2"
	"os"
	"runtime"
	"slices"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/errorutils"
	"firebase.google.com/go/v4/messaging"
	"github.com/Jochem-W/skynotify/server/db"
	"github.com/Jochem-W/skynotify/server/post"
	"github.com/Jochem-W/skynotify/server/repost"
	"github.com/Jochem-W/skynotify/server/user"
	"github.com/bluesky-social/jetstream/pkg/client"
	"github.com/bluesky-social/jetstream/pkg/client/schedulers/parallel"
	"github.com/bluesky-social/jetstream/pkg/models"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lpernett/godotenv"
	"google.golang.org/api/option"
)

var env = struct {
	databaseUrl string
}{}

var messagingClient *messaging.Client

var querier *db.DBQuerier

var endpoints []string = []string{
	"wss://jetstream1.us-east.bsky.network/subscribe",
	"wss://jetstream2.us-east.bsky.network/subscribe",
	"wss://jetstream1.us-west.bsky.network/subscribe",
	"wss://jetstream2.us-west.bsky.network/subscribe",
}

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

	config := &client.ClientConfig{
		Compress:          true,
		WebsocketURL:      endpoints[rand.IntN(len(endpoints))],
		WantedDids:        []string{},
		WantedCollections: []string{"app.bsky.actor.profile", "app.bsky.feed.post", "app.bsky.feed.repost"},
		MaxSize:           0,
		ExtraHeaders: map[string]string{
			"User-Agent": "Skynotify",
		},
	}

	sched := parallel.NewScheduler(runtime.NumCPU(), "jetstream", slog.Default(), listener)

	jetstream, err := client.NewClient(config, slog.Default(), sched)
	if err != nil {
		log.Fatalln(err)
	}

	jetstream.ConnectAndRead(context.Background(), nil)
}

func listener(context context.Context, event *models.Event) error {
	var err error = nil

	switch event.Kind {
	case models.EventKindCommit:
		err = processCommitEvent(event)
	case models.EventKindIdentity:
		processIdentityEvent(event)
	default:
		return nil
	}

	if err != nil {
		fmt.Println(err)
	}

	return nil
}

func processCommitEvent(event *models.Event) error {
	switch event.Commit.Collection {
	case "app.bsky.actor.profile":
		return processProfileRecord(event)
	case "app.bsky.feed.post":
		return processPostRecord(event)
	case "app.bsky.feed.repost":
		return processRepostRecord(event)
	default:
		return nil
	}
}

func processPostRecord(event *models.Event) error {
	if event.Commit.Operation != models.CommitOperationCreate {
		return nil
	}

	message, reply, err := post.MakeMessage(event)
	if err != nil {
		return err
	}

	rows, err := querier.GetSubscriptions(context.Background(), event.Did)
	if err != nil {
		return err
	}

	// TODO this can technically be done before post.MakeMessage
	tokens := []string{}
	for _, row := range rows {
		if reply && row.Replies || !reply && row.Posts {
			tokens = append(tokens, row.Token)
		}
	}

	if len(tokens) == 0 {
		return nil
	}

	addWebpushConfig(&message)

	for chunk := range slices.Chunk(tokens, 500) {
		message.Tokens = chunk
		sendMessage(&message)
	}

	return nil
}

func processRepostRecord(event *models.Event) error {
	if event.Commit.Operation != models.CommitOperationCreate {
		return nil
	}

	// TODO boolean param for reposts
	rows, err := querier.GetSubscriptions(context.Background(), event.Did)
	if err != nil {
		return err
	}

	tokens := []string{}
	for _, row := range rows {
		if row.Reposts {
			tokens = append(tokens, row.Token)
		}
	}

	if len(tokens) == 0 {
		return nil
	}

	message, err := repost.MakeMessage(event)
	if err != nil {
		return err
	}

	addWebpushConfig(&message)

	for chunk := range slices.Chunk(tokens, 500) {
		message.Tokens = chunk
		sendMessage(&message)
	}

	return nil
}

func processProfileRecord(event *models.Event) error {
	return user.Update(event)
}

func processIdentityEvent(event *models.Event) {
	if event.Identity.Handle != nil {
		user.UpdateHandle(event.Identity.Did, *event.Identity.Handle)
	}
}

func addWebpushConfig(message *messaging.MulticastMessage) *messaging.MulticastMessage {
	message.Webpush = &messaging.WebpushConfig{Headers: make(map[string]string)}
	message.Webpush.Headers["TTL"] = "43200" // 12 hours
	message.Webpush.Headers["Urgency"] = "normal"
	// I think setting the Topic header might act like an FCM topic? Was getting RESOURCE_EXHAUSTED (QUOTA_EXCEEDED)
	// message.Webpush.Headers["Topic"] = message.Data["tag"]
	return message
}

func sendMessage(message *messaging.MulticastMessage) {
	responses, _ := messagingClient.SendEachForMulticast(context.Background(), message)
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

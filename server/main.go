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
	"slices"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"github.com/bluesky-social/indigo/api/atproto"
	"github.com/bluesky-social/indigo/events"
	"github.com/bluesky-social/indigo/events/schedulers/sequential"
	"github.com/gorilla/websocket"
	"github.com/ipfs/go-cid"
	"github.com/ipld/go-car/v2/storage"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lpernett/godotenv"
	"google.golang.org/api/option"
)

var env = struct {
	databaseUrl string
}{}

var messagingClient *messaging.Client

var querier *DBQuerier

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

	querier = NewQuerier(dbpool)

	uri := "wss://bsky.network/xrpc/com.atproto.sync.subscribeRepos"
	con, _, err := websocket.DefaultDialer.Dial(uri, http.Header{})
	if err != nil {
		log.Fatalln(err)
	}

	rsc := &events.RepoStreamCallbacks{
		RepoCommit: processCommit,
		Error: func(evt *events.ErrorFrame) error {
			fmt.Printf("ERROR: %s (%s)\n", evt.Error, evt.Message)
			return nil
		},
	}

	sched := sequential.NewScheduler("firehose", rsc.EventHandler)
	events.HandleRepoStream(context.Background(), con, sched)
}

func processCommit(evt *atproto.SyncSubscribeRepos_Commit) error {
	rows, err := querier.GetSubscriptions(context.Background(), evt.Repo)
	if err != nil {
		fmt.Println(err)
		return nil
	}

	if len(rows) == 0 {
		return nil
	}

	user, err := getOrFetchUser(evt.Repo)
	if err != nil {
		fmt.Println(err)
		user.Did = evt.Repo
	}

	var car storage.ReadableCar
	messages := []messaging.MulticastMessage{}

	for _, op := range evt.Ops {
		// TODO support reposts
		// TODO support profile updates
		if op.Action != "create" || !strings.HasPrefix(op.Path, "app.bsky.feed.post/") {
			continue
		}

		if car == nil {
			reader := bytes.NewReader(evt.Blocks)
			car, err = storage.OpenReadable(reader)
			if err != nil {
				fmt.Println(err)
				return nil
			}
		}

		data, err := getPostData(car, cid.MustParse(op.Cid.String()).KeyString())
		if err != nil {
			fmt.Println(err)
			return nil
		}

		tokens := []string{}
		for _, row := range rows {
			if data.reply && *row.Replies || !data.reply && *row.Posts {
				tokens = append(tokens, *row.Token)
			}
		}

		message, err := makeMessage(user, op, data)
		if err != nil {
			fmt.Println(err)
			return nil
		}

		for chunk := range slices.Chunk(tokens, 500) {
			message.Tokens = chunk
			messages = append(messages, message)
		}
	}

	for _, message := range messages {
		responses, _ := messagingClient.SendEachForMulticast(context.Background(), &message)
		for _, response := range responses.Responses {
			if !response.Success {
				fmt.Println(response.Error)
			}
		}
	}

	return nil
}

func makeMessage(user User, op *atproto.SyncSubscribeRepos_RepoOp, data postData) (messaging.MulticastMessage, error) {
	message := messaging.MulticastMessage{}

	_, pid, found := strings.Cut(op.Path, "/")
	if !found {
		return message, fmt.Errorf("couldn't split post ID from %s", op.Path)
	}

	messageData := make(map[string]string)
	messageData["title"] = user.Did
	messageData["body"] = data.text
	messageData["tag"] = op.Path
	messageData["url"] = fmt.Sprintf("https://bsky.app/profile/%s/post/%s", user.Did, pid)

	if data.imageRef != "" {
		messageData["image"] = fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", user.Did, data.imageRef)
	}

	if user.DisplayName != "" {
		messageData["title"] = user.DisplayName
	}

	if user.Avatar != "" {
		messageData["icon"] = fmt.Sprintf("https://cdn.bsky.app/img/avatar_thumbnail/plain/%s/%s@jpeg", user.Did, user.Avatar)
	}

	return message, nil
}

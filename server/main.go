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
	"sync"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"github.com/bluesky-social/indigo/api/atproto"
	"github.com/bluesky-social/indigo/events"
	"github.com/bluesky-social/indigo/events/schedulers/sequential"
	"github.com/gorilla/websocket"
	"github.com/ipfs/go-cid"
	"github.com/ipld/go-car/v2/storage"
	"github.com/ipld/go-ipld-prime/codec/dagcbor"
	"github.com/ipld/go-ipld-prime/datamodel"
	"github.com/ipld/go-ipld-prime/node/basicnode"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lpernett/godotenv"
	"google.golang.org/api/option"
)

type user struct {
	displayName string
	avatar      string
}

type postData struct {
	text     string
	imageRef string
	reply    bool
}

var users = struct {
	sync.RWMutex
	m map[string]user
}{m: make(map[string]user)}

var env = struct {
	hostname    string
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

	env.hostname = os.Getenv("HOSTNAME")
	if env.hostname == "" {
		log.Fatalln("Environment variable HOSTNAME is not set")
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
		RepoCommit: func(evt *atproto.SyncSubscribeRepos_Commit) error {
			rows, err := querier.GetSubscriptions(context.Background(), evt.Repo)
			if err != nil {
				fmt.Println(err)
				return nil
			}

			if len(rows) == 0 {
				return nil
			}

			var car storage.ReadableCar
			messages := []messaging.MulticastMessage{}

			for _, op := range evt.Ops {
				// TODO support reposts
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

				message, err := makeMessage(evt.Repo, op, data)
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
		},
		Error: func(evt *events.ErrorFrame) error {
			fmt.Printf("ERROR: %s (%s)\n", evt.Error, evt.Message)
			return nil
		},
	}

	sched := sequential.NewScheduler("firehose", rsc.EventHandler)
	events.HandleRepoStream(context.Background(), con, sched)
}

func makeMessage(did string, op *atproto.SyncSubscribeRepos_RepoOp, data postData) (messaging.MulticastMessage, error) {
	message := messaging.MulticastMessage{}

	_, pid, found := strings.Cut(op.Path, "/")
	if !found {
		return message, fmt.Errorf("couldn't split post ID from %s", op.Path)
	}

	message.Notification = &messaging.Notification{
		// TODO
		// Title: entry.DisplayName,
		Body: data.text,
	}
	message.Webpush = &messaging.WebpushConfig{
		Notification: &messaging.WebpushNotification{
			Badge: "/badge.png",
			// TODO
			// Icon:  entry.Avatar,
			Tag: op.Path,
		},
		FCMOptions: &messaging.WebpushFCMOptions{
			Link: fmt.Sprintf("https://%s/profile/%s/post/%s", env.hostname, did, pid),
		},
	}

	if data.imageRef != "" {
		message.Notification.ImageURL = fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", did, data.imageRef)
	}

	return message, nil
}

func getPostData(car storage.ReadableCar, cid string) (postData, error) {
	data := postData{}

	blk, err := car.Get(context.Background(), cid)
	if err != nil {
		return data, err
	}

	reader := bytes.NewReader(blk)

	nb := basicnode.Prototype.Any.NewBuilder()
	err = dagcbor.Decode(nb, reader)
	if err != nil {
		return data, err
	}

	n := nb.Build()
	text, err := extractText(n)
	if err != nil {
		return data, err
	}

	data.text = text
	data.reply = isReply(n)

	imageRef, err := extractImage(n)
	if err != nil {
		return data, err
	}

	data.imageRef = imageRef

	return data, nil
}

func extractText(node datamodel.Node) (string, error) {
	text, err := node.LookupByString("text")
	// TODO: figure out how to check if it's ErrNotExists
	if err != nil {
		return "", err
	}

	textstr, err := text.AsString()
	if err != nil {
		return "", err
	}

	return textstr, nil
}

func isReply(node datamodel.Node) bool {
	// TODO: figure out how to check if it's ErrNotExists
	_, err := node.LookupByString("reply")
	return err == nil
}

func extractImage(node datamodel.Node) (string, error) {
	embed, err := node.LookupByString("embed")
	// TODO: figure out how to check if it's ErrNotExists
	if err != nil {
		return "", nil
	}

	images, err := embed.LookupByString("images")
	// TODO: figure out how to check if it's ErrNotExists
	// TODO: support other embed types
	if err != nil {
		return "", nil
	}

	it := images.ListIterator()
	if it == nil {
		return "", datamodel.ErrWrongKind{
			TypeName:        "",
			MethodName:      "ListIterator",
			AppropriateKind: datamodel.KindSet{datamodel.Kind_List},
			ActualKind:      images.Kind(),
		}
	}

	_, entry, err := it.Next()
	if err != nil {
		return "", err
	}

	image, err := entry.LookupByString("image")
	if err != nil {
		return "", err
	}

	ref, err := image.LookupByString("ref")
	if err != nil {
		return "", err
	}

	linkNode, err := ref.AsLink()
	if err != nil {
		return "", err
	}

	return linkNode.String(), nil
}

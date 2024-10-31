/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"firebase.google.com/go/v4/messaging"
	"github.com/ipld/go-car/v2/storage"
	"github.com/ipld/go-ipld-prime/codec/dagcbor"
	"github.com/ipld/go-ipld-prime/datamodel"
	"github.com/ipld/go-ipld-prime/node/basicnode"
)

type Post struct {
	Uri    string `json:"uri"`
	Author Author `json:"author"`
	Record Record `json:"record"`
	Embed  Embed  `json:"embed,omitempty"`
}

type Author struct {
	Did    string `json:"did"`
	Handle string `json:"handle"`
}

type Record struct {
	Text string `json:"text,omitempty"`
}

type Embed struct {
	Media Media `json:"media,omitempty"`
}

type Media struct {
	Images []Image `json:"images,omitempty"`
}

type Image struct {
	Thumb string `json:"thumb"`
}

type repostData struct {
	uri       string
	createdAt string
}

func makeRepostMessage(car storage.ReadableCar, cid string, path string, user User) (messaging.MulticastMessage, error) {
	message := messaging.MulticastMessage{}

	data, err := parseRepostOp(car, cid)
	if err != nil {
		return message, err
	}

	response, err := httpClient.Get(fmt.Sprintf("https://public.api.bsky.app/xrpc/app.bsky.feed.getPosts?uris=%s", data.uri))
	if err != nil {
		return message, err
	}

	post := Post{}
	err = json.NewDecoder(response.Body).Decode(&post)
	if err != nil {
		return message, err
	}

	slash := strings.LastIndex(post.Uri, "/")
	if slash == -1 {
		return message, fmt.Errorf("couldn't split uri %s", post.Uri)
	}

	timestamp, err := time.Parse(time.RFC3339, data.createdAt)
	if err != nil {
		return message, err
	}

	pid := post.Uri[slash+1:]

	message.Data = make(map[string]string)
	message.Data["title"] = user.Handle
	message.Data["body"] = fmt.Sprintf("@%s: %s", post.Author.Handle, post.Record.Text)
	message.Data["tag"] = path
	message.Data["url"] = fmt.Sprintf("https://bsky.app/profile/%s/post/%s", post.Author.Did, pid)
	message.Data["timestamp"] = strconv.FormatInt(timestamp.UnixMilli(), 10)

	if len(post.Embed.Media.Images) > 0 {
		message.Data["image"] = post.Embed.Media.Images[0].Thumb
	}

	if user.DisplayName != "" {
		message.Data["title"] = user.DisplayName
	}

	if user.Avatar != "" {
		message.Data["icon"] = fmt.Sprintf("https://cdn.bsky.app/img/avatar_thumbnail/plain/%s/%s@jpeg", user.Did, user.Avatar)
	}

	message.Data["title"] += " reposted"

	return message, nil
}

func parseRepostOp(car storage.ReadableCar, cid string) (repostData, error) {
	data := repostData{}

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
	uri, err := extractUri(n)
	if err != nil {
		return data, err
	}

	data.uri = uri

	createdAt, err := extractCreatedAt(n)
	if err != nil {
		return data, err
	}

	data.createdAt = createdAt

	return data, nil
}

func extractUri(node datamodel.Node) (string, error) {
	subject, err := node.LookupByString("subject")
	if err != nil {
		return "", err
	}

	uri, err := subject.LookupByString("uri")
	if err != nil {
		return "", err
	}

	uriStr, err := uri.AsString()
	if err != nil {
		return "", err
	}

	return uriStr, nil
}

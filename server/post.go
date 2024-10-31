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

func makePostMessage(car storage.ReadableCar, cid string, path string, user User) (messaging.MulticastMessage, bool, error) {
	message := messaging.MulticastMessage{}

	_, pid, found := strings.Cut(path, "/")
	if !found {
		return message, false, fmt.Errorf("couldn't cut pid from %s", path)
	}

	blk, err := car.Get(context.Background(), cid)
	if err != nil {
		return message, false, err
	}

	reader := bytes.NewReader(blk)

	nb := basicnode.Prototype.Any.NewBuilder()
	err = dagcbor.Decode(nb, reader)
	if err != nil {
		return message, false, err
	}

	n := nb.Build()
	text, err := extractText(n)
	if err != nil {
		return message, false, err
	}

	imageRef, err := extractImage(n)
	if err != nil {
		return message, false, err
	}

	createdAt, err := extractCreatedAt(n)
	if err != nil {
		return message, false, err
	}

	timestamp, err := time.Parse(time.RFC3339, createdAt)
	if err != nil {
		return message, false, err
	}

	message.Data = make(map[string]string)
	message.Data["title"] = user.Handle
	message.Data["body"] = text
	message.Data["tag"] = path
	message.Data["url"] = fmt.Sprintf("https://bsky.app/profile/%s/post/%s", user.Did, pid)
	message.Data["timestamp"] = strconv.FormatInt(timestamp.UnixMilli(), 10)
	message.Data["image"] = fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", user.Did, imageRef)

	if user.Avatar != "" {
		message.Data["icon"] = fmt.Sprintf("https://cdn.bsky.app/img/avatar_thumbnail/plain/%s/%s@jpeg", user.Did, user.Avatar)
	}

	if user.DisplayName != "" {
		message.Data["title"] = user.DisplayName
	}

	parent, err := extractParent(n)
	if err != nil {
		return message, false, err
	}

	reply := parent != ""
	if reply {
		handle, err := getParentHandle(parent)
		if err != nil {
			return message, reply, err
		}

		message.Data["title"] += " replied"
		message.Data["body"] = fmt.Sprintf("@%s %s", handle, message.Data["body"])
	}

	return message, reply, nil
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

func extractCreatedAt(node datamodel.Node) (string, error) {
	createdAt, err := node.LookupByString("createdAt")
	// TODO: figure out how to check if it's ErrNotExists
	if err != nil {
		return "", err
	}

	createdAtStr, err := createdAt.AsString()
	if err != nil {
		return "", err
	}

	return createdAtStr, nil
}

func extractParent(node datamodel.Node) (string, error) {
	// TODO: figure out how to check if it's ErrNotExists
	reply, err := node.LookupByString("reply")
	if err != nil {
		return "", nil
	}

	parent, err := reply.LookupByString("parent")
	if err != nil {
		return "", err
	}

	uri, err := parent.LookupByString("uri")
	if err != nil {
		return "", err
	}

	return uri.AsString()
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

func getParentHandle(uri string) (string, error) {
	response, err := httpClient.Get(fmt.Sprintf("https://public.api.bsky.app/xrpc/app.bsky.feed.getPosts?uris=%s", uri))
	if err != nil {
		return "", err
	}

	jsonResponse := Response{}
	err = json.NewDecoder(response.Body).Decode(&jsonResponse)
	if err != nil {
		return "", err
	}

	if len(jsonResponse.Posts) == 0 {
		return "", fmt.Errorf("no posts for uri %s", uri)
	}

	post := jsonResponse.Posts[0]

	return post.Author.Handle, nil
}

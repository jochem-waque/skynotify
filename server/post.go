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

	message.Data["title"] = user.Handle
	message.Data["body"] = text
	message.Data["tag"] = path
	message.Data["url"] = fmt.Sprintf("https://bsky.app/profile/%s/post/%s", user.Did, pid)
	message.Data["timestamp"] = strconv.FormatInt(timestamp.UnixMilli(), 10)
	message.Data["image"] = imageRef

	if user.Avatar != "" {
		message.Data["icon"] = fmt.Sprintf("https://cdn.bsky.app/img/avatar_thumbnail/plain/%s/%s@jpeg", user.Did, user.Avatar)
	}

	reply := isReply(n)
	if reply {
		// TODO add handle to body
		message.Data["title"] += " replied"
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

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package post

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/Jochem-W/skynotify/server/internal"
	"github.com/Jochem-W/skynotify/server/users"

	"firebase.google.com/go/v4/messaging"
	"github.com/ipld/go-car/v2/storage"
	"github.com/ipld/go-ipld-prime/codec/dagcbor"
	"github.com/ipld/go-ipld-prime/datamodel"
	"github.com/ipld/go-ipld-prime/node/basicnode"
)

func MakeMessage(car storage.ReadableCar, cid string, path string, user users.User) (messaging.MulticastMessage, bool, error) {
	message := messaging.MulticastMessage{FCMOptions: &messaging.FCMOptions{AnalyticsLabel: "post"}}

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

	imageRef, err := extractImageThumb(n)
	if err != nil {
		return message, false, err
	}

	if imageRef == "" {
		imageRef, err = extractVideoThumbnail(n, user.Did)
		if err != nil {
			return message, false, err
		}
	}

	if imageRef == "" {
		imageRef, err = extractExternalThumb(n)
		if err != nil {
			return message, false, err
		}
	}

	createdAt, err := internal.ExtractCreatedAt(n)
	if err != nil {
		return message, false, err
	}

	timestamp, err := time.Parse(time.RFC3339, createdAt)
	if err != nil {
		return message, false, err
	}

	quoted, err := extractQuote(n)
	if err != nil {
		return message, false, err
	}

	message.Data = make(map[string]string)
	message.Data["title"] = user.Handle
	message.Data["body"] = text
	message.Data["tag"] = path
	message.Data["url"] = fmt.Sprintf("https://bsky.app/profile/%s/post/%s", user.Did, pid)
	message.Data["timestamp"] = strconv.FormatInt(timestamp.UnixMilli(), 10)

	if imageRef != "" {
		message.Data["image"] = fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", user.Did, imageRef)
	}

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

	isReply := parent != ""
	isQuote := quoted != ""
	if isReply {
		message.FCMOptions.AnalyticsLabel = "reply"

		handle, err := getParentHandle(parent)
		if err != nil {
			return message, isReply, err
		}

		message.Data["title"] += " replied"
		message.Data["body"] = fmt.Sprintf("@%s %s", handle, message.Data["body"])
	} else if isQuote {
		message.Data["title"] += " quoted"
		message.Data["body"] = fmt.Sprintf("%s @%s", message.Data["body"], quoted)
	}

	return message, isReply, nil
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

func extractQuote(node datamodel.Node) (string, error) {
	embed, err := node.LookupByString("embed")
	// TODO: figure out how to check if it's ErrNotExists
	if err != nil {
		return "", nil
	}

	record, err := embed.LookupByString("record")
	if err != nil {
		return "", nil
	}

	uri, err := record.LookupByString("uri")
	if err != nil {
		return "", err
	}

	uriString, err := uri.AsString()
	if err != nil {
		return "", err
	}

	after, found := strings.CutPrefix(uriString, "at://")
	if !found {
		return "", fmt.Errorf("couldn't cut prefix at:// from %s", uriString)
	}

	did, _, found := strings.Cut(after, "/")
	if !found {
		return "", fmt.Errorf("couldn't cut DID from %s", after)
	}

	user, err := users.GetOrFetch(did)
	if err != nil {
		return "", err
	}

	if user.DisplayName == "" {
		return user.Handle, nil
	}

	return user.DisplayName, nil
}

func extractImageThumb(node datamodel.Node) (string, error) {
	embed, err := node.LookupByString("embed")
	// TODO: figure out how to check if it's ErrNotExists
	if err != nil {
		return "", nil
	}

	images, err := embed.LookupByString("images")
	if err != nil {
		media, err := embed.LookupByString("media")
		if err != nil {
			return "", nil
		}

		images, err = media.LookupByString("images")
		if err != nil {
			return "", nil
		}
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

func extractVideoThumbnail(node datamodel.Node, did string) (string, error) {
	embed, err := node.LookupByString("embed")
	// TODO: figure out how to check if it's ErrNotExists
	if err != nil {
		return "", nil
	}

	video, err := embed.LookupByString("video")
	if err != nil {
		media, err := embed.LookupByString("media")
		if err != nil {
			return "", nil
		}

		video, err = media.LookupByString("video")
		if err != nil {
			return "", nil
		}
	}

	thumbnail, err := video.LookupByString("thumbnail")
	if err != nil {
		ref, err := video.LookupByString("ref")
		if err != nil {
			return "", err
		}

		linkNode, err := ref.AsLink()
		if err != nil {
			return "", err
		}

		return fmt.Sprintf("https://video.bsky.app/watch/%s/%s/thumbnail.jpg", did, linkNode.String()), nil
	}

	ref, err := thumbnail.LookupByString("ref")
	if err != nil {
		return "", err
	}

	linkNode, err := ref.AsLink()
	if err != nil {
		return "", err
	}

	return linkNode.String(), nil
}

func extractExternalThumb(node datamodel.Node) (string, error) {
	embed, err := node.LookupByString("embed")
	// TODO: figure out how to check if it's ErrNotExists
	if err != nil {
		return "", nil
	}

	external, err := embed.LookupByString("external")
	if err != nil {
		media, err := embed.LookupByString("media")
		if err != nil {
			return "", nil
		}

		external, err = media.LookupByString("external")
		if err != nil {
			return "", nil
		}
	}

	thumb, err := external.LookupByString("thumb")
	if err != nil {
		return "", nil
	}

	ref, err := thumb.LookupByString("ref")
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
	response, err := internal.HttpClient.Get(fmt.Sprintf("https://public.api.bsky.app/xrpc/app.bsky.feed.getPosts?uris=%s", uri))
	if err != nil {
		return "", err
	}

	jsonResponse := internal.PostsResponse{}
	err = json.NewDecoder(response.Body).Decode(&jsonResponse)
	if err != nil {
		return "", err
	}

	if len(jsonResponse.Posts) == 0 {
		// TODO retry?
		return "", fmt.Errorf("no posts for uri %s", uri)
	}

	post := jsonResponse.Posts[0]

	return post.Author.Handle, nil
}

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
	"github.com/Jochem-W/skynotify/server/user"

	"firebase.google.com/go/v4/messaging"
	"github.com/ipld/go-car/v2/storage"
	"github.com/ipld/go-ipld-prime/codec/dagcbor"
	"github.com/ipld/go-ipld-prime/datamodel"
	"github.com/ipld/go-ipld-prime/node/basicnode"
)

type embedData struct {
	Images []struct {
		Thumb string `json:"thumb"`
	} `json:"images,omitempty"`
	Video struct {
		Thumbnail string `json:"thumbnail,omitempty"`
	} `json:"video,omitempty"`
	External struct {
		Thumb string `json:"thumb,omitempty"`
	} `json:"external,omitempty"`
}

type PostsResponse struct {
	Posts []struct {
		Uri    string `json:"uri"`
		Author struct {
			Did    string `json:"did"`
			Handle string `json:"handle"`
		} `json:"author"`
		Record struct {
			Text string `json:"text,omitempty"`
		} `json:"record"`
		Embed struct {
			embedData
			Media embedData `json:"media,omitempty"`
		} `json:"embed,omitempty"`
	} `json:"posts"`
}

func ExtractCreatedAt(node datamodel.Node) (string, error) {
	createdAt, err := node.LookupByString("createdAt")
	if err != nil {
		return "", err
	}

	createdAtStr, err := createdAt.AsString()
	if err != nil {
		return "", err
	}

	return createdAtStr, nil
}

func MakeMessage(car storage.ReadableCar, cid string, path string, user user.User) (messaging.MulticastMessage, bool, error) {
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

	createdAt, err := ExtractCreatedAt(n)
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
	if err != nil {
		return "", internal.IgnoreNotExists(err)
	}

	textstr, err := text.AsString()
	if err != nil {
		return "", err
	}

	return textstr, nil
}

func extractParent(node datamodel.Node) (string, error) {
	reply, err := node.LookupByString("reply")
	if err != nil {
		return "", internal.IgnoreNotExists(err)
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
	if err != nil {
		return "", internal.IgnoreNotExists(err)
	}

	record, err := embed.LookupByString("record")
	if err != nil {
		return "", internal.IgnoreNotExists(err)
	}

	uri, err := record.LookupByString("uri")
	if !internal.IsNotExists(err) {
		return "", err
	}

	if err != nil {
		record, err = record.LookupByString("record")
		if err != nil {
			return "", err
		}

		uri, err = record.LookupByString("uri")
		if err != nil {
			return "", err
		}
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

	user, err := user.GetOrFetch(did)
	if err != nil {
		return "", err
	}

	return user.Handle, nil
}

func extractImageThumb(node datamodel.Node) (string, error) {
	embed, err := node.LookupByString("embed")
	if err != nil {
		return "", internal.IgnoreNotExists(err)
	}

	images, err := embed.LookupByString("images")
	if !internal.IsNotExists(err) {
		return "", err
	}

	if err != nil {
		media, err := embed.LookupByString("media")
		if err != nil {
			return "", internal.IgnoreNotExists(err)
		}

		images, err = media.LookupByString("images")
		if err != nil {
			return "", internal.IgnoreNotExists(err)
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
	if err != nil {
		return "", internal.IgnoreNotExists(err)
	}

	video, err := embed.LookupByString("video")
	if !internal.IsNotExists(err) {
		return "", err
	}

	if err != nil {
		media, err := embed.LookupByString("media")
		if err != nil {
			return "", internal.IgnoreNotExists(err)
		}

		video, err = media.LookupByString("video")
		if err != nil {
			return "", internal.IgnoreNotExists(err)
		}
	}

	thumbnail, err := video.LookupByString("thumbnail")
	if !internal.IsNotExists(err) {
		return "", err
	}

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
	if err != nil {
		return "", internal.IgnoreNotExists(err)
	}

	external, err := embed.LookupByString("external")
	if !internal.IsNotExists(err) {
		return "", err
	}

	if err != nil {
		media, err := embed.LookupByString("media")
		if err != nil {
			return "", internal.IgnoreNotExists(err)
		}

		external, err = media.LookupByString("external")
		if err != nil {
			return "", internal.IgnoreNotExists(err)
		}
	}

	thumb, err := external.LookupByString("thumb")
	if err != nil {
		return "", internal.IgnoreNotExists(err)
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

	jsonResponse := PostsResponse{}
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

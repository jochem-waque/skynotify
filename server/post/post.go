/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package post

import (
	"bytes"
	"context"
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

func MakeMessage(car storage.ReadableCar, cid string, path string, userData user.User) (messaging.MulticastMessage, bool, error) {
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
		imageRef, err = extractVideoThumbnail(n, userData.Did)
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

	tag := path[strings.LastIndex(path, ".")+1:]
	if len(tag) > 32 {
		tag = tag[:32]
	}

	message.Data = make(map[string]string)
	message.Data["title"] = userData.Handle
	message.Data["body"] = text
	message.Data["tag"] = tag
	message.Data["url"] = fmt.Sprintf("https://bsky.app/profile/%s/post/%s", userData.Did, pid)
	message.Data["timestamp"] = strconv.FormatInt(timestamp.UnixMilli(), 10)

	if imageRef != "" {
		message.Data["image"] = fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", userData.Did, imageRef)
	}

	if userData.Avatar != "" {
		message.Data["icon"] = fmt.Sprintf("https://cdn.bsky.app/img/avatar_thumbnail/plain/%s/%s@jpeg", userData.Did, userData.Avatar)
	}

	if userData.DisplayName != "" {
		message.Data["title"] = userData.DisplayName
	}

	parent, err := extractParentDid(n)
	if err != nil {
		return message, false, err
	}

	isReply := parent != ""
	isQuote := quoted != ""
	if isReply {
		message.FCMOptions.AnalyticsLabel = "reply"

		parentUser, err := user.GetOrFetch(parent)
		if err != nil {
			return message, isReply, err
		}

		message.Data["title"] += " replied"
		message.Data["body"] = fmt.Sprintf("@%s %s", parentUser.Handle, message.Data["body"])
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

func extractParentDid(node datamodel.Node) (string, error) {
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

	uriString, err := uri.AsString()
	if err != nil {
		return "", err
	}

	noPrefix, found := strings.CutPrefix(uriString, "at://")
	if !found {
		return "", fmt.Errorf("extractParentDid: couldn't cut prefix at:// from %s", uriString)
	}

	did, _, found := strings.Cut(noPrefix, "/")
	if !found {
		return "", fmt.Errorf("extractParentDid: couldn't cut did from %s", noPrefix)

	}

	return did, nil
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
	if err != nil {
		if !internal.IsNotExists(err) {
			return "", err
		}

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
	if err != nil {
		if !internal.IsNotExists(err) {
			return "", err
		}

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
	if err != nil {
		if !internal.IsNotExists(err) {
			return "", err
		}

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
	if err != nil {
		if !internal.IsNotExists(err) {
			return "", err
		}

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
	if err != nil {
		if !internal.IsNotExists(err) {
			return "", err
		}

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

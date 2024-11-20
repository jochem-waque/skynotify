/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package repost

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"firebase.google.com/go/v4/messaging"
	"github.com/Jochem-W/skynotify/server/internal"
	"github.com/Jochem-W/skynotify/server/post"
	"github.com/Jochem-W/skynotify/server/user"
	"github.com/ipld/go-car/v2/storage"
	"github.com/ipld/go-ipld-prime/codec/dagcbor"
	"github.com/ipld/go-ipld-prime/datamodel"
	"github.com/ipld/go-ipld-prime/node/basicnode"
)

type record struct {
	Value struct {
		Text  string `json:"text,omitempty"`
		Embed struct {
			embedData
			Media embedData `json:"media,omitempty"`
		} `json:"embed,omitempty"`
	} `json:"value"`
}

type embedData struct {
	Images []struct {
		Image struct {
			Ref struct {
				Link string `json:"$link"`
			} `json:"ref"`
		} `json:"image"`
	} `json:"images,omitempty"`
	Video struct {
		Ref struct {
			Link string `json:"$link"`
		} `json:"ref"`
	} `json:"video,omitempty"`
	External struct {
		Thumb struct {
			Ref struct {
				Link string `json:"$link"`
			} `json:"ref"`
		} `json:"thumb,omitempty"`
	} `json:"external,omitempty"`
}

func MakeMessage(car storage.ReadableCar, cid string, path string, userData user.User) (messaging.MulticastMessage, error) {
	message := messaging.MulticastMessage{FCMOptions: &messaging.FCMOptions{AnalyticsLabel: "repost"}}

	uri, createdAt, err := parseRepostOp(car, cid)
	if err != nil {
		return message, err
	}

	atUri, err := internal.CutAtUri(uri)
	if err != nil {
		return message, err
	}

	response, err := internal.HttpClient.Get(fmt.Sprintf("https://bsky.social/xrpc/com.atproto.repo.getRecord?repo=%s&collection=%s&rkey=%s", atUri.Did, atUri.Collection, atUri.RecordKey))
	if err != nil {
		return message, err
	}

	if response.StatusCode != 200 {
		return message, fmt.Errorf("repost.MakeMessage: response status %s", response.Status)
	}

	post := record{}
	err = json.NewDecoder(response.Body).Decode(&post)
	if err != nil {
		return message, err
	}

	author, err := user.GetOrFetch(atUri.Did)
	if err != nil {
		return message, err
	}

	timestamp, err := time.Parse(time.RFC3339, createdAt)
	if err != nil {
		return message, err
	}

	tag := path[strings.LastIndex(path, ".")+1:]
	if len(tag) > 32 {
		tag = tag[:32]
	}

	message.Data = make(map[string]string)
	message.Data["title"] = userData.Handle
	message.Data["body"] = fmt.Sprintf("@%s: %s", author.Handle, post.Value.Text)
	message.Data["tag"] = tag
	message.Data["url"] = fmt.Sprintf("https://bsky.app/profile/%s/post/%s", atUri.Did, atUri.RecordKey)
	message.Data["timestamp"] = strconv.FormatInt(timestamp.UnixMilli(), 10)

	if len(post.Value.Embed.Images) > 0 {
		message.Data["image"] = fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", atUri.Did, post.Value.Embed.Images[0].Image.Ref.Link)
	} else if len(post.Value.Embed.Media.Images) > 0 {
		message.Data["image"] = fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", atUri.Did, post.Value.Embed.Media.Images[0].Image.Ref.Link)
	} else if post.Value.Embed.Video.Ref.Link != "" {
		message.Data["image"] = fmt.Sprintf("https://video.bsky.app/watch/%s/%s/thumbnail.jpg", atUri.Did, post.Value.Embed.Video.Ref.Link)
	} else if post.Value.Embed.Media.Video.Ref.Link != "" {
		message.Data["image"] = fmt.Sprintf("https://video.bsky.app/watch/%s/%s/thumbnail.jpg", atUri.Did, post.Value.Embed.Media.Video.Ref.Link)
	} else if post.Value.Embed.External.Thumb.Ref.Link != "" {
		message.Data["image"] = fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", atUri.Did, post.Value.Embed.External.Thumb.Ref.Link)
	} else if post.Value.Embed.Media.External.Thumb.Ref.Link != "" {
		message.Data["image"] = fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", atUri.Did, post.Value.Embed.Media.External.Thumb.Ref.Link)
	}

	if userData.DisplayName != "" {
		message.Data["title"] = userData.DisplayName
	}

	if userData.Avatar != "" {
		message.Data["icon"] = fmt.Sprintf("https://cdn.bsky.app/img/avatar_thumbnail/plain/%s/%s@jpeg", userData.Did, userData.Avatar)
	}

	message.Data["title"] += " reposted"

	return message, nil
}

func parseRepostOp(car storage.ReadableCar, cid string) (string, string, error) {
	blk, err := car.Get(context.Background(), cid)
	if err != nil {
		return "", "", err
	}

	reader := bytes.NewReader(blk)

	nb := basicnode.Prototype.Any.NewBuilder()
	err = dagcbor.Decode(nb, reader)
	if err != nil {
		return "", "", err
	}

	n := nb.Build()
	uri, err := extractUri(n)
	if err != nil {
		return "", "", err
	}

	createdAt, err := post.ExtractCreatedAt(n)
	if err != nil {
		return uri, "", err
	}

	return uri, createdAt, nil
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

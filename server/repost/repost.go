/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package repost

import (
	"encoding/json"
	"fmt"
	"strconv"

	"firebase.google.com/go/v4/messaging"
	"github.com/Jochem-W/skynotify/server/internal"
	"github.com/Jochem-W/skynotify/server/user"
	"github.com/bluesky-social/indigo/api/bsky"
	"github.com/bluesky-social/jetstream/pkg/models"
)

type getRecord_Response struct {
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

func MakeMessage(event *models.Event) (messaging.MulticastMessage, error) {
	message := messaging.MulticastMessage{FCMOptions: &messaging.FCMOptions{AnalyticsLabel: "repost"}}

	repost := &bsky.FeedRepost{}
	err := json.Unmarshal(event.Commit.Record, &repost)
	if err != nil {
		return message, err
	}

	userData, err := user.GetOrFetch(event.Did)
	if err != nil {
		return message, err
	}

	atUri, err := internal.CutAtUri(repost.Subject.Uri)
	if err != nil {
		return message, err
	}

	author, err := user.GetOrFetch(atUri.Did)
	if err != nil {
		return message, err
	}

	// TODO this should just work no?
	// output, err := atproto.RepoGetRecord(context.Background(), internal.XrpcClient, "", atUri.Collection, atUri.Did, atUri.RecordKey)
	// if err != nil {
	// 	return message, err
	// }

	// decoded := output.Value.Val.(*bsky.FeedPost)

	response, err := internal.HttpClient.Get(fmt.Sprintf("https://bsky.social/xrpc/com.atproto.repo.getRecord?repo=%s&collection=%s&rkey=%s", atUri.Did, atUri.Collection, atUri.RecordKey))
	if err != nil {
		return message, err
	}

	if response.StatusCode != 200 {
		return message, fmt.Errorf("repost.MakeMessage: response status %s", response.Status)
	}

	decoded := getRecord_Response{}
	err = json.NewDecoder(response.Body).Decode(&decoded)
	if err != nil {
		return message, err
	}

	message.Data = make(map[string]string)
	message.Data["title"] = userData.Handle
	message.Data["body"] = fmt.Sprintf("@%s: %s", author.Handle, decoded.Value.Text)
	message.Data["tag"] = internal.GenerateTag(event)
	message.Data["url"] = fmt.Sprintf("https://bsky.app/profile/%s/post/%s", atUri.Did, atUri.RecordKey)
	message.Data["timestamp"] = strconv.FormatInt(event.TimeUS/1000, 10)

	image := extractImage(author.Did, decoded)
	if image != "" {
		message.Data["image"] = image
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

func extractImage(did string, record getRecord_Response) string {
	if len(record.Value.Embed.Images) > 0 {
		return fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", did, record.Value.Embed.Images[0].Image.Ref.Link)
	}

	if record.Value.Embed.Video.Ref.Link != "" {
		return fmt.Sprintf("https://video.bsky.app/watch/%s/%s/thumbnail.jpg", did, record.Value.Embed.Video.Ref.Link)
	}

	if record.Value.Embed.External.Thumb.Ref.Link != "" {
		return fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", did, record.Value.Embed.External.Thumb.Ref.Link)
	}

	if len(record.Value.Embed.Media.Images) > 0 {
		return fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", did, record.Value.Embed.Media.Images[0].Image.Ref.Link)
	}

	if record.Value.Embed.Media.Video.Ref.Link != "" {
		return fmt.Sprintf("https://video.bsky.app/watch/%s/%s/thumbnail.jpg", did, record.Value.Embed.Media.Video.Ref.Link)
	}

	if record.Value.Embed.Media.External.Thumb.Ref.Link != "" {
		return fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", did, record.Value.Embed.Media.External.Thumb.Ref.Link)
	}

	return ""
}

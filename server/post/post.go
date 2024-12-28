/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package post

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/Jochem-W/skynotify/server/internal"
	"github.com/Jochem-W/skynotify/server/user"
	"github.com/bluesky-social/indigo/api/bsky"
	"github.com/bluesky-social/indigo/atproto/syntax"

	"firebase.google.com/go/v4/messaging"
)

func MakeMessage(userData *user.User, path string, post *bsky.FeedPost) (messaging.MulticastMessage, bool, error) {
	message := messaging.MulticastMessage{FCMOptions: &messaging.FCMOptions{AnalyticsLabel: "post"}}

	_, pid, found := strings.Cut(path, "/")
	if !found {
		return message, false, fmt.Errorf("post.MakeMessage: couldn't cut pid from %s", path)
	}

	timestamp, err := time.Parse(time.RFC3339, post.CreatedAt)
	if err != nil {
		return message, false, fmt.Errorf("post.MakeMessage: %w", err)
	}

	message.Data = make(map[string]string)
	message.Data["title"] = userData.Handle
	message.Data["body"] = post.Text
	message.Data["tag"] = internal.GenerateTag(path)
	message.Data["url"] = fmt.Sprintf("https://bsky.app/profile/%s/post/%s", userData.Did, pid)
	message.Data["timestamp"] = strconv.FormatInt(timestamp.UnixMilli(), 10)

	image := ExtractImage(userData.Did, post.Embed)
	if image != "" {
		message.Data["image"] = image
	}

	if userData.Avatar != "" {
		message.Data["icon"] = fmt.Sprintf("https://cdn.bsky.app/img/avatar_thumbnail/plain/%s/%s@jpeg", userData.Did, userData.Avatar)
	}

	if userData.DisplayName != "" {
		message.Data["title"] = userData.DisplayName
	}

	isReply := post.Reply != nil
	quoted := extractQuoted(post.Embed)
	if isReply {
		parentUri, err := syntax.ParseATURI(post.Reply.Parent.Uri)
		if err != nil {
			return message, isReply, fmt.Errorf("post.MakeMessage: %w", err)
		}

		message.FCMOptions.AnalyticsLabel = "reply"

		did := parentUri.Authority().String()

		parentUser, err := user.DefaultCache.GetOrFetch(did)
		if err != nil {
			return message, isReply, fmt.Errorf("post.MakeMessage: %w", err)
		}

		message.Data["title"] += " replied"
		message.Data["body"] = fmt.Sprintf("@%s %s", parentUser.Handle, message.Data["body"])
	} else if quoted != "" {
		quotedUri, err := syntax.ParseATURI(quoted)
		if err != nil {
			return message, isReply, fmt.Errorf("post.MakeMessage: %w", err)
		}

		did := quotedUri.Authority().String()

		quotedUser, err := user.DefaultCache.GetOrFetch(did)
		if err != nil {
			return message, isReply, fmt.Errorf("post.MakeMessage: %w", err)
		}

		message.Data["title"] += " quoted"
		message.Data["body"] = fmt.Sprintf("%s @%s", message.Data["body"], quotedUser.Handle)
	}

	return message, isReply, nil
}

func ExtractImage(did string, embed *bsky.FeedPost_Embed) string {
	if embed == nil {
		return ""
	}

	if embed.EmbedImages != nil {
		return fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", did, embed.EmbedImages.Images[0].Image.Ref.String())
	}

	if embed.EmbedVideo != nil {
		return fmt.Sprintf("https://video.bsky.app/watch/%s/%s/thumbnail.jpg", did, embed.EmbedVideo.Video.Ref.String())
	}

	if embed.EmbedExternal != nil && embed.EmbedExternal.External.Thumb != nil {
		return fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", did, embed.EmbedExternal.External.Thumb.Ref.String())
	}

	if embed.EmbedRecordWithMedia == nil {
		return ""
	}

	media := embed.EmbedRecordWithMedia.Media

	if media.EmbedImages != nil {
		return fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", did, media.EmbedImages.Images[0].Image.Ref.String())
	}

	if media.EmbedVideo != nil {
		return fmt.Sprintf("https://video.bsky.app/watch/%s/%s/thumbnail.jpg", did, media.EmbedVideo.Video.Ref.String())
	}

	if media.EmbedExternal != nil && media.EmbedExternal.External.Thumb != nil {
		return fmt.Sprintf("https://cdn.bsky.app/img/feed_thumbnail/plain/%s/%s@jpeg", did, media.EmbedExternal.External.Thumb.Ref.String())
	}

	return ""
}

func extractQuoted(embed *bsky.FeedPost_Embed) string {
	if embed == nil {
		return ""
	}

	if embed.EmbedRecord != nil {
		return embed.EmbedRecord.Record.Uri
	}

	if embed.EmbedRecordWithMedia != nil {
		return embed.EmbedRecordWithMedia.Record.Record.Uri
	}

	return ""
}

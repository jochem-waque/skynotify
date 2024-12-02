/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package repost

import (
	"context"
	"fmt"
	"log/slog"
	"strconv"
	"time"

	"firebase.google.com/go/v4/messaging"
	"github.com/Jochem-W/skynotify/server/internal"
	"github.com/Jochem-W/skynotify/server/post"
	"github.com/Jochem-W/skynotify/server/user"
	"github.com/bluesky-social/indigo/api/atproto"
	"github.com/bluesky-social/indigo/api/bsky"
	"github.com/bluesky-social/indigo/atproto/syntax"
	"github.com/bluesky-social/indigo/xrpc"
)

func MakeMessage(userData *user.User, path string, repost *bsky.FeedRepost) (messaging.MulticastMessage, error) {
	message := messaging.MulticastMessage{FCMOptions: &messaging.FCMOptions{AnalyticsLabel: "repost"}}

	timestamp, err := time.Parse(time.RFC3339, repost.CreatedAt)
	if err != nil {
		return message, fmt.Errorf("repost.MakeMessage: %w", err)
	}

	atUri, err := syntax.ParseATURI(repost.Subject.Uri)
	if err != nil {
		return message, fmt.Errorf("repost.MakeMessage: %w", err)
	}

	did := atUri.Authority().String()

	author, err := user.GetOrFetch(did)
	if err != nil {
		return message, fmt.Errorf("repost.MakeMessage: %w", err)
	}

	collection := atUri.Collection().String()
	rkey := atUri.RecordKey().String()

	rec, err := atproto.RepoGetRecord(context.Background(), author.Client, repost.Subject.Cid, collection, author.Did, rkey)
	if err != nil {
		slog.Warn("repost.MakeMessage", "uri", atUri, "error", err)
		params := map[string]interface{}{
			"collection": collection,
			"repo":       author.Did,
			"rkey":       rkey,
		}
		err = author.Client.Do(context.Background(), xrpc.Query, "", "com.atproto.repo.getRecord", params, nil, rec)
	}

	if err != nil {
		return message, fmt.Errorf("repost.MakeMessage: %w", err)
	}

	decoded, ok := rec.Value.Val.(*bsky.FeedPost)
	if !ok {
		return message, fmt.Errorf("repost.MakeMessage: failed to decode response to FeedPost")
	}

	message.Data = make(map[string]string)
	message.Data["title"] = userData.Handle
	message.Data["body"] = fmt.Sprintf("@%s: %s", author.Handle, decoded.Text)
	message.Data["tag"] = internal.GenerateTag(path)
	message.Data["url"] = fmt.Sprintf("https://bsky.app/profile/%s/post/%s", author.Did, rkey)
	message.Data["timestamp"] = strconv.FormatInt(timestamp.UnixMilli(), 10)

	image := post.ExtractImage(author.Did, decoded.Embed)
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

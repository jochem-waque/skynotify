package messages

import (
	"fmt"
	"strings"

	"github.com/bluesky-social/indigo/api/bsky"
)

func extractImage(did string, embed *bsky.FeedPost_Embed) string {
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

func GenerateTag(path string) string {
	tag := path[strings.LastIndex(path, ".")+1:]
	if len(tag) > 32 {
		tag = tag[:32]
	}

	return tag
}

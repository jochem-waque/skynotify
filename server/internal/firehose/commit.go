package firehose

import (
	"fmt"
	"log/slog"

	"firebase.google.com/go/v4/messaging"
	"github.com/bluesky-social/indigo/api/atproto"
	"github.com/jochem-waque/skynotify/server/internal/db"
	"github.com/jochem-waque/skynotify/server/internal/firebase"
	"github.com/jochem-waque/skynotify/server/internal/users"
)

func processCommit(cache *db.Cache, msg *firebase.Messaging, influx *db.Influx, evt *atproto.SyncSubscribeRepos_Commit) error {
	err := influx.WriteCommitPoint(evt)
	if err != nil {
		slog.Warn("processCommit", "error", err)
	}

	if evt.TooBig {
		// fmt.Println("skipping too big commit")
		return nil
	}

	if !hasUsefulOp(evt) {
		return nil
	}

	subs := cache.GetSubscriptionsFor(evt.Repo)
	if len(subs) == 0 && !users.DefaultCache.Exists(evt.Repo) {
		return nil
	}

	messages, err := processOps(evt, subs)
	if err != nil {
		return fmt.Errorf("processCommit: %w", err)
	}

	for _, message := range messages {
		// I think setting the Topic header might act like an FCM topic? Was getting RESOURCE_EXHAUSTED (QUOTA_EXCEEDED)
		// message.Webpush.Headers["Topic"] = message.Data["tag"]
		message.Webpush = &messaging.WebpushConfig{Headers: make(map[string]string)}
		message.Webpush.Headers["TTL"] = "43200" // 12 hours
		message.Webpush.Headers["Urgency"] = "normal"
		msg.SendMulticast(&message)
	}

	return nil
}

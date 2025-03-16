package firehose

import (
	"context"
	"fmt"
	"log/slog"

	"firebase.google.com/go/v4/messaging"
	"github.com/Jochem-W/skynotify/server/internal/db"
	"github.com/Jochem-W/skynotify/server/internal/firebase"
	"github.com/Jochem-W/skynotify/server/internal/users"
	"github.com/bluesky-social/indigo/api/atproto"
)

func processCommit(postgres *db.PostgresDB, msg *firebase.Messaging, influx *db.Influx, evt *atproto.SyncSubscribeRepos_Commit) error {
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

	rows, err := postgres.GetSubscriptions(context.Background(), evt.Repo)
	if err != nil {
		return fmt.Errorf("processCommit: %w", err)
	}

	if len(rows) == 0 && !users.DefaultCache.Exists(evt.Repo) {
		return nil
	}

	messages, err := processOps(evt, rows)
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

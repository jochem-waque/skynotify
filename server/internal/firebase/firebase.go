package firebase

import (
	"context"
	"fmt"
	"log/slog"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/errorutils"
	"firebase.google.com/go/v4/messaging"
	"github.com/jochem-waque/skynotify/server/internal/db"
	"google.golang.org/api/option"
)

type Messaging struct {
	client   *messaging.Client
	postgres *db.PostgresDB
	influx   *db.Influx
}

func LoadFirebase(postgres *db.PostgresDB, influx *db.Influx) (*Messaging, error) {
	opt := option.WithCredentialsFile("firebase.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("LoadFirebase: %w", err)
	}

	client, err := app.Messaging(context.Background())
	if err != nil {
		return nil, fmt.Errorf("LoadFirebase: %w", err)
	}

	return &Messaging{client: client, postgres: postgres, influx: influx}, nil
}

func (m *Messaging) SendMulticast(message *messaging.MulticastMessage) {
	responses, _ := m.client.SendEachForMulticast(context.Background(), message)

	successCount := 0
	failCount := 0
	tag := message.FCMOptions.AnalyticsLabel
	if tag == "" {
		tag = "unknown"
	}

	for i, response := range responses.Responses {
		if response.Success {
			successCount += 1
			continue
		}

		failCount += 1

		// https://firebase.google.com/docs/reference/fcm/rest/v1/ErrorCode
		if errorutils.IsUnknown(response.Error) ||
			errorutils.IsResourceExhausted(response.Error) ||
			errorutils.IsUnavailable(response.Error) ||
			errorutils.IsInternal(response.Error) {
			slog.Error("processCommit", "token", message.Tokens[i], "error", response.Error)
			continue
		} else if errorutils.IsInvalidArgument(response.Error) {
			slog.Error("processCommit", "message", formatMessage(message, &message.Tokens[i]), "error", response.Error)
			continue
		}

		token := message.Tokens[i]
		if err := m.postgres.InvalidateToken(context.Background(), token); err != nil {
			slog.Error("processCommit", "error", err, "previous", response.Error)
			continue
		}

		slog.Info("processCommit: invalidated token", "token", token, "error", response.Error)
	}

	m.influx.WriteNotificationPoint(tag, true, successCount)
	m.influx.WriteNotificationPoint(tag, false, failCount)
}

func formatMessage(msg *messaging.MulticastMessage, tk *string) string {
	var tokens string
	if tk != nil {
		tokens = fmt.Sprintf("Token:%s", *tk)
	} else {
		tokens = fmt.Sprintf("Tokens:%#v", msg.Tokens)
	}

	return fmt.Sprintf("&{%s Data:%#v Notification:%#v Webpush:%#v FCMOptions:%#v}",
		tokens, msg.Data, msg.Notification, msg.Webpush, msg.FCMOptions)
}

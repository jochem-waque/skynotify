package firehose

import (
	"context"
	"fmt"
	"slices"
	"strings"

	"firebase.google.com/go/v4/messaging"
	"github.com/bluesky-social/indigo/api/atproto"
	"github.com/bluesky-social/indigo/api/bsky"
	"github.com/bluesky-social/indigo/repo"
	"github.com/jochem-waque/skynotify/server/internal/db"
	"github.com/jochem-waque/skynotify/server/internal/messages"
	"github.com/jochem-waque/skynotify/server/internal/users"
)

func hasUsefulOp(evt *atproto.SyncSubscribeRepos_Commit) bool {
	for _, op := range evt.Ops {
		if op.Action == "update" && op.Path == "app.bsky.actor.profile/self" {
			return true
		}

		if op.Action == "create" && strings.HasPrefix(op.Path, "app.bsky.feed.repost/") {
			return true
		}

		if op.Action == "create" && strings.HasPrefix(op.Path, "app.bsky.feed.post/") {
			return true
		}
	}

	return false
}

func processOps(evt *atproto.SyncSubscribeRepos_Commit, subs map[string]db.CacheEntry) ([]messaging.MulticastMessage, error) {
	var r *repo.Repo
	multicast := []messaging.MulticastMessage{}

	userData, err := users.DefaultCache.GetOrFetch(evt.Repo)
	if err != nil {
		return multicast, fmt.Errorf("processOps: %w", err)
	}

	for _, op := range evt.Ops {
		if op.Action == "update" && op.Path == "app.bsky.actor.profile/self" {
			if err = openRepo(evt, &r); err != nil {
				return multicast, fmt.Errorf("processOps: %w", err)
			}

			_, rec, err := r.GetRecord(context.Background(), op.Path)
			if err != nil {
				return multicast, fmt.Errorf("processOps: %w", err)
			}

			pr, ok := rec.(*bsky.ActorProfile)
			if !ok {
				return multicast, fmt.Errorf("processOps: couldn't read profile record")
			}

			users.DefaultCache.Update(evt.Repo, pr)

			continue
		}

		if op.Action == "create" && strings.HasPrefix(op.Path, "app.bsky.feed.repost/") {
			tokens := []string{}
			for token, entry := range subs {
				if entry.Reposts {
					tokens = append(tokens, token)
				}
			}

			if len(tokens) == 0 {
				continue
			}

			if err = openRepo(evt, &r); err != nil {
				return multicast, fmt.Errorf("processOps: %w", err)
			}

			_, record, err := r.GetRecord(context.Background(), op.Path)
			if err != nil {
				return multicast, fmt.Errorf("processOps: %w", err)
			}

			rp, ok := record.(*bsky.FeedRepost)
			if !ok {
				return multicast, fmt.Errorf("processOps: couldn't read repost record")
			}

			message, err := messages.Repost(userData, op.Path, rp)
			if err != nil {
				return multicast, fmt.Errorf("processOps: %w", err)
			}

			for chunk := range slices.Chunk(tokens, 500) {
				message.Tokens = chunk
				multicast = append(multicast, message)
			}

			continue
		}

		if op.Action == "create" && strings.HasPrefix(op.Path, "app.bsky.feed.post/") {
			if err = openRepo(evt, &r); err != nil {
				return multicast, fmt.Errorf("processOps: %w", err)
			}

			_, record, err := r.GetRecord(context.Background(), op.Path)
			if err != nil {
				return multicast, fmt.Errorf("processOps: %w", err)
			}

			p, ok := record.(*bsky.FeedPost)
			if !ok {
				return multicast, fmt.Errorf("processOps: couldn't read post record")
			}

			message, reply, err := messages.Post(userData, op.Path, p)
			if err != nil {
				return multicast, fmt.Errorf("processOps: %w", err)
			}

			tokens := []string{}
			for token, entry := range subs {
				if reply && entry.Replies || !reply && entry.Posts {
					tokens = append(tokens, token)
				}
			}

			for chunk := range slices.Chunk(tokens, 500) {
				message.Tokens = chunk
				multicast = append(multicast, message)
			}

			continue
		}
	}

	return multicast, nil
}

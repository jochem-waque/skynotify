package firehose

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/Jochem-W/skynotify/server/internal/db"
	"github.com/Jochem-W/skynotify/server/internal/firebase"
	"github.com/Jochem-W/skynotify/server/internal/heartbeat"
	"github.com/Jochem-W/skynotify/server/internal/users"
	"github.com/bluesky-social/indigo/api/atproto"
	"github.com/bluesky-social/indigo/events"
	"github.com/bluesky-social/indigo/events/schedulers/parallel"
	"github.com/gorilla/websocket"
)

func Connect(postgres *db.PostgresDB, msg *firebase.Messaging, influx *db.Influx, seq int64) (*websocket.Conn, error) {
	uri := "wss://bsky.network/xrpc/com.atproto.sync.subscribeRepos"
	if seq != 0 {
		slog.Info("Resuming from", "seq", seq)
		uri = fmt.Sprintf("%s?cursor=%d", uri, seq)
	}

	conn, _, err := websocket.DefaultDialer.Dial(uri, http.Header{})
	if err != nil {
		return nil, err
	}

	h, hCtx := heartbeat.NewHeartbeat(time.Minute * 5)
	ctx, cancel := signal.NotifyContext(hCtx, os.Interrupt, syscall.SIGTERM)

	rsc := &events.RepoStreamCallbacks{
		RepoIdentity: func(evt *atproto.SyncSubscribeRepos_Identity) error {
			h.Reset()

			if err := users.DefaultCache.UpdateIdentity(evt.Did, evt); err != nil {
				slog.Error("rsc.RepoIdentity", "error", err)
			}

			return nil
		},
		RepoCommit: func(evt *atproto.SyncSubscribeRepos_Commit) error {
			h.Reset()

			if err := processCommit(postgres, msg, influx, evt); err != nil {
				slog.Error("rsc.RepoCommit", "error", err)
			}

			return nil
		},
		Error: func(evt *events.ErrorFrame) error {
			slog.Error("rsc.Error", "error", evt.Error, "message", evt.Message)
			cancel()
			return nil
		},
	}

	sched := parallel.NewScheduler(runtime.NumCPU(), 500, "firehose", rsc.EventHandler)
	if err = events.HandleRepoStream(ctx, conn, sched, slog.Default()); err != nil {
		slog.Error("Connect", "error", err)
	}

	return conn, nil
}

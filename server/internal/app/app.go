package app

import (
	"context"

	"github.com/jochem-waque/skynotify/server/internal/config"
	"github.com/jochem-waque/skynotify/server/internal/db"
	"github.com/jochem-waque/skynotify/server/internal/firebase"
	"github.com/jochem-waque/skynotify/server/internal/firehose"
)

type App struct {
	Cache     *db.Cache
	Postgres  *db.PostgresDB
	Influx    *db.Influx
	Messaging *firebase.Messaging
}

func Init() (*App, error) {
	err := config.LoadEnv()
	if err != nil {
		return nil, err
	}

	postgres, err := db.LoadPostgres()
	if err != nil {
		return nil, err
	}

	influx, err := db.LoadInflux()
	if err != nil {
		return nil, err
	}

	firebase, err := firebase.LoadFirebase(postgres, influx)
	if err != nil {
		return nil, err
	}

	cache, err := db.CreateCache(context.Background(), postgres)
	if err != nil {
		return nil, err
	}

	return &App{Cache: cache, Postgres: postgres, Influx: influx, Messaging: firebase}, nil
}

func (a *App) Close() {
	a.Postgres.Close()
	a.Influx.Close()
}

func (a *App) Connect(seq int64) error {
	conn, err := firehose.Connect(a.Cache, a.Messaging, a.Influx, seq)
	if err != nil {
		return err
	}

	defer conn.Close()

	return nil
}

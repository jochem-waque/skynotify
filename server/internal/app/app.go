package app

import (
	"github.com/jochem-waque/skynotify/server/internal/config"
	"github.com/jochem-waque/skynotify/server/internal/db"
	"github.com/jochem-waque/skynotify/server/internal/firebase"
	"github.com/jochem-waque/skynotify/server/internal/firehose"
)

type App struct {
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

	return &App{Postgres: postgres, Influx: influx, Messaging: firebase}, nil
}

func (a *App) Close() {
	a.Postgres.Close()
	a.Influx.Close()
}

func (a *App) Connect(seq int64) error {
	conn, err := firehose.Connect(a.Postgres, a.Messaging, a.Influx, seq)
	if err != nil {
		return err
	}

	defer conn.Close()

	return nil
}

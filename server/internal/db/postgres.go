package db

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresDB struct {
	conn *pgxpool.Pool
}

type GetSubscriptionsRow struct {
	Token   string `json:"token"`
	Posts   bool   `json:"posts"`
	Reposts bool   `json:"reposts"`
	Replies bool   `json:"replies"`
}

func LoadPostgres() (*PostgresDB, error) {
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		return nil, fmt.Errorf("LoadPostgres: environment variable DATABASE_URL is not set")
	}

	pool, err := pgxpool.New(context.Background(), url)
	if err != nil {
		return nil, fmt.Errorf("LoadPostgres: %w", err)
	}

	return &PostgresDB{conn: pool}, nil
}

func (p *PostgresDB) Close() {
	if p != nil {
		p.conn.Close()
	}
}

func (q *PostgresDB) GetSubscriptions(ctx context.Context, did string) ([]GetSubscriptionsRow, error) {
	rows, err := q.conn.Query(ctx, `SELECT token.token, posts, reposts, replies
FROM subscription
INNER JOIN token ON token.id = subscription.token
WHERE target = $1 AND unregistered IS NULL;`, did)
	if err != nil {
		return nil, fmt.Errorf("GetSubscriptions: %w", err)
	}

	subscriptions, err := pgx.CollectRows(rows, pgx.RowToStructByName[GetSubscriptionsRow])
	if err != nil {
		return nil, fmt.Errorf("GetSubscriptions: %w", err)
	}

	return subscriptions, nil
}

func (q *PostgresDB) InvalidateToken(ctx context.Context, token string) (pgconn.CommandTag, error) {
	cmdTag, err := q.conn.Exec(ctx, `UPDATE token
SET unregistered = NOW()
WHERE token = $1;`, token)
	if err != nil {
		return cmdTag, fmt.Errorf("InvalidateToken: %w", err)
	}

	return cmdTag, err
}

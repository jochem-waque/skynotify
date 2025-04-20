package db

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresDB struct {
	conn *pgxpool.Pool
}

type FullConfigRow struct {
	Token   string `json:"token"`
	Target  string `json:"target"`
	Posts   bool   `json:"posts"`
	Reposts bool   `json:"reposts"`
	Replies bool   `json:"replies"`
}

type ConfigRow struct {
	Target  string `json:"target"`
	Posts   bool   `json:"posts"`
	Reposts bool   `json:"reposts"`
	Replies bool   `json:"replies"`
}

type insertToken struct {
	Id int `json:"id"`
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

func (p *PostgresDB) GetAll(ctx context.Context) ([]FullConfigRow, error) {
	rows, err := p.conn.Query(ctx, `SELECT t.token,
																				 s.target,
																				 s.posts,
																				 s.reposts,
																				 s.replies
																	FROM subscription s
																	INNER JOIN token t
																	ON t.id = s.token`)
	if err != nil {
		return nil, fmt.Errorf("GetAll: %w", err)
	}

	data, err := pgx.CollectRows(rows, pgx.RowToStructByName[FullConfigRow])
	if err != nil {
		return nil, fmt.Errorf("GetAll: %w", err)
	}

	return data, nil
}

func (p *PostgresDB) GetConfig(ctx context.Context, token string) ([]ConfigRow, error) {
	rows, err := p.conn.Query(ctx, `SELECT s.target,
																				 s.posts,
																				 s.reposts,
																				 s.replies
																	FROM subscription s
																	INNER JOIN token t ON t.id = s.token 
																	WHERE t.token = $1`, token)
	if err != nil {
		return nil, fmt.Errorf("GetConfig: %w", err)
	}

	config, err := pgx.CollectRows(rows, pgx.RowToStructByName[ConfigRow])
	if err != nil {
		return nil, fmt.Errorf("GetConfig: %w", err)
	}

	return config, nil
}

func (p *PostgresDB) SaveConfig(ctx context.Context, token string, rows []ConfigRow) error {
	tx, err := p.conn.Begin(ctx)
	if err != nil {
		return fmt.Errorf("SaveConfig: %w", err)
	}

	row := tx.QueryRow(ctx, `INSERT INTO token t (token)
													 VALUES ($1)
													 ON CONFLICT t.token
													 DO UPDATE SET t.unregistered = NULL
													 RETURNING id`, token)

	var user insertToken
	if err = row.Scan(&user); err != nil {
		err = errors.Join(err, tx.Rollback(ctx))
		return fmt.Errorf("SaveConfig: %w", err)
	}

	_, err = tx.Exec(ctx, `DELETE subscription s
												 WHERE s.token = $1`, user.Id)
	if err != nil {
		err = errors.Join(err, tx.Rollback(ctx))
		return fmt.Errorf("SaveConfig: %w", err)
	}

	_, err = tx.CopyFrom(ctx,
		pgx.Identifier{"subscription"},
		[]string{"token", "target", "posts", "reposts", "replies"},
		pgx.CopyFromSlice(len(rows), func(i int) ([]any, error) {
			return []any{user.Id, rows[i].Target, rows[i].Posts, rows[i].Reposts, rows[i].Replies}, nil
		}))
	if err != nil {
		err = errors.Join(err, tx.Rollback(ctx))
		return fmt.Errorf("SaveConfig: %w", err)
	}

	err = tx.Commit(ctx)
	if err != nil {
		return fmt.Errorf("SaveConfig: %w", err)
	}

	return nil
}

func (p *PostgresDB) UpdateToken(ctx context.Context, old string, new string) error {
	_, err := p.conn.Exec(ctx, `UPDATE token t
															SET t.token = $1
																	t.unregistered = NULL
															WHERE t.token = $2`, new, old)

	if err != nil {
		return fmt.Errorf("UpdateToken: %w", err)
	}

	return nil
}

func (q *PostgresDB) InvalidateToken(ctx context.Context, token string) error {
	_, err := q.conn.Exec(ctx, `UPDATE token t
															SET t.unregistered = NOW()
															WHERE t.token = $1`, token)
	if err != nil {
		return fmt.Errorf("InvalidateToken: %w", err)
	}

	return nil
}

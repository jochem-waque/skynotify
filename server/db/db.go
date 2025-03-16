/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type Querier interface {
	GetSubscriptions(ctx context.Context, did string) ([]GetSubscriptionsRow, error)

	InvalidateToken(ctx context.Context, token string) (pgconn.CommandTag, error)
}

var _ Querier = &DBQuerier{}

type DBQuerier struct {
	conn genericConn
}

type genericConn interface {
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
	Exec(ctx context.Context, sql string, arguments ...any) (pgconn.CommandTag, error)
}

func NewQuerier(conn genericConn) *DBQuerier {
	return &DBQuerier{conn: conn}
}

type GetSubscriptionsRow struct {
	Token   string `json:"token"`
	Posts   bool   `json:"posts"`
	Reposts bool   `json:"reposts"`
	Replies bool   `json:"replies"`
}

func (q *DBQuerier) GetSubscriptions(ctx context.Context, did string) ([]GetSubscriptionsRow, error) {
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

func (q *DBQuerier) InvalidateToken(ctx context.Context, token string) (pgconn.CommandTag, error) {
	cmdTag, err := q.conn.Exec(ctx, `UPDATE token
SET unregistered = NOW()
WHERE token = $1;`, token)
	if err != nil {
		return cmdTag, fmt.Errorf("InvalidateToken: %w", err)
	}

	return cmdTag, err
}

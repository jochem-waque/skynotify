/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package retry

import (
	"log/slog"
	"time"

	"firebase.google.com/go/v4/messaging"
)

type RetryMessages struct {
	Retries int
	Delay   time.Duration
	Action  func(*messaging.Message) error
}

func (r *RetryMessages) Retry(m *messaging.Message) {
	go func() {
		for try := 0; try < r.Retries; try++ {
			time.Sleep(r.Delay)
			err := r.Action(m)
			if err == nil {
				return
			}

			slog.Warn("RetryMessages.Retry", "error", err)
		}

		slog.Error("RetryMessages.Retry: retries exhausted", "message", m)
	}()
}

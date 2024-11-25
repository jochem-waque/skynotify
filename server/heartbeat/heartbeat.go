/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package heartbeat

import (
	"context"
	"time"
)

type Heartbeat struct {
	timeout    time.Duration
	resetChan  chan struct{}
	cancelFunc context.CancelFunc
}

func NewHeartbeat(timeout time.Duration) (*Heartbeat, context.Context) {
	ctx, cancel := context.WithCancel(context.Background())
	h := &Heartbeat{
		timeout:    timeout,
		resetChan:  make(chan struct{}, 1),
		cancelFunc: cancel,
	}

	go h.monitor()
	return h, ctx
}

func (h *Heartbeat) monitor() {
	timer := time.NewTimer(h.timeout)
	defer timer.Stop()
	for {
		select {
		case <-timer.C:
			h.cancelFunc()
			return
		case <-h.resetChan:
			if !timer.Stop() {
				<-timer.C
			}
			timer.Reset(h.timeout)
		}
	}
}

func (h *Heartbeat) Reset() {
	select {
	case h.resetChan <- struct{}{}:
	default:
	}
}

/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package main

import (
	"log/slog"
	"os"

	"github.com/jochem-waque/skynotify/server/internal/app"
)

func main() {
	cfg, err := app.Init()
	if err != nil {
		slog.Error("cmd", "error", err)
		os.Exit(1)
	}

	defer cfg.Close()

	var seq int64 = 0

	if cfg.Influx != nil {
		seq, err = cfg.Influx.GetLastSeq()
		if err != nil {
			slog.Error("cmd", "error", err)
			os.Exit(1)
		}
	}

	cfg.Connect(seq)

	slog.Info("cmd: graceful exit")
}

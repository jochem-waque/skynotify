/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package internal

import (
	"net/http"
	"time"
)

var HttpClient *http.Client = &http.Client{Timeout: time.Second * 30}

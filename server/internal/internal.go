/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package internal

import (
	"net/http"
	"strings"

	"github.com/bluesky-social/indigo/util"
	"github.com/bluesky-social/indigo/xrpc"
)

// sharing the client should be fine
var httpClient *http.Client = util.RobustHTTPClient()

func GenerateTag(path string) string {
	tag := path[strings.LastIndex(path, ".")+1:]
	if len(tag) > 32 {
		tag = tag[:32]
	}

	return tag
}

func NewXrpcClient(pds string) *xrpc.Client {
	return &xrpc.Client{
		Client: httpClient,
		Host:   pds,
	}
}

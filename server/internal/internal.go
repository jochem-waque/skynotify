/**
 * Copyright (C) 2024  Jochem-W
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

var HttpClient *http.Client = util.RobustHTTPClient()
var AtprotoXrpcClient *xrpc.Client = &xrpc.Client{Client: HttpClient, Host: "https://bsky.social"}
var BskyXrpcClient *xrpc.Client = &xrpc.Client{Client: HttpClient, Host: "https://public.api.bsky.app"}

func GenerateTag(path string) string {
	tag := path[strings.LastIndex(path, ".")+1:]
	if len(tag) > 32 {
		tag = tag[:32]
	}

	return tag
}

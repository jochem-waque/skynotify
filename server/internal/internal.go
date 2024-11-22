/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package internal

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/bluesky-social/jetstream/pkg/models"
)

var HttpClient *http.Client = &http.Client{Timeout: time.Second * 30}

type AtUri struct {
	Did        string `json:"did"`
	Collection string `json:"collection"`
	RecordKey  string `json:"recordKey"`
}

func CutAtUri(uri string) (AtUri, error) {
	atUri := AtUri{}

	noPrefix, found := strings.CutPrefix(uri, "at://")
	if !found {
		return atUri, fmt.Errorf("CutAtUri: couldn't cut prefix at:// from %s", noPrefix)
	}

	did, after, found := strings.Cut(noPrefix, "/")
	if !found {
		return atUri, fmt.Errorf("CutAtUri: couldn't cut did from %s", noPrefix)
	}

	atUri.Did = did

	collection, rkey, found := strings.Cut(after, "/")
	if !found {
		return atUri, fmt.Errorf("CutAtUri: couldn't cut collection from %s", after)
	}

	atUri.Collection = collection
	atUri.RecordKey = rkey
	return atUri, nil
}

func GenerateTag(event *models.Event) string {
	tag := fmt.Sprintf("%s/%s", event.Commit.Collection[strings.LastIndex(event.Commit.Collection, ".")+1:], event.Commit.RKey)
	if len(tag) > 32 {
		tag = tag[:32]
	}

	return tag
}

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package internal

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/ipld/go-ipld-prime/datamodel"
)

var HttpClient *http.Client = &http.Client{Timeout: time.Second * 30}

func IgnoreNotExists(err error) error {
	if IsNotExists(err) {
		return nil
	}

	return err
}

func IsNotExists(err error) bool {
	var notExists datamodel.ErrNotExists
	return errors.As(err, &notExists)
}

type AtUri struct {
	Did        string `json:"did"`
	Collection string `json:"collection"`
	RecordKey  string `json:"recordKey"`
}

func CutAtUri(uri string) (AtUri, error) {
	atUri := AtUri{}

	noPrefix, found := strings.CutPrefix(uri, "at://")
	if !found {
		return atUri, fmt.Errorf("SplitAtUri: couldn't cut prefix at:// from %s", noPrefix)
	}

	did, after, found := strings.Cut(noPrefix, "/")
	if !found {
		return atUri, fmt.Errorf("SplitAtUri: couldn't cut did from %s", noPrefix)
	}

	atUri.Did = did

	collection, rkey, found := strings.Cut(after, "/")
	if !found {
		return atUri, fmt.Errorf("SplitAtUri: couldn't cut collection from %s", after)
	}

	atUri.Collection = collection
	atUri.RecordKey = rkey
	return atUri, nil
}

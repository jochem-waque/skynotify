/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package internal

import (
	"net/http"
	"time"

	"github.com/ipld/go-ipld-prime/datamodel"
)

var HttpClient *http.Client = &http.Client{Timeout: time.Second * 30}

type EmbedData struct {
	Images []struct {
		Thumb string `json:"thumb"`
	} `json:"images,omitempty"`
	Video struct {
		Thumbnail string `json:"thumbnail,omitempty"`
	} `json:"video,omitempty"`
	External struct {
		Thumb string `json:"thumb,omitempty"`
	} `json:"external,omitempty"`
}

type PostsResponse struct {
	Posts []struct {
		Uri    string `json:"uri"`
		Author struct {
			Did    string `json:"did"`
			Handle string `json:"handle"`
		} `json:"author"`
		Record struct {
			Text string `json:"text,omitempty"`
		} `json:"record"`
		Embed struct {
			EmbedData
			Media EmbedData `json:"media,omitempty"`
		} `json:"embed,omitempty"`
	} `json:"posts"`
}

func ExtractCreatedAt(node datamodel.Node) (string, error) {
	createdAt, err := node.LookupByString("createdAt")
	// TODO: figure out how to check if it's ErrNotExists
	if err != nil {
		return "", err
	}

	createdAtStr, err := createdAt.AsString()
	if err != nil {
		return "", err
	}

	return createdAtStr, nil
}

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package internal

import (
	"errors"
	"net/http"
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

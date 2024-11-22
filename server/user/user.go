/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package user

import (
	"context"
	"encoding/json"
	"strings"
	"sync"

	"github.com/Jochem-W/skynotify/server/internal"
	"github.com/bluesky-social/indigo/api/bsky"
	"github.com/bluesky-social/jetstream/pkg/models"
)

type User struct {
	Did         string `json:"did"`
	Handle      string `json:"handle"`
	DisplayName string `json:"displayName,omitempty"`
	Avatar      string `json:"avatar,omitempty"`
}

var users = struct {
	sync.RWMutex
	m map[string]User
}{m: make(map[string]User)}

func Exists(did string) bool {
	users.RLock()
	_, ok := users.m[did]
	users.RUnlock()

	return ok
}

func GetOrFetch(did string) (User, error) {
	users.RLock()
	user, ok := users.m[did]
	users.RUnlock()

	if ok {
		return user, nil
	}

	response, err := bsky.ActorGetProfile(context.Background(), internal.BskyXrpcClient, did)
	if err != nil {
		return user, err
	}

	user = User{Did: did, Handle: response.Handle}

	if response.DisplayName != nil {
		user.DisplayName = *response.DisplayName
	}

	if response.Avatar != nil {
		slash := strings.LastIndex(*response.Avatar, "/")
		if slash != -1 {
			at := strings.LastIndex(*response.Avatar, "@")
			if at != -1 {
				user.Avatar = (*response.Avatar)[slash+1 : at]
			}
		}
	}

	users.Lock()
	users.m[user.Did] = user
	users.Unlock()

	return user, nil
}

func UpdateHandle(did string, handle string) {
	users.RLock()
	user, ok := users.m[did]
	users.RUnlock()

	if !ok {
		return
	}

	user.Handle = handle

	users.Lock()
	users.m[did] = user
	users.Unlock()
}

func Update(event *models.Event) error {
	profile := bsky.ActorProfile{}

	err := json.Unmarshal(event.Commit.Record, &profile)
	if err != nil {
		return err
	}

	users.RLock()
	user, ok := users.m[event.Did]
	users.RUnlock()

	if !ok {
		return nil
	}

	if profile.DisplayName != nil {
		user.DisplayName = *profile.DisplayName
	}

	if profile.Avatar != nil {
		user.Avatar = profile.Avatar.Ref.String()
	}

	users.Lock()
	users.m[event.Did] = user
	users.Unlock()

	return nil
}

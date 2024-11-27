/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package user

import (
	"context"
	"errors"
	"fmt"
	"sync"

	"github.com/Jochem-W/skynotify/server/internal"
	"github.com/bluesky-social/indigo/api/atproto"
	"github.com/bluesky-social/indigo/api/bsky"
	"github.com/bluesky-social/indigo/atproto/identity"
	"github.com/bluesky-social/indigo/atproto/syntax"
	"github.com/bluesky-social/indigo/xrpc"
)

var directory = identity.DefaultDirectory()

type User struct {
	Did         string
	Handle      string
	DisplayName string
	Avatar      string
	Client      *xrpc.Client
}

var users = struct {
	sync.RWMutex
	m map[string]*User
}{m: make(map[string]*User)}

func Exists(did string) bool {
	users.RLock()
	_, ok := users.m[did]
	users.RUnlock()

	return ok
}

func GetOrFetch(did string) (*User, error) {
	users.RLock()
	user, ok := users.m[did]
	users.RUnlock()

	if ok {
		return user, nil
	}

	id, err := directory.LookupDID(context.Background(), syntax.DID(did))
	if err != nil {
		return user, fmt.Errorf("user.GetOrFetch: %w", err)
	}

	user = &User{
		Did:    id.DID.String(),
		Handle: id.Handle.String(),
		Client: internal.NewXrpcClient(id.PDSEndpoint()),
	}

	rec, err := atproto.RepoGetRecord(context.Background(), user.Client, "", "app.bsky.actor.profile", user.Did, "self")
	var xerr *xrpc.Error
	if errors.As(err, &xerr) && xerr.StatusCode == 400 {
		users.Lock()
		users.m[user.Did] = user
		users.Unlock()

		return user, nil
	}

	if err != nil {
		return user, fmt.Errorf("user.GetOrFetch: %w", err)
	}

	pr, ok := rec.Value.Val.(*bsky.ActorProfile)
	if !ok {
		return user, fmt.Errorf("user.GetOrFetch: couldn't decode record to Profile")
	}

	if pr.DisplayName != nil {
		user.DisplayName = *pr.DisplayName
	}

	if pr.Avatar != nil {
		user.Avatar = pr.Avatar.Ref.String()
	}

	users.Lock()
	users.m[user.Did] = user
	users.Unlock()

	return user, nil
}

func UpdateIdentity(did string, evt *atproto.SyncSubscribeRepos_Identity) error {
	users.RLock()
	user, ok := users.m[did]
	users.RUnlock()

	if !ok {
		return nil
	}

	newUser := *user
	if evt.Handle != nil {
		newUser.Handle = *evt.Handle
	}

	id, err := directory.LookupDID(context.Background(), syntax.DID(did))
	if err != nil {
		return fmt.Errorf("user.UpdateIdentity: %w", err)
	}

	newUser.Client.Host = id.PDSEndpoint()

	users.Lock()
	users.m[did] = &newUser
	users.Unlock()

	return nil
}

func Update(did string, profile *bsky.ActorProfile) {
	users.RLock()
	user, ok := users.m[did]
	users.RUnlock()

	if !ok {
		return
	}

	newUser := *user

	if profile.DisplayName != nil {
		newUser.DisplayName = *profile.DisplayName
	}

	if profile.Avatar != nil {
		newUser.Avatar = profile.Avatar.Ref.String()
	}

	users.Lock()
	users.m[did] = &newUser
	users.Unlock()
}

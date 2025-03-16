/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package users

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"sync"

	"github.com/bluesky-social/indigo/api/atproto"
	"github.com/bluesky-social/indigo/api/bsky"
	"github.com/bluesky-social/indigo/atproto/identity"
	"github.com/bluesky-social/indigo/atproto/syntax"
	"github.com/bluesky-social/indigo/util"
	"github.com/bluesky-social/indigo/xrpc"
)

var directory = identity.DefaultDirectory()
var httpClient *http.Client = util.RobustHTTPClient()

var DefaultCache = &UserCache{data: map[string]*User{}}

type User struct {
	Did         string
	Handle      string
	DisplayName string
	Avatar      string
	Client      *xrpc.Client
}

type UserCache struct {
	mut  sync.RWMutex
	data map[string]*User
}

func (u *UserCache) read(did string) (*User, bool) {
	u.mut.RLock()

	user, ok := u.data[did]

	u.mut.RUnlock()

	return user, ok
}

func (u *UserCache) write(user *User) {
	u.mut.Lock()

	if user.Handle == "handle.invalid" {
		delete(u.data, user.Did)
	} else {
		u.data[user.Did] = user
	}

	u.mut.Unlock()
}

func (u *UserCache) Exists(did string) bool {
	_, ok := u.read(did)

	return ok
}

func (u *UserCache) GetOrFetch(did string) (*User, error) {
	user, ok := u.read(did)
	if ok {
		return user, nil
	}

	id, err := directory.LookupDID(context.Background(), syntax.DID(did))
	if err != nil {
		return nil, fmt.Errorf("user.GetOrFetch: %w", err)
	}

	user = &User{
		Did:    id.DID.String(),
		Handle: id.Handle.String(),
		Client: &xrpc.Client{
			Client: httpClient,
			Host:   id.PDSEndpoint(),
		},
	}

	rec, err := atproto.RepoGetRecord(context.Background(), user.Client, "", "app.bsky.actor.profile", user.Did, "self")
	var xerr *xrpc.Error
	if errors.As(err, &xerr) && xerr.StatusCode == 400 {
		u.write(user)
		return user, nil
	}

	if err != nil {
		return nil, fmt.Errorf("user.GetOrFetch: %w", err)
	}

	pr, ok := rec.Value.Val.(*bsky.ActorProfile)
	if !ok {
		return nil, fmt.Errorf("user.GetOrFetch: couldn't decode record to Profile")
	}

	if pr.DisplayName != nil {
		user.DisplayName = *pr.DisplayName
	}

	if pr.Avatar != nil {
		user.Avatar = pr.Avatar.Ref.String()
	}

	u.write(user)

	return user, nil
}

func (u *UserCache) UpdateIdentity(did string, evt *atproto.SyncSubscribeRepos_Identity) error {
	user, ok := u.read(did)
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

	u.write(&newUser)

	return nil
}

func (u *UserCache) Update(did string, profile *bsky.ActorProfile) {
	user, ok := u.read(did)
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

	u.write(&newUser)
}

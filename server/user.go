/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"sync"

	"github.com/ipld/go-car/v2/storage"
	"github.com/ipld/go-ipld-prime/codec/dagcbor"
	"github.com/ipld/go-ipld-prime/datamodel"
	"github.com/ipld/go-ipld-prime/node/basicnode"
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

func hasUser(did string) bool {
	users.RLock()
	_, ok := users.m[did]
	users.RUnlock()

	return ok
}

func getOrFetchUser(did string) (User, error) {
	users.RLock()
	user := users.m[did]
	users.RUnlock()

	if user != (User{}) {
		return user, nil
	}

	response, err := httpClient.Get(fmt.Sprintf("https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=%s", did))
	if err != nil {
		return user, err
	}

	user = User{}
	err = json.NewDecoder(response.Body).Decode(&user)
	if err != nil {
		return user, err
	}

	if user.Avatar != "" {
		slash := strings.LastIndex(user.Avatar, "/")
		if slash != -1 {
			at := strings.LastIndex(user.Avatar, "@")
			if at != -1 {
				user.Avatar = user.Avatar[slash+1 : at]
			}
		}
	}

	users.Lock()
	users.m[user.Did] = user
	users.Unlock()

	return user, nil
}

func updateUser(did string, car storage.ReadableCar, cid string) error {
	users.RLock()
	user := users.m[did]
	users.RUnlock()

	if user.Handle == "" {
		return nil
	}

	blk, err := car.Get(context.Background(), cid)
	if err != nil {
		return err
	}

	reader := bytes.NewReader(blk)

	nb := basicnode.Prototype.Any.NewBuilder()
	err = dagcbor.Decode(nb, reader)
	if err != nil {
		return err
	}

	n := nb.Build()
	displayName, err := extractDisplayName(n)
	if err != nil {
		return err
	}

	avatar, err := extractAvatar(n)
	if err != nil {
		return err
	}

	if displayName != "" {
		user.DisplayName = displayName
	}

	if avatar != "" {
		user.Avatar = avatar
	}

	users.Lock()
	users.m[did] = user
	users.Unlock()

	return nil
}

func extractAvatar(node datamodel.Node) (string, error) {
	avatar, err := node.LookupByString("avatar")
	if err != nil {
		return "", nil
	}

	ref, err := avatar.LookupByString("ref")
	if err != nil {
		return "", err
	}

	linkNode, err := ref.AsLink()
	if err != nil {
		return "", err
	}

	return linkNode.String(), nil
}

func extractDisplayName(node datamodel.Node) (string, error) {
	displayName, err := node.LookupByString("displayName")
	// TODO: figure out how to check if it's ErrNotExists
	if err != nil {
		return "", nil
	}

	displayNameStr, err := displayName.AsString()
	if err != nil {
		return "", err
	}

	return displayNameStr, nil
}

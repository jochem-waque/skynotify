package firehose

import (
	"bytes"
	"context"
	"fmt"

	"github.com/bluesky-social/indigo/api/atproto"
	"github.com/bluesky-social/indigo/repo"
)

func openRepo(evt *atproto.SyncSubscribeRepos_Commit, r **repo.Repo) error {
	if *r != nil {
		return nil
	}

	reader := bytes.NewReader(evt.Blocks)
	newRepo, err := repo.ReadRepoFromCar(context.Background(), reader)
	if err != nil {
		return fmt.Errorf("openRepo: %w", err)
	}

	*r = newRepo
	return nil
}

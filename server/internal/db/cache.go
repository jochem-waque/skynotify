package db

import (
	"context"
	"maps"
	"sync"
)

type Cache struct {
	mut sync.RWMutex
	dts map[string](map[string]CacheEntry)
	ttd map[string](map[string]bool)
}

type CacheEntry struct {
	Replies bool
	Reposts bool
	Posts   bool
}

func CreateCache(ctx context.Context, p *PostgresDB) (*Cache, error) {
	c := &Cache{
		dts: make(map[string]map[string]CacheEntry),
		ttd: make(map[string]map[string]bool),
	}

	rows, err := p.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	for _, row := range rows {
		c.add(row)
	}

	return c, nil
}

func (c *Cache) add(row FullConfigRow) {
	c.mut.Lock()

	subs, ok := c.dts[row.Target]
	if !ok {
		subs = make(map[string]CacheEntry)
		c.dts[row.Target] = subs
	}

	subs[row.Token] = CacheEntry{
		Replies: row.Replies,
		Reposts: row.Reposts,
		Posts:   row.Posts,
	}

	dids, ok := c.ttd[row.Token]
	if !ok {
		dids = make(map[string]bool)
		c.ttd[row.Token] = dids
	}

	dids[row.Target] = true

	c.mut.Unlock()
}

func (c *Cache) GetSubscriptionsFor(did string) map[string]CacheEntry {
	c.mut.RLock()

	entry, ok := c.dts[did]

	if !ok {
		c.mut.RUnlock()
		return nil
	}

	ret := make(map[string]CacheEntry, len(entry))
	maps.Copy(ret, entry) // TODO: slow?

	c.mut.RUnlock()

	return ret
}

func (c *Cache) Overwrite(token string, val []ConfigRow) {
	c.mut.Lock()

	dids, ok := c.ttd[token]
	if ok {
		for did := range dids {
			delete(c.dts[did], token)
		}
	}

	dids = map[string]bool{}
	c.ttd[token] = dids

	for _, row := range val {
		subs, ok := c.dts[row.Target]
		if !ok {
			subs = make(map[string]CacheEntry)
			c.dts[row.Target] = subs
		}

		subs[token] = CacheEntry{Replies: row.Replies, Reposts: row.Reposts, Posts: row.Posts}
		dids[row.Target] = true
	}

	c.mut.Unlock()
}

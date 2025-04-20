/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package api

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/jochem-waque/skynotify/server/internal/db"
)

type contextKey string

const pgKey = contextKey("pg")
const cacheKey = contextKey("cache")

type Api struct {
	mux *http.ServeMux
}

type loadPayload struct {
	Token string `json:"token"`
}

type storePayload struct {
	Token  string         `json:"token"`
	Config []db.ConfigRow `json:"config"`
}

type updatePayload struct {
	Token    string `json:"token"`
	NewToken string `json:"newToken"`
}

func decode(w http.ResponseWriter, r *http.Request, dst any) bool {
	ct := r.Header.Get("Content-Type")
	if strings.ToLower(ct) != "application/json" {
		http.Error(w, "invalid Content-Type", http.StatusBadRequest)
		return false
	}

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	err := dec.Decode(&dst)
	if err != nil {
		log(r, err)
		http.Error(w, "invalid body", http.StatusBadRequest)
		return false
	}

	return true
}

func log(r *http.Request, err error) {
	slog.Error(fmt.Sprintf("%s %s", r.Method, r.URL.Path), "error", err)
}

func load(w http.ResponseWriter, r *http.Request) {
	pg := r.Context().Value(pgKey).(*db.PostgresDB)
	if pg == nil {
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	var pl loadPayload
	if !decode(w, r, &pl) {
		return
	}

	config, err := pg.GetConfig(r.Context(), pl.Token)
	if err != nil {
		log(r, err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	data, err := json.Marshal(config)
	if err != nil {
		log(r, err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")

	if _, err = w.Write(data); err != nil {
		log(r, err)
		http.Error(w, "", http.StatusInternalServerError)
	}
}

func store(w http.ResponseWriter, r *http.Request) {
	pg := r.Context().Value(pgKey).(*db.PostgresDB)
	if pg == nil {
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	cache := r.Context().Value(cacheKey).(*db.Cache)
	if cache == nil {
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	var pl storePayload
	if !decode(w, r, &pl) {
		return
	}

	err := pg.SaveConfig(r.Context(), pl.Token, pl.Config)
	if err != nil {
		log(r, err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	cache.Overwrite(pl.Token, pl.Config)
}

func update(w http.ResponseWriter, r *http.Request) {
	pg := r.Context().Value(pgKey).(*db.PostgresDB)
	if pg == nil {
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	var pl updatePayload
	if !decode(w, r, &pl) {
		return
	}

	err := pg.UpdateToken(r.Context(), pl.Token, pl.NewToken)
	if err != nil {
		log(r, err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
}

func middleware(pg *db.PostgresDB, f http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		pgCtx := context.WithValue(r.Context(), pgKey, pg)
		cacheCtx := context.WithValue(pgCtx, cacheKey, nil)
		f(w, r.WithContext(cacheCtx))
	}
}

func CreateServer(pg *db.PostgresDB) *Api {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/config", middleware(pg, load))
	mux.HandleFunc("PUT /api/config", middleware(pg, store))
	mux.HandleFunc("POST /api/token", middleware(pg, update))

	return &Api{mux: mux}
}

func (a *Api) Start(addr string) {
	go func() {
		panic(http.ListenAndServe(addr, a.mux))
	}()
}

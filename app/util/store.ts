/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { AppBskyGraphGetFollows, AtpAgent } from "@atproto/api"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { parse, stringify } from "superjson"
import { create, StateCreator } from "zustand"
import { combine, persist, PersistStorage } from "zustand/middleware"

type Profile = {
  handle: string
  displayName?: string
  description?: string
  avatar?: string
}

export function pickProfile({
  handle,
  displayName,
  description,
  avatar,
}: Pick<
  ProfileView,
  "handle" | "displayName" | "description" | "avatar"
>): Profile {
  return {
    handle,
    displayName,
    description,
    avatar,
  }
}

export function updateAllSelected() {
  useDataStore.setState(({ selected, profiles }) => ({
    allSelected:
      selected.size >= profiles.size &&
      new Set(profiles.keys()).symmetricDifference(selected).size === 0,
  }))
}

export function updateAllNotifyPosts() {
  useDataStore.setState(({ notifyPosts, selected }) => ({
    allNotifyPosts:
      notifyPosts.size >= selected.size &&
      selected.symmetricDifference(notifyPosts).size === 0,
  }))
}

export function updateAllNotifyReposts() {
  useDataStore.setState(({ notifyReposts, selected }) => ({
    allNotifyReposts:
      notifyReposts.size >= selected.size &&
      selected.symmetricDifference(notifyReposts).size === 0,
  }))
}

export function updateAllNotifyReplies() {
  useDataStore.setState(({ notifyReplies, selected }) => ({
    allNotifyReplies:
      notifyReplies.size >= selected.size &&
      selected.symmetricDifference(notifyReplies).size === 0,
  }))
}
type Write<T, U> = Omit<T, keyof U> & U
type StateFromCombine<T> =
  T extends StateCreator<infer U>
    ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
      U extends Write<infer V, infer _>
      ? V
      : never
    : never

const combined = combine(
  {
    hasHydrated: false,
    actor: null as string | null,
    fetching: false,
    allSelected: false,
    allNotifyPosts: false,
    allNotifyReposts: false,
    allNotifyReplies: false,
    profiles: new Map<string, Profile>(),
    selected: new Set<string>(),
    notifyPosts: new Set<string>(),
    notifyReposts: new Set<string>(),
    notifyReplies: new Set<string>(),
    setupState: null as
      | null
      | "installation"
      | "authentication"
      | "import"
      | "completed",
  },
  (set) => ({
    setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
    setActor: (actor: string) => set({ actor }),
    setFetching: (value: boolean) => set({ fetching: value }),
    fetchProfiles: async (actor: string) => {
      set({ fetching: true, profiles: new Map() })

      const agent = new AtpAgent({
        service: "https://public.api.bsky.app/",
      })

      let response: AppBskyGraphGetFollows.Response | undefined = undefined
      do {
        response = await agent.getFollows({
          actor,
          limit: 100,
          cursor: response?.data.cursor,
        })

        set(({ profiles: oldProfiles }) => ({
          profiles: new Map([
            ...oldProfiles.entries(),
            ...response!.data.follows.map(
              (follow) => [follow.did, pickProfile(follow)] as const,
            ),
          ]),
        }))
      } while (response.data.cursor)

      set(() => ({ fetching: false }))
    },
    setSelected: (did: string, value?: boolean) =>
      set(({ selected }) => {
        const current = selected.has(did)
        if (value === current) {
          return {}
        }

        if (value === undefined) {
          value = !current
        }

        if (value) {
          const newSelected = new Set(selected).add(did)
          return { selected: newSelected }
        }

        selected.delete(did)
        return { selected: new Set(selected) }
      }),
    setNotifyPosts: (did: string, value?: boolean) =>
      set(({ notifyPosts }) => {
        const current = notifyPosts.has(did)
        if (value === current) {
          return {}
        }

        if (value === undefined) {
          value = !current
        }

        if (value) {
          return { notifyPosts: new Set(notifyPosts).add(did) }
        }

        notifyPosts.delete(did)
        return { notifyPosts: new Set(notifyPosts) }
      }),
    setNotifyReposts: (did: string, value?: boolean) =>
      set(({ notifyReposts }) => {
        const current = notifyReposts.has(did)
        if (value === current) {
          return {}
        }

        if (value === undefined) {
          value = !current
        }

        if (value) {
          return { notifyReposts: new Set(notifyReposts).add(did) }
        }

        notifyReposts.delete(did)
        return { notifyReposts: new Set(notifyReposts) }
      }),
    setNotifyReplies: (did: string, value?: boolean) =>
      set(({ notifyReplies }) => {
        const current = notifyReplies.has(did)
        if (value === current) {
          return {}
        }

        if (value === undefined) {
          value = !current
        }

        if (value) {
          return { notifyReplies: new Set(notifyReplies).add(did) }
        }

        notifyReplies.delete(did)
        return { notifyReplies: new Set(notifyReplies) }
      }),
    toggleSelectAll: () =>
      set(({ profiles, selected }) => {
        const all = new Set(profiles.keys())
        if (all.symmetricDifference(selected).size === 0) {
          return { selected: new Set(), allSelected: false }
        }

        return { selected: all, allSelected: true }
      }),
    toggleNotifyPostsAll: () =>
      set(({ notifyPosts, selected }) => {
        if (selected.symmetricDifference(notifyPosts).size === 0) {
          return { notifyPosts: new Set(), allnotifyPosts: false }
        }

        return { notifyPosts: new Set(selected), allnotifyPosts: true }
      }),
    toggleNotifyRepostsAll: () =>
      set(({ notifyReposts, selected }) => {
        if (selected.symmetricDifference(notifyReposts).size === 0) {
          return { notifyReposts: new Set(), allnotifyReposts: false }
        }

        return { notifyReposts: new Set(selected), allnotifyReposts: true }
      }),
    toggleNotifyRepliesAll: () =>
      set(({ notifyReplies, selected }) => {
        if (selected.symmetricDifference(notifyReplies).size === 0) {
          return { notifyReplies: new Set(), allnotifyReplies: false }
        }

        return { notifyReplies: new Set(selected), allnotifyReplies: true }
      }),
    setSetupState: (
      setupState:
        | null
        | "installation"
        | "authentication"
        | "import"
        | "completed",
    ) => set({ setupState }),
  }),
)

const storage: PersistStorage<StateFromCombine<typeof combined>> = {
  getItem: (name) => {
    const str = localStorage.getItem(name)
    if (!str) {
      return null
    }

    return parse(str)
  },
  setItem: (name, value) => {
    localStorage.setItem(name, stringify(value))
  },
  removeItem: (name) => localStorage.removeItem(name),
}

export const useDataStore = create(
  persist(combined, {
    name: "preferences",
    // TODO indexedDB?
    storage,
    partialize: (state) => ({
      actor: state.actor,
      selected: state.selected,
      notifyPosts: state.notifyPosts,
      notifyReplies: state.notifyReplies,
      notifyReposts: state.notifyReposts,
      setupState: state.setupState,
    }),
    onRehydrateStorage: (state) => {
      return () => state.setHasHydrated(true)
    },
  }),
)

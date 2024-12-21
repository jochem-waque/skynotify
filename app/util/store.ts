/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { load } from "@/actions/load"
import { updateToken } from "@/actions/updateToken"
import {
  AppBskyActorGetProfiles,
  AppBskyGraphGetFollows,
  AtpAgent,
} from "@atproto/api"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { initializeApp } from "firebase/app"
import { getMessaging, Messaging } from "firebase/messaging"
import { parse, stringify } from "superjson"
import { create, StateCreator } from "zustand"
import { combine, persist, PersistStorage } from "zustand/middleware"

export type Profile = {
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
    avatar: avatar?.replace("/avatar/", "/avatar_thumbnail/"),
  }
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
    token: null as string | null,
    actor: null as string | null,
    followsCount: 0,
    fetching: false,
    fetchError: false,
    allNotifyPosts: false,
    allNotifyReposts: false,
    allNotifyReplies: false,
    profiles: new Map<string, Profile>(),
    selected: new Set<string>(),
    notifyPosts: new Set<string>(),
    notifyReposts: new Set<string>(),
    notifyReplies: new Set<string>(),
    unsaved: false,
    allSelected: false,
    messaging: null as Messaging | null,
  },
  (set, get) => ({
    setToken: async (token: string) => {
      const { token: previous } = get()
      if (token === previous) {
        return
      }

      if (previous !== null) {
        await updateToken(previous, token)
      }

      set({ token })
    },
    setActor: (actor: string) => set({ actor }),
    setFollowsCount: (followsCount: number) => set({ followsCount }),
    fetchSelected: async () => {
      const { fetching, selected } = get()
      if (fetching) {
        return
      }

      set({ fetching: true, profiles: new Map(), fetchError: false })

      const agent = new AtpAgent({
        service: "https://public.api.bsky.app/",
      })

      const actors = [...selected]
      for (let i = 0; i < actors.length; i += 25) {
        let response: AppBskyActorGetProfiles.Response | undefined = undefined
        try {
          response = await agent.getProfiles({
            actors: actors.slice(i, i + 25),
          })
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
          set({ fetchError: true, fetching: false })
          return
        }

        set(({ profiles: oldProfiles }) => ({
          profiles: new Map([
            ...oldProfiles.entries(),
            ...response!.data.profiles.map(
              (follow) => [follow.did, pickProfile(follow)] as const,
            ),
          ]),
        }))
      }

      set({ fetchError: false, fetching: false })
    },
    fetchFollowing: async (actor: string) => {
      if (get().fetching) {
        return
      }

      set({ fetching: true, profiles: new Map(), fetchError: false })

      const agent = new AtpAgent({
        service: "https://public.api.bsky.app/",
      })

      for (const splitActor of actor.split(",")) {
        let response: AppBskyGraphGetFollows.Response | undefined = undefined
        do {
          try {
            response = await agent.getFollows({
              actor: splitActor,
              limit: 100,
              cursor: response?.data.cursor,
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_) {
            set({ fetchError: true, fetching: false })
            return
          }

          set(({ profiles: oldProfiles }) => ({
            profiles: new Map([
              ...oldProfiles.entries(),
              ...response!.data.follows.map(
                (follow) => [follow.did, pickProfile(follow)] as const,
              ),
            ]),
          }))
        } while (response.data.cursor)
      }

      set(({ profiles, selected }) => ({
        fetching: false,
        selected: selected.intersection(new Set(profiles.keys())),
      }))
    },
    setSelected: (did: string, value?: boolean) =>
      set(({ selected, profiles }) => {
        const current = selected.has(did)
        if (value === current) {
          return {}
        }

        if (value === undefined) {
          value = !current
        }

        if (value) {
          selected.add(did)
        } else {
          selected.delete(did)
        }

        return {
          selected: new Set(selected),
          allSelected: new Set(profiles.keys()).difference(selected).size === 0,
        }
      }),
    setNotifyPosts: (did: string, value?: boolean) =>
      set(({ notifyPosts, selected }) => {
        const current = notifyPosts.has(did)
        if (value === current) {
          return {}
        }

        if (value === undefined) {
          value = !current
        }

        if (value) {
          notifyPosts.add(did)
        } else {
          notifyPosts.delete(did)
        }

        return {
          notifyPosts: new Set(notifyPosts),
          allNotifyPosts:
            notifyPosts.size >= selected.size &&
            selected.difference(notifyPosts).size === 0,
        }
      }),
    setNotifyReposts: (did: string, value?: boolean) =>
      set(({ notifyReposts, selected }) => {
        const current = notifyReposts.has(did)
        if (value === current) {
          return {}
        }

        if (value === undefined) {
          value = !current
        }

        if (value) {
          notifyReposts.add(did)
        } else {
          notifyReposts.delete(did)
        }

        return {
          notifyReposts: new Set(notifyReposts),
          allNotifyReposts:
            notifyReposts.size >= selected.size &&
            selected.difference(notifyReposts).size === 0,
        }
      }),
    setNotifyReplies: (did: string, value?: boolean) =>
      set(({ notifyReplies, selected }) => {
        const current = notifyReplies.has(did)
        if (value === current) {
          return {}
        }

        if (value === undefined) {
          value = !current
        }

        if (value) {
          notifyReplies.add(did)
        } else {
          notifyReplies.delete(did)
        }

        return {
          notifyReplies: new Set(notifyReplies),
          allNotifyReplies:
            notifyReplies.size >= selected.size &&
            selected.difference(notifyReplies).size === 0,
        }
      }),
    toggleSelectAll: () =>
      set(({ profiles, selected, notifyPosts }) => {
        const profileDids = new Set(profiles.keys())
        const allSelected = profileDids.difference(selected).size === 0

        return {
          selected: allSelected ? new Set() : profileDids,
          isSelected: (did: string) => {
            const { selected } = get()
            return selected.has(did)
          },
          allSelected: !allSelected,
          notifyPosts: allSelected
            ? notifyPosts
            : notifyPosts.union(profileDids),
        }
      }),
    deselectAll: () => set(({}) => ({ selected: new Set() })),
    toggleNotifyPostsAll: () =>
      set(({ notifyPosts, selected }) => {
        const allNotifyPosts = selected.difference(notifyPosts).size > 0

        return {
          notifyPosts: allNotifyPosts ? new Set(selected) : new Set(),
          allNotifyPosts,
          isNotifyPosts: (did: string) => {
            const { notifyPosts } = get()
            return notifyPosts.has(did)
          },
        }
      }),
    toggleNotifyRepostsAll: () =>
      set(({ notifyReposts, selected }) => {
        const allNotifyReposts = selected.difference(notifyReposts).size > 0

        return {
          notifyReposts: allNotifyReposts ? new Set(selected) : new Set(),
          allNotifyReposts,
          isNotifyReposts: (did: string) => {
            const { notifyReposts } = get()
            return notifyReposts.has(did)
          },
        }
      }),
    toggleNotifyRepliesAll: () =>
      set(({ notifyReplies, selected }) => {
        const allNotifyReplies = selected.difference(notifyReplies).size > 0

        return {
          notifyReplies: allNotifyReplies ? new Set(selected) : new Set(),
          allNotifyReplies,
          isNotifyReplies: (did: string) => {
            const { notifyReplies } = get()
            return notifyReplies.has(did)
          },
        }
      }),
    loadSaved: async (token: string | null) => {
      if (!token) {
        return
      }

      const result = await load(token)
      set({
        selected: new Set(result.map(({ target }) => target)),
        notifyPosts: new Set(
          result.filter(({ posts }) => posts).map(({ target }) => target),
        ),
        notifyReplies: new Set(
          result.filter(({ replies }) => replies).map(({ target }) => target),
        ),
        notifyReposts: new Set(
          result.filter(({ reposts }) => reposts).map(({ target }) => target),
        ),
      })
    },
    pruneProfiles: () =>
      set(({ profiles, selected }) => ({
        profiles: new Map(
          [...profiles.entries()].filter(([did]) => selected.has(did)),
        ),
      })),
    setUnsaved: (value?: boolean) => set({ unsaved: value ?? true }),
    exportMap: () => {
      const { selected, notifyPosts, notifyReposts, notifyReplies } = get()
      return [...selected.values()].map((did) => ({
        target: did,
        posts: notifyPosts.has(did),
        reposts: notifyReposts.has(did),
        replies: notifyReplies.has(did),
      }))
    },
    isSelected: (did: string) => {
      const { selected } = get()
      return selected.has(did)
    },
    isNotifyPosts: (did: string) => {
      const { notifyPosts } = get()
      return notifyPosts.has(did)
    },
    isNotifyReposts: (did: string) => {
      const { notifyReposts } = get()
      return notifyReposts.has(did)
    },
    isNotifyReplies: (did: string) => {
      const { notifyReplies } = get()
      return notifyReplies.has(did)
    },
    updateNotifyAll: () =>
      set(({ selected, notifyPosts, notifyReplies, notifyReposts }) => ({
        allNotifyPosts:
          notifyPosts.size >= selected.size &&
          selected.difference(notifyPosts).size === 0,
        allNotifyReposts:
          notifyReposts.size >= selected.size &&
          selected.difference(notifyReposts).size === 0,
        allNotifyReplies:
          notifyReplies.size >= selected.size &&
          selected.difference(notifyReplies).size === 0,
      })),
    getMessaging: () => {
      let { messaging } = get()
      if (messaging) {
        return messaging
      }

      const firebaseApp = initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })
      messaging = getMessaging(firebaseApp)

      set({ messaging })

      return messaging
    },
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
    storage,
    partialize: (state) => ({
      actor: state.actor,
      token: state.token,
    }),
  }),
)

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { AppBskyGraphGetFollows, AtpAgent } from "@atproto/api"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { create } from "zustand"
import { combine } from "zustand/middleware"

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

export const useProfilesStore = create(
  combine(
    {
      fetching: false,
      profiles: new Map<string, Profile>(),
      selected: new Set<string>(),
      notifyPosts: new Set<string>(),
      notifyReposts: new Set<string>(),
      notifyReplies: new Set<string>(),
    },
    (set) => ({
      setFetching: (value: boolean) => set({ fetching: value }),
      fetchProfiles: async (actor: string) => {
        set({ fetching: true })

        const agent = new AtpAgent({ service: "https://public.api.bsky.app/" })

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

        set({ fetching: false })
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
            return { selected: new Set(selected).add(did) }
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
    }),
  ),
)

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
  did: string
  handle: string
  displayName?: string
  description?: string
  avatar?: string
} & {
  selected: boolean
} & NotificationPreferences

type NotificationPreferences = {
  notifyPosts: boolean
  notifyReplies: boolean
  notifyReposts: boolean
}

export function pickProfile({
  did,
  handle,
  displayName,
  description,
  avatar,
}: Pick<
  ProfileView,
  "did" | "handle" | "displayName" | "description" | "avatar"
>): Profile {
  return {
    did,
    handle,
    displayName,
    description,
    avatar,
    selected: false,
    notifyPosts: false,
    notifyReplies: false,
    notifyReposts: false,
  }
}

// TODO consider moving tempX to separate store
export const useProfilesStore = create(
  combine(
    {
      fetching: false,
      profiles: [] as Profile[],
      tempSelected: new Set<string>(),
      tempNotifyPosts: new Set<string>(),
      tempNotifyReplies: new Set<string>(),
      tempNotifyReposts: new Set<string>(),
    },
    (set) => ({
      setFetching: (fetching: boolean) => set({ fetching }),
      fetchProfiles: async (actor: string) => {
        set({ fetching: true, profiles: [] })

        const agent = new AtpAgent({ service: "https://public.api.bsky.app/" })

        let response: AppBskyGraphGetFollows.Response | undefined = undefined
        do {
          response = await agent.getFollows({
            actor,
            limit: 100,
            cursor: response?.data.cursor,
          })

          set(({ profiles: oldProfiles }) => ({
            profiles: [
              ...oldProfiles,
              ...response!.data.follows.map(pickProfile),
            ],
          }))
        } while (response.data.cursor)

        set({ fetching: false })
      },

      setSelected: (did: string, selected: boolean) =>
        set(({ tempSelected }) => {
          if (selected) {
            return { tempSelected: new Set(tempSelected).add(did) }
          }

          tempSelected.delete(did)
          return { tempSelected: new Set(tempSelected) }
        }),
      syncSelected: () =>
        set(({ profiles, tempSelected }) => ({
          profiles: profiles.map((profile) => ({
            ...profile,
            selected: tempSelected.has(profile.did),
          })),
        })),

      setNotifyPosts: (did: string, notify: boolean) =>
        set(({ tempNotifyPosts }) => {
          if (notify) {
            return { tempNotifyPosts: new Set(tempNotifyPosts).add(did) }
          }

          tempNotifyPosts.delete(did)
          return { tempNotifyPosts: new Set(tempNotifyPosts) }
        }),
      setNotifyReposts: (did: string, notify: boolean) =>
        set(({ tempNotifyReposts }) => {
          if (notify) {
            return { tempNotifyReposts: new Set(tempNotifyReposts).add(did) }
          }

          tempNotifyReposts.delete(did)
          return { tempNotifyReposts: new Set(tempNotifyReposts) }
        }),
      setNotifyReplies: (did: string, notify: boolean) =>
        set(({ tempNotifyReplies }) => {
          if (notify) {
            return { tempNotifyReplies: new Set(tempNotifyReplies).add(did) }
          }

          tempNotifyReplies.delete(did)
          return { tempNotifyReplies: new Set(tempNotifyReplies) }
        }),
      syncNotificationPreferences: () =>
        set(
          ({
            profiles,
            tempNotifyPosts,
            tempNotifyReplies,
            tempNotifyReposts,
          }) => ({
            profiles: profiles.map((profile) => ({
              ...profile,
              notifyPosts: tempNotifyPosts.has(profile.did),
              notifyReplies: tempNotifyReplies.has(profile.did),
              notifyReposts: tempNotifyReposts.has(profile.did),
            })),
          }),
        ),
    }),
  ),
)

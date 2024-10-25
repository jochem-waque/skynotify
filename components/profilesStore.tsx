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

export const useProfilesStore = create(
  combine(
    {
      fetching: false,
      profiles: [] as Profile[],
      tempSelected: new Set<string>(),
    },
    (set) => ({
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
            tempSelected.add(did)
            return { tempSelected: new Set(tempSelected) }
          }

          tempSelected.delete(did)
          return { tempSelected: new Set(tempSelected) }
        }),
      setNotificationPreferences: (
        preferences: Map<string, NotificationPreferences>,
      ) =>
        set(({ profiles }) => ({
          profiles: profiles.map((profile) => {
            const profilePreferences = preferences.get(profile.did)
            if (!profilePreferences) {
              return profile
            }

            return { ...profile, ...profilePreferences }
          }),
        })),
      setFetching: (fetching: boolean) => set({ fetching }),
      updateSelectedOnProfiles: () =>
        set(({ profiles, tempSelected }) => ({
          profiles: profiles.map((profile) => ({
            ...profile,
            selected: tempSelected.has(profile.did),
          })),
        })),
    }),
  ),
)

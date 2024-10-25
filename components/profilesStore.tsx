/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { AppBskyGraphGetFollows, AtpAgent } from "@atproto/api"
import { create } from "zustand"
import { combine } from "zustand/middleware"

type Profile = {
  did: string
  handle: string
  displayName?: string
  description?: string
  avatar?: string
}

export function pickProfile({
  did,
  handle,
  displayName,
  description,
  avatar,
}: Profile) {
  return { did, handle, displayName, description, avatar }
}

export const useProfilesStore = create(
  combine(
    {
      fetching: false,
      profiles: [] as Profile[],
      selection: [] as string[],
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
            profiles: [...oldProfiles, ...response!.data.follows],
          }))
        } while (response.data.cursor)

        set({ fetching: false })
      },
      toggleSelected: (did: string) =>
        set(({ selection }) => {
          const index = selection.indexOf(did)
          if (index === -1) {
            return { selection: [...selection, did] }
          }

          return { selection: selection.splice(index, 1) }
        }),
      setFetching: (fetching: boolean) => set({ fetching }),
    }),
  ),
)

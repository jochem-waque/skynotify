/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import ImmutableChips from "./profile/immutableChips"
import Profile from "./profile/profile"
import { pickProfile, useDataStore, Profile as ProfileType } from "@/util/store"
import { AtpAgent } from "@atproto/api"
import { useEffect, useRef, useState } from "react"

export default function Configuration() {
  const savedConfiguration = useDataStore((state) => state.savedConfiguration)
  const atpAgent = useRef<AtpAgent>(null)
  const [profiles, setProfiles] = useState<Map<string, ProfileType>>(new Map())

  useEffect(() => {
    async function fetchProfiles() {
      if (!atpAgent.current) {
        atpAgent.current = new AtpAgent({
          service: "https://public.api.bsky.app/",
        })
      }

      const profiles: (readonly [string, ProfileType])[] = []

      const actors = [...savedConfiguration.keys()]
      for (let i = 0; i < actors.length; i += 25) {
        const response = await atpAgent.current.getProfiles({
          actors: actors.slice(i, i + 25),
        })

        profiles.push(
          ...response.data.profiles.map(
            (profile) => [profile.did, pickProfile(profile)] as const,
          ),
        )
      }

      setProfiles(new Map(profiles))
    }

    if (savedConfiguration.size === 0) {
      return
    }

    fetchProfiles()
  }, [savedConfiguration])

  return [...profiles.entries()].map(
    ([did, { handle, displayName, avatar }]) => (
      <div
        className="flex flex-col gap-1 rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800"
        key={did}
      >
        <div>
          <Profile
            handle={handle}
            displayName={displayName}
            avatar={avatar}
          ></Profile>
        </div>
        <div className="flex gap-2">
          <ImmutableChips {...savedConfiguration.get(did)!}></ImmutableChips>
        </div>
      </div>
    ),
  )
}

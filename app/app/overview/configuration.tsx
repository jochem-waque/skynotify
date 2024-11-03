/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import ImmutableChipList from "./immutableChipList"
import Profile from "@/components/profile"
import { pickProfile, useDataStore, Profile as ProfileType } from "@/util/store"
import { AtpAgent } from "@atproto/api"
import { useEffect, useRef, useState } from "react"

export default function Configuration() {
  const savedConfiguration = useDataStore((state) => state.savedConfiguration)
  const atpAgent = useRef<AtpAgent>(null)
  const [profiles, setProfiles] = useState<Map<string, ProfileType>>(new Map())
  const fetching = useRef(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchProfiles() {
      if (fetching.current) {
        return
      }

      setError(false)

      fetching.current = true

      if (!atpAgent.current) {
        atpAgent.current = new AtpAgent({
          service: "https://public.api.bsky.app/",
        })
      }

      const actors = [...savedConfiguration.keys()]
      for (let i = 0; i < actors.length; i += 25) {
        let response
        try {
          response = await atpAgent.current.getProfiles({
            actors: actors.slice(i, i + 25),
          })
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
          setError(true)
          return
        }

        setProfiles(
          (old) =>
            new Map([
              ...old,
              ...response.data.profiles.map(
                (profile) => [profile.did, pickProfile(profile)] as const,
              ),
            ]),
        )
      }

      fetching.current = false
    }

    if (savedConfiguration.size === 0) {
      return
    }

    fetchProfiles()
  }, [savedConfiguration])

  const percentage =
    savedConfiguration.size > 0
      ? 100 * Math.min(1, profiles.size / savedConfiguration.size)
      : 100

  return (
    <>
      {error && (
        <p className="text-red-500">
          An error occurred while loading the stored configuration, please try
          again later.
        </p>
      )}
      <div
        className={`${percentage === 100 ? "-mt-2 min-h-0" : "mt-0 min-h-1"} relative w-full rounded-lg bg-neutral-100 transition-[margin-top,min-height] dark:bg-neutral-800`}
      >
        <div
          style={{ width: `${percentage}%` }}
          className={`${error ? "bg-red-500" : "bg-blue-400 dark:bg-blue-600"} absolute h-full rounded-lg transition-[width]`}
        ></div>
      </div>
      {savedConfiguration.size === 0 && (
        <p> You&apos;re currently not receiving any push notifications.</p>
      )}
      {savedConfiguration.size > 0 && (
        <p>
          You&apos;re currently receiving push notifications for the following
          profiles:
        </p>
      )}
      {[...profiles.entries()].map(([did, { handle, displayName, avatar }]) => (
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
          <div className="flex flex-wrap gap-2">
            <ImmutableChipList
              {...savedConfiguration.get(did)!}
            ></ImmutableChipList>
          </div>
        </div>
      ))}
    </>
  )
}

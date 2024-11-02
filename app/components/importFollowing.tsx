/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "../util/store"
import { AtpAgent } from "@atproto/api"
import { useRouter } from "next/navigation"
import { KeyboardEvent, MouseEvent, useRef } from "react"

export default function ImportFollowing() {
  const fetchProfiles = useDataStore((state) => state.fetchProfiles)
  const setFetching = useDataStore((state) => state.setFetching)
  const setActor = useDataStore((state) => state.setActor)
  const setFollowsCount = useDataStore((state) => state.setFollowsCount)
  const router = useRouter()
  const actor = useDataStore((state) => state.actor)
  const fetching = useDataStore((state) => state.fetching)

  const atpAgent = useRef<AtpAgent>(null)

  async function getFollowing(actor: string) {
    if (!atpAgent.current) {
      atpAgent.current = new AtpAgent({
        service: "https://public.api.bsky.app/",
      })
    }

    const response = await atpAgent.current.getProfile({ actor })
    if (!response.success) {
      return
    }

    if (response.data.followsCount) {
      setFollowsCount(response.data.followsCount)
    }

    setActor(actor)
    setFetching(true)
    fetchProfiles(actor)
    router.push("select")
  }

  function click(event: MouseEvent<HTMLButtonElement>) {
    const input = event.currentTarget.previousElementSibling
    if (!(input instanceof HTMLInputElement)) {
      return
    }

    getFollowing(input.value)
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      getFollowing(event.currentTarget.value)
    }
  }

  // TODO mt-auto shouldn't be specified here
  return (
    <>
      <input
        defaultValue={actor ?? undefined}
        className="rounded-lg p-2 font-mono"
        spellCheck={false}
        type="text"
        onKeyDown={keyDown}
        placeholder="handle.bsky.social"
      ></input>
      <button
        className="mt-auto rounded-lg bg-blue-400 p-4 text-center transition-opacity hover:opacity-75 disabled:opacity-50 dark:bg-blue-600"
        onClick={click}
        type="button"
        disabled={fetching}
      >
        Import following
      </button>
    </>
  )
}

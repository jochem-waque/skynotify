/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { AtpAgent } from "@atproto/api"
import { XRPCError } from "@atproto/xrpc"
import { useRouter } from "next/navigation"
import { KeyboardEvent, useRef, useState } from "react"

export default function ImportFollowing() {
  const fetchProfiles = useDataStore((state) => state.fetchProfiles)
  const setFetching = useDataStore((state) => state.setFetching)
  const setActor = useDataStore((state) => state.setActor)
  const setFollowsCount = useDataStore((state) => state.setFollowsCount)
  const router = useRouter()
  const actor = useDataStore((state) => state.actor)
  const fetching = useDataStore((state) => state.fetching)
  const [error, setError] = useState<string>("")
  const ref = useRef<HTMLInputElement>(null)

  const atpAgent = useRef<AtpAgent>(null)

  async function getFollowing(actor: string) {
    if (!atpAgent.current) {
      atpAgent.current = new AtpAgent({
        service: "https://public.api.bsky.app/",
      })
    }

    let response
    try {
      response = await atpAgent.current.getProfile({ actor })
    } catch (e) {
      if (!(e instanceof XRPCError)) {
        setError("An unknown error ocurred, please try again later")
        return
      }

      setError("The given handle appears to be invalid")
      return
    }

    if (!response.success) {
      setError("An unknown error ocurred, please try again later")
      return
    }

    if (!response.data.followsCount) {
      setError("This account doesn't follow anyone")
      return
    }

    setError("")
    setFollowsCount(response.data.followsCount)
    setActor(actor)
    setFetching(true)
    fetchProfiles(actor)
    router.push("select")
  }

  function click() {
    if (!ref.current) {
      return
    }

    getFollowing(ref.current.value)
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      getFollowing(event.currentTarget.value)
    }
  }

  return (
    <>
      <input
        ref={ref}
        defaultValue={actor ?? undefined}
        className="w-full rounded-lg bg-neutral-100 p-2 font-mono dark:bg-neutral-800"
        spellCheck={false}
        type="url"
        onKeyDown={keyDown}
        placeholder="handle.bsky.social"
      ></input>
      {error && <span className="text-center text-red-500">{error}</span>}
      <button
        className="rounded-lg bg-blue-400 p-4 text-center transition-opacity hover:opacity-75 disabled:cursor-wait disabled:opacity-50 dark:bg-blue-600"
        onClick={click}
        type="button"
        disabled={fetching}
      >
        Import following
      </button>
    </>
  )
}

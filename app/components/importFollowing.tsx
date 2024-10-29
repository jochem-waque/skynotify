/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "../util/store"
import { useRouter } from "next/navigation"
import { KeyboardEvent, MouseEvent, useEffect } from "react"

export default function ImportFollowing() {
  const fetchProfiles = useDataStore((state) => state.fetchProfiles)
  const setFetching = useDataStore((state) => state.setFetching)
  const setActor = useDataStore((state) => state.setActor)
  const router = useRouter()
  const actor = useDataStore((state) => state.actor)
  const setSetupState = useDataStore((state) => state.setSetupState)

  useEffect(() => {
    setSetupState("import")
  }, [setSetupState])

  function getFollowing(actor: string) {
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
      >
        Import following
      </button>
    </>
  )
}

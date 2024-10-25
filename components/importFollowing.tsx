/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useProfilesStore } from "./profilesStore"
import { useRouter } from "next/navigation"
import { KeyboardEvent, MouseEvent } from "react"

export default function ImportFollowing() {
  const fetchProfiles = useProfilesStore((state) => state.fetchProfiles)
  const setFetching = useProfilesStore((state) => state.setFetching)
  const router = useRouter()

  function getFollowing(actor: string) {
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

  return (
    <>
      <input
        className="p-2"
        spellCheck={false}
        type="text"
        onKeyDown={keyDown}
      ></input>
      <button
        className="bg-blue-500 p-2 transition-opacity hover:opacity-75 disabled:opacity-50"
        onClick={click}
        type="button"
      >
        Import following
      </button>
    </>
  )
}

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import ProfileSelectorList from "./profileSelectorList"
import { ChangeEvent, useRef, useState } from "react"

export default function SearchableProfileSelectorList() {
  const [query, setQuery] = useState("")
  const timeout = useRef<NodeJS.Timeout>(undefined)

  function change(event: ChangeEvent<HTMLInputElement>) {
    clearTimeout(timeout.current)
    const value = event.currentTarget.value
    timeout.current = setTimeout(() => setQuery(value), 200)
  }

  return (
    <>
      <input
        className="rounded-lg bg-neutral-200 p-2 font-mono dark:bg-neutral-800"
        placeholder="Search following"
        onChange={change}
      ></input>
      <div className="flex grow flex-col overflow-y-auto">
        <ProfileSelectorList query={query}></ProfileSelectorList>
      </div>
    </>
  )
}

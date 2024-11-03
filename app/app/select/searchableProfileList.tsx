/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import SelectableProfileList from "./selectableProfileList"
import { ChangeEvent, MouseEvent, useRef, useState } from "react"

export default function SearchableProfileList() {
  const [query, setQuery] = useState("")
  const timeout = useRef<NodeJS.Timeout>(undefined)

  function change(event: ChangeEvent<HTMLInputElement>) {
    clearTimeout(timeout.current)
    const value = event.currentTarget.value
    timeout.current = setTimeout(() => setQuery(value), 200)
  }

  function click(event: MouseEvent<SVGSVGElement>) {
    const sibling = event.currentTarget.nextElementSibling
    if (sibling instanceof HTMLInputElement) {
      sibling.focus()
    }
  }

  return (
    <>
      <div className="sticky top-2 z-10 flex rounded-lg after:absolute after:-bottom-2 after:z-0 after:h-[calc(100%+1rem)] after:w-full after:bg-white after:dark:bg-neutral-900">
        <svg
          onClick={click}
          className="z-10 box-content w-5 cursor-pointer rounded-l-lg bg-neutral-100 fill-current p-2 dark:bg-neutral-800"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="10 10 31.66 31.66"
        >
          <path d="M23 36c-7.2 0-13-5.8-13-13s5.8-13 13-13 13 5.8 13 13-5.8 13-13 13zm0-24c-6.1 0-11 4.9-11 11s4.9 11 11 11 11-4.9 11-11-4.9-11-11-11z"></path>
          <path d="M32.682 31.267l8.98 8.98-1.414 1.414-8.98-8.98z"></path>
        </svg>
        <input
          className="z-10 w-full grow rounded-r-lg bg-neutral-100 p-2 font-mono dark:bg-neutral-800"
          placeholder="Search following"
          onChange={change}
        ></input>
      </div>
      <SelectableProfileList query={query}></SelectableProfileList>
    </>
  )
}

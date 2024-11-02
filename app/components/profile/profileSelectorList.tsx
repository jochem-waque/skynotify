/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "../../util/store"
import NoFollowing from "../noFollowing"
import Observable from "../observable"
import Profile from "./profile"
import SelectableProfileInput from "./selectableProfileInput"
import { Fragment, useEffect, useRef, useState } from "react"

export default function ProfileSelectorList() {
  const ref = useRef<HTMLDivElement>(null)
  const scrollTop = useRef(0)
  const profiles = useDataStore((state) => state.profiles)
  const [observer, setObserver] = useState<IntersectionObserver>()
  const [lower, setLower] = useState(0)
  const [upper, setUpper] = useState(30)

  useEffect(() => {
    function listener(entries: IntersectionObserverEntry[]) {
      if (!ref.current?.parentElement) {
        return
      }

      const previousScrollTop = scrollTop.current
      scrollTop.current = ref.current.parentElement.scrollTop

      for (const entry of entries) {
        if (!entry.target.getAttribute("data-valid")) {
          entry.target.setAttribute("data-valid", "true")
          return
        }

        const indexAttribute = entry.target.getAttribute("data-index")
        if (!indexAttribute) {
          return
        }

        const index = parseInt(indexAttribute)

        if (ref.current.parentElement.scrollTop > previousScrollTop) {
          if (!entry.isIntersecting) {
            setLower(Math.max(index - 10, 0))
          } else {
            setUpper(index + 20)
          }
        } else if (ref.current.parentElement.scrollTop < previousScrollTop) {
          if (!entry.isIntersecting) {
            setUpper(index + 20)
          } else {
            setLower(Math.max(index - 10, 0))
          }
        }
      }
    }

    setObserver(new IntersectionObserver(listener))
  }, [])

  return (
    <div
      ref={ref}
      style={{ minHeight: `${profiles.size * 4.5 - 0.5}rem` }}
      className="relative w-full"
    >
      <NoFollowing></NoFollowing>
      {[...profiles.entries()].slice(lower, upper).map(([did, profile], i) => (
        <Fragment key={did}>
          {(i + lower) % 10 === 0 && (
            <Observable
              index={i + lower}
              observer={observer}
              style={{ top: `${(i + lower) * 4.5}rem` }}
            ></Observable>
          )}
          <label
            style={{ top: `${(i + lower) * 4.5}rem` }}
            className="absolute flex w-full cursor-pointer select-none items-center justify-between gap-2 rounded-lg bg-neutral-100 p-2 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:disabled]:opacity-75 has-[:focus-visible]:opacity-75 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white has-[:checked]:dark:bg-blue-600"
          >
            <Profile
              avatar={profile.avatar}
              displayName={profile.displayName}
              handle={profile.handle}
            ></Profile>
            <SelectableProfileInput did={did}></SelectableProfileInput>
          </label>
        </Fragment>
      ))}
    </div>
  )
}

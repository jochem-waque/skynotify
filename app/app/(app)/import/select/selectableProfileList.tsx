/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import Profile from "@/components/profile"
import { useDataStore } from "@/util/store"
import Fuse from "fuse.js"
import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import SelectableProfileInput from "./selectableProfileInput"

export default function SelectableProfileList({
  query,
  chunkSize,
}: {
  query: string
  chunkSize: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const profiles = useDataStore((state) => state.profiles)
  const [lower, setLower] = useState(0)
  const [upper, setUpper] = useState(50)
  const throttled = useRef(false)
  const previousQuery = useRef<string>("")

  const filteredProfiles = useMemo(() => {
    if (!query) {
      return [...profiles.entries()]
    }

    const keys = [...profiles.keys()]
    const values = [...profiles.values()]

    const fuse = new Fuse(values, {
      threshold: 0.3,
      keys: ["handle", "displayName", "description"],
    })

    return fuse
      .search(query, { limit: 50 })
      .map(({ item, refIndex }) => [keys[refIndex]!, item] as const)
  }, [profiles, query])

  const size = useRef(filteredProfiles.length)

  useEffect(() => {
    size.current = filteredProfiles.length
  }, [filteredProfiles])

  useEffect(() => {
    if (previousQuery.current === query) {
      return
    }

    window.requestAnimationFrame(() => {
      const rect = ref.current?.getBoundingClientRect()
      if (!rect) {
        return
      }

      // TODO don't use magic number
      const offset = (rect.height / size.current) * 1.3
      window.scrollBy({ top: rect.y - offset })
    })
  }, [query])

  // IntersectionObserver worked, but you could scroll past the observed
  // elements. This is much simpler. IntersectionObserver also didn't work with
  // dev tools open for some reason.
  useEffect(() => {
    function listener() {
      if (throttled.current) {
        return
      }

      throttled.current = true

      const rect = ref.current?.getBoundingClientRect()
      window.requestAnimationFrame(() => {
        if (!rect) {
          throttled.current = false
          return
        }

        const profileHeight = rect.height / size.current

        const exactLower = Math.floor(Math.max(0, -rect.y) / profileHeight)
        const exactUpper =
          exactLower + Math.ceil(window.innerHeight / profileHeight)
        setLower(Math.max(0, Math.floor(exactLower / chunkSize)) * chunkSize)
        setUpper(Math.ceil(exactUpper / chunkSize) * chunkSize)
        throttled.current = false
      })
    }

    document.addEventListener("scroll", listener)

    return () => document.removeEventListener("scroll", listener)
  }, [chunkSize])

  return (
    <div
      ref={ref}
      style={{ minHeight: `${filteredProfiles.length * 4.5 - 0.5}rem` }}
      className="relative w-full grow"
    >
      {filteredProfiles.slice(lower, upper).map(([did, profile], i) => (
        <Fragment key={did}>
          <label
            style={{ top: `${(i + lower) * 4.5}rem` }}
            className="absolute flex min-h-16 w-full cursor-pointer items-center justify-between gap-2 rounded-lg bg-neutral-100 p-2 transition select-none hover:opacity-75 has-checked:bg-blue-400 has-focus-visible:opacity-75 has-focus-visible:outline-2 has-disabled:opacity-75 dark:bg-neutral-800 dark:has-checked:bg-blue-600"
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

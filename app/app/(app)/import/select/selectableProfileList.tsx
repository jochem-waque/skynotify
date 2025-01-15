/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import Profile from "@/components/profile"
import { useDataStore } from "@/util/store"
import Fuse from "fuse.js"
import { Fragment, useMemo } from "react"
import SelectableProfileInput from "./selectableProfileInput"

export default function SelectableProfileList({ query }: { query: string }) {
  const profiles = useDataStore((state) => state.profiles)
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

  return (
    <div className="flex w-full grow flex-col gap-2">
      {filteredProfiles.map(([did, profile]) => (
        <Fragment key={did}>
          <label className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-2 rounded-lg bg-neutral-100 p-2 transition select-none hover:opacity-75 has-checked:bg-blue-400 has-focus-visible:opacity-75 has-focus-visible:outline-2 has-disabled:opacity-75 dark:bg-neutral-800 dark:has-checked:bg-blue-600">
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

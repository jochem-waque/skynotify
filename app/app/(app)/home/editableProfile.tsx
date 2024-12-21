/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import Profile from "@/components/profile"
import { Profile as ProfileData, useDataStore } from "@/util/store"
import { useState } from "react"
import NotifyPostsInput from "../import/specify/notifyPostsInput"
import NotifyRepliesInput from "../import/specify/notifyRepliesInput"
import NotifyRepostsInput from "../import/specify/notifyRepostsInput"

export default function EditableProfile({
  did,
  profile,
}: {
  did: string
  profile: ProfileData
}) {
  const setSelected = useDataStore((state) => state.setSelected)
  const setUnsaved = useDataStore((state) => state.setUnsaved)
  const isSelected = useDataStore((state) => state.isSelected)
  const [thisSelected, setThisSelected] = useState(isSelected(did))

  function click() {
    setSelected(did)
    setThisSelected((value) => !value)
    setUnsaved()
  }

  return (
    <div
      aria-disabled={!thisSelected}
      className="group aria-disabled:bg-opacity-50 flex items-center justify-between rounded-lg bg-neutral-100 p-2 transition-colors dark:bg-neutral-800"
    >
      <div className="flex flex-col gap-2 transition-opacity group-aria-disabled:pointer-events-none group-aria-disabled:opacity-50">
        <Profile
          avatar={profile.avatar}
          handle={profile.handle}
          displayName={profile.displayName}
        ></Profile>
        <form className="flex flex-wrap gap-2">
          <label className="flex cursor-pointer items-center rounded-full bg-neutral-200 px-3 py-1 transition hover:opacity-75 has-checked:bg-blue-400 has-focus-visible:outline-2 dark:bg-neutral-700 dark:has-checked:bg-blue-600">
            <span className="select-none">Posts</span>
            <NotifyPostsInput did={did}></NotifyPostsInput>
          </label>
          <label className="flex cursor-pointer items-center rounded-full bg-neutral-200 px-3 py-1 transition hover:opacity-75 has-checked:bg-blue-400 has-focus-visible:outline-2 dark:bg-neutral-700 dark:has-checked:bg-blue-600">
            <span className="select-none">Reposts</span>
            <NotifyRepostsInput did={did}></NotifyRepostsInput>
          </label>
          <label className="flex cursor-pointer items-center rounded-full bg-neutral-200 px-3 py-1 transition hover:opacity-75 has-checked:bg-blue-400 has-focus-visible:outline-2 dark:bg-neutral-700 dark:has-checked:bg-blue-600">
            <span className="select-none">Replies</span>
            <NotifyRepliesInput did={did}></NotifyRepliesInput>
          </label>
        </form>
      </div>
      <button
        className="aspect-square min-w-8 rounded-full bg-neutral-200 transition group-aria-disabled:rotate-45 hover:opacity-75 dark:bg-neutral-700"
        type="button"
        onClick={click}
      >
        ✕
      </button>
    </div>
  )
}

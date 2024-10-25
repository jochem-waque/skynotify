/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import Profile from "./profile"
import { useProfilesStore } from "./profilesStore"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { ChangeEvent } from "react"

export default function SelectableProfile({
  avatar,
  displayName,
  handle,
  did,
  defaultChecked,
}: Pick<ProfileView, "avatar" | "displayName" | "handle" | "did"> & {
  defaultChecked: boolean
}) {
  const setSelected = useProfilesStore((state) => state.setSelected)

  function change(event: ChangeEvent<HTMLInputElement>) {
    setSelected(event.currentTarget.name, event.currentTarget.checked)
  }

  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg bg-neutral-100 p-2 transition hover:opacity-75 has-[:checked]:bg-blue-500 has-[:focus-visible]:opacity-75 dark:bg-neutral-900">
      <Profile
        avatar={avatar}
        displayName={displayName}
        handle={handle}
      ></Profile>
      <input
        onChange={change}
        defaultChecked={defaultChecked}
        name={did}
        type="checkbox"
      ></input>
    </label>
  )
}

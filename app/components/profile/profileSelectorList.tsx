/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "../../util/store"
import Profile from "./profile"
import SelectableProfileInput from "./selectableProfileInput"

export default function ProfileSelectorList() {
  const profiles = useDataStore((state) => state.profiles)

  return (
    <>
      {[...profiles.entries()].map(([did, profile]) => (
        <label
          key={did}
          className="flex cursor-pointer select-none items-center justify-between gap-2 rounded-lg bg-neutral-100 p-2 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:disabled]:opacity-75 has-[:focus-visible]:opacity-75 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white has-[:checked]:dark:bg-blue-600"
        >
          <Profile
            avatar={profile.avatar}
            displayName={profile.displayName}
            handle={profile.handle}
          ></Profile>
          <SelectableProfileInput did={did}></SelectableProfileInput>
        </label>
      ))}
    </>
  )
}

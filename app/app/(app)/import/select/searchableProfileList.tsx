/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import Profile from "@/components/profile"
import SearchableList from "@/components/searchableList"
import { useDataStore } from "@/util/store"
import SelectableProfileInput from "./selectableProfileInput"

export default function SearchableProfileList() {
  const profiles = useDataStore((state) => state.profiles)

  return (
    <SearchableList
      placeholder="Search following"
      items={[...profiles.entries()].map(([did, value]) => ({ did, ...value }))}
      renderItem={({ did, ...profile }) => (
        <label
          key={did}
          className="has-checked:bg-primary flex min-h-16 w-full cursor-pointer items-center justify-between gap-2 rounded-lg bg-neutral-200 p-2 transition select-none hover:opacity-75 has-focus-visible:opacity-75 has-focus-visible:outline-2 has-disabled:opacity-75 dark:bg-neutral-800"
        >
          <Profile
            avatar={profile.avatar}
            displayName={profile.displayName}
            handle={profile.handle}
          ></Profile>
          <SelectableProfileInput did={did}></SelectableProfileInput>
        </label>
      )}
      keys={["handle", "displayName", "description"]}
    ></SearchableList>
  )
}

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import Profile from "@/components/profile"
import SearchableList from "@/components/searchableList"
import { useDataStore } from "@/util/store"
import NotifyPostsInput from "./notifyPostsInput"
import NotifyRepliesInput from "./notifyRepliesInput"
import NotifyRepostsInput from "./notifyRepostsInput"

// TODO in the future, this might need infinite scroll and a searchbar too
export default function ProfileListWithChip() {
  const profiles = useDataStore((state) => state.profiles)
  const selected = useDataStore((state) => state.selected)

  return (
    <SearchableList
      items={[...profiles.entries()]
        .filter(([did]) => selected.has(did))
        .map(([did, value]) => ({ did, ...value }))}
      renderItem={({ did, ...profile }) => (
        <div
          className="flex flex-col gap-2 rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800"
          key={did}
        >
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
      )}
      keys={["handle", "displayName", "description"]}
      placeholder="Search profiles"
    ></SearchableList>
  )
}

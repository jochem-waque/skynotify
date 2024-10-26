/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import NotificationChipInput from "./notificationChipInput"
import Profile from "@/components/profile/profile"
import { useProfilesStore } from "@/util/profilesStore"

export default function ProfileChipsList() {
  const profiles = useProfilesStore((state) => state.profiles)
  const selected = useProfilesStore((state) => state.selected)

  return [...profiles.entries()]
    .filter(([did]) => selected.has(did))
    .map(([did, profile]) => (
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
          <label className="flex items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-700 dark:outline-white has-[:checked]:dark:bg-blue-600">
            <span className="select-none">Posts</span>
            <NotificationChipInput
              did={did}
              type={"posts"}
            ></NotificationChipInput>
          </label>
          <label className="flex items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-700 dark:outline-white has-[:checked]:dark:bg-blue-600">
            <span className="select-none">Reposts</span>
            <NotificationChipInput
              did={did}
              type={"reposts"}
            ></NotificationChipInput>
          </label>
          <label className="flex items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-700 dark:outline-white has-[:checked]:dark:bg-blue-600">
            <span className="select-none">Replies</span>
            <NotificationChipInput
              did={did}
              type={"replies"}
            ></NotificationChipInput>
          </label>
        </form>
      </div>
    ))
}

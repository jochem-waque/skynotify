/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import Profile from "@/components/profile"
import { useProfilesStore } from "@/components/profilesStore"
import { useEffect } from "react"

export default function Page() {
    const profiles = useProfilesStore((state) => state.profiles)
const syncSelected = useProfilesStore((state) => state.syncSelected)

  useEffect(() => {
    syncSelected()
  }, [syncSelected])

  return (
    <main className="flex w-full max-w-lg flex-col gap-2">
      {profiles
        .filter((profile) => profile.selected)
        .map((profile) => (
          <div
            className="flex flex-col gap-2 rounded-lg bg-neutral-100 p-2 dark:bg-neutral-900"
            key={profile.did}
          >
            <Profile
              avatar={profile.avatar}
              handle={profile.handle}
              displayName={profile.displayName}
            ></Profile>
            <div className="flex flex-wrap gap-2">
              <label className="relative flex items-center rounded-full bg-neutral-200 px-2 outline-2 outline-black has-[:checked]:bg-blue-500 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white">
                <span className="z-10">Posts</span>
                <input className="h-0 w-0" type="checkbox"></input>
              </label>
              <label className="relative flex items-center rounded-full bg-neutral-200 px-2 outline-2 outline-black has-[:checked]:bg-blue-500 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white">
                <span className="z-10">Reposts</span>
                <input className="h-0 w-0" type="checkbox"></input>
              </label>
              <label className="relative flex items-center rounded-full bg-neutral-200 px-2 outline-2 outline-black has-[:checked]:bg-blue-500 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white">
                <span className="z-10">Replies</span>
                <input className="h-0 w-0" type="checkbox"></input>
              </label>
            </div>
          </div>
        ))}
    </main>
  )
}

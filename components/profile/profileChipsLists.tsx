/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import NotificationChips from "@/components/profile/notificationChips"
import Profile from "@/components/profile/profile"
import { useProfilesStore } from "@/util/profilesStore"
import { useEffect } from "react"

export default function ProfileChipsList() {
  const profiles = useProfilesStore((state) => state.profiles)
  const syncSelected = useProfilesStore((state) => state.syncSelected)

  useEffect(() => {
    syncSelected()
  }, [syncSelected])

  return profiles
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
        <NotificationChips
          did={profile.did}
          defaultPosts={profile.notifyPosts}
          defaultReplies={profile.notifyReplies}
          defaultReposts={profile.notifyReposts}
        ></NotificationChips>
      </div>
    ))
}

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useProfilesStore } from "../../util/profilesStore"
import SelectableProfile from "./selectableProfile"

export default function ProfileSelectorList() {
  const profiles = useProfilesStore((state) => state.profiles)

  return (
    <>
      {[...profiles.entries()].map(([did, profile]) => (
        <SelectableProfile
          avatar={profile.avatar}
          displayName={profile.displayName}
          handle={profile.handle}
          key={did}
          did={did}
        ></SelectableProfile>
      ))}
    </>
  )
}

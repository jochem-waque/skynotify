/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useProfilesStore } from "./profilesStore"
import SelectableProfile from "./selectableProfile"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfileSelectorList() {
  const fetching = useProfilesStore((state) => state.fetching)
  const profiles = useProfilesStore((state) => state.profiles)
  const router = useRouter()

  useEffect(() => {
    if (profiles.length === 0 && !fetching) {
      router.push("import")
    }
  }, [router, profiles, fetching])

  return (
    <>
      {profiles.map((profile) => (
        <SelectableProfile
          avatar={profile.avatar}
          displayName={profile.displayName}
          handle={profile.handle}
          key={profile.did}
          did={profile.did}
          defaultChecked={profile.selected}
        ></SelectableProfile>
      ))}
    </>
  )
}

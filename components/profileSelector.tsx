/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useProfilesStore } from "./profilesStore"
import SelectableProfile from "./selectableProfile"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect } from "react"

export default function ProfileSelector() {
  const fetching = useProfilesStore((state) => state.fetching)
  const profiles = useProfilesStore((state) => state.profiles)
  const toggleSelected = useProfilesStore((state) => state.toggleSelected)
  const router = useRouter()

  useEffect(() => {
    if (profiles.length === 0 && !fetching) {
      router.push("import")
    }
  }, [router, profiles, fetching])

  function change(event: FormEvent<HTMLFormElement>) {
    if (!(event.target instanceof HTMLInputElement)) {
      return
    }

    toggleSelected(event.target.name)
  }

  return (
    <form
      onChange={change}
      className="flex w-full flex-col gap-2 overflow-y-auto"
    >
      {profiles.map((profile) => (
        <SelectableProfile
          avatar={profile.avatar}
          displayName={profile.displayName}
          handle={profile.handle}
          key={profile.did}
          did={profile.did}
        ></SelectableProfile>
      ))}
    </form>
  )
}

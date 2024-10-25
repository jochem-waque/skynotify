/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useProfilesStore } from "./profilesStore"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RedirectOnEmptyStore() {
  const fetching = useProfilesStore((state) => state.fetching)
  const profiles = useProfilesStore((state) => state.profiles)
  const router = useRouter()

  useEffect(() => {
    if (profiles.length === 0 && !fetching) {
      router.push("import")
    }
  }, [router, profiles, fetching])

  return null
}

/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function NoFollowing() {
  const router = useRouter()

  const fetching = useDataStore((state) => state.fetching)
  const profiles = useDataStore((state) => state.profiles)

  useEffect(() => {
    if (!fetching && profiles.size === 0) {
      router.replace("/import")
    }
  }, [fetching, profiles, router])

  return null
}

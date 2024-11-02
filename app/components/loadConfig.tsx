/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { useEffect } from "react"

export default function LoadConfig() {
  const hasHydrated = useDataStore((state) => state.hasHydrated)
  const loadSaved = useDataStore((state) => state.loadSaved)

  useEffect(() => {
    if (hasHydrated) {
      loadSaved()
    }
  }, [hasHydrated, loadSaved])

  return null
}

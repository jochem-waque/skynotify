/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { useEffect } from "react"

export default function PruneProfiles() {
  const pruneProfiles = useDataStore((state) => state.pruneProfiles)
  const setUnsaved = useDataStore((state) => state.setUnsaved)

  useEffect(() => {
    pruneProfiles()
    setUnsaved(false)
  }, [pruneProfiles, setUnsaved])

  return null
}

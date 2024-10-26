/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useProfilesStore } from "@/util/profilesStore"
import { useEffect } from "react"

export default function SyncSelected() {
  const syncSelected = useProfilesStore((state) => state.syncSelected)

  useEffect(() => {
    syncSelected()
  }, [syncSelected])

  return null
}

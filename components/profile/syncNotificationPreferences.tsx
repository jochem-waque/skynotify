/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useProfilesStore } from "../../util/profilesStore"
import { useEffect } from "react"

export default function SyncNotificationPreferences() {
  const syncNotificationPreferences = useProfilesStore(
    (state) => state.syncNotificationPreferences,
  )
  useEffect(() => {
    syncNotificationPreferences()
  }, [syncNotificationPreferences])

  return null
}

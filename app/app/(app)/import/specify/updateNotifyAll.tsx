/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { useEffect } from "react"

export default function UpdateNotifyAll() {
  const updateNotifyAll = useDataStore((state) => state.updateNotifyAll)
  const selected = useDataStore((state) => state.selected)

  useEffect(() => {
    updateNotifyAll()
  }, [updateNotifyAll, selected])

  return null
}

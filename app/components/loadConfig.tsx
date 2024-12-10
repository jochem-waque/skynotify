/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { useEffect } from "react"

export default function LoadConfig() {
  const loadSaved = useDataStore((state) => state.loadSaved)
  const fetchSelected = useDataStore((state) => state.fetchSelected)

  useEffect(() => {
    loadSaved()
    fetchSelected()
  }, [loadSaved, fetchSelected])

  return null
}

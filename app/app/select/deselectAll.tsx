/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { useMemo } from "react"

export default function DeselectAll() {
  const deselectAll = useDataStore((state) => state.deselectAll)
  const selectAll = useDataStore((state) => state.selectAll)
  const selected = useDataStore((state) => state.selected)
  const profiles = useDataStore((state) => state.profiles)

  const overlap = useMemo(
    () => selected.intersection(profiles).size > 0,
    [selected, profiles],
  )

  return (
    <button
      onClick={() => (overlap ? deselectAll() : selectAll())}
      className={`${overlap ? "bg-blue-400 dark:bg-blue-600" : "bg-neutral-100 dark:bg-neutral-800"} self-start rounded-full px-3 py-1 transition-[opacity,background-color] hover:opacity-75`}
      type="button"
    >
      {overlap ? "Deselect all" : "Select all"}
    </button>
  )
}

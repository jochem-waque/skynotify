/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"

export default function ToggleSelectAll() {
  const toggleSelectAll = useDataStore((state) => state.toggleSelectAll)
  const allSelected = useDataStore((state) => state.allSelected)

  return (
    <button
      onClick={() => toggleSelectAll()}
      className={`${allSelected ? "bg-primary" : "bg-neutral-200 dark:bg-neutral-800"} self-start rounded-full px-3 py-1 transition-[opacity,background-color] hover:opacity-75`}
      type="button"
    >
      {allSelected ? "Deselect all" : "Select all"}
    </button>
  )
}

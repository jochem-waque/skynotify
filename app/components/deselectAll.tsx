/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"

export default function DeselectAll() {
  const deselectAll = useDataStore((state) => state.deselectAll)
  const selected = useDataStore((state) => state.selected)

  return (
    <button
      onClick={() => deselectAll()}
      className={`${selected.size > 0 ? "bg-blue-400 dark:bg-blue-600" : "bg-neutral-100 dark:bg-neutral-800"} self-start rounded-full px-3 py-1 transition-[opacity,background-color] hover:opacity-75`}
      type="button"
    >
      Deselect all
    </button>
  )
}

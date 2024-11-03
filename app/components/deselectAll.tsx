/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"

export default function DeselectAll() {
  const deselectAll = useDataStore((state) => state.deselectAll)

  return (
    <button
      onClick={() => deselectAll()}
      className="self-start rounded-full bg-neutral-100 px-3 py-1 transition-opacity hover:opacity-75 dark:bg-neutral-800"
    >
      Deselect all
    </button>
  )
}

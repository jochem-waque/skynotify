/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"

export default function SelectAllChipInput() {
  const allSelected = useDataStore((state) => state.allSelected)
  const toggleSelectAll = useDataStore((state) => state.toggleSelectAll)

  function change() {
    toggleSelectAll()
  }

  return (
    <input
      checked={allSelected}
      className="peer h-0 w-0"
      type="checkbox"
      onChange={change}
    ></input>
  )
}

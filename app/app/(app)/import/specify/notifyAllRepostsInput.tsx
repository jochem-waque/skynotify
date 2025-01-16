/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"

export default function NotifyAllRepostsInput() {
  const allNotifyReposts = useDataStore((state) => state.allNotifyReposts)
  const toggleNotifyRepostsAll = useDataStore(
    (state) => state.toggleNotifyRepostsAll,
  )

  function change() {
    toggleNotifyRepostsAll()
  }

  return (
    <input
      checked={allNotifyReposts}
      className="peer h-0 w-0"
      type="checkbox"
      onChange={change}
    ></input>
  )
}

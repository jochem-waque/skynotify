/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"

export default function NotifyAllRepliesInput() {
  const allNotifyReplies = useDataStore((state) => state.allNotifyReplies)
  const toggleNotifyRepliesAll = useDataStore(
    (state) => state.toggleNotifyRepliesAll,
  )

  function change() {
    toggleNotifyRepliesAll()
  }

  return (
    <input
      checked={allNotifyReplies}
      className="peer h-0 w-0"
      type="checkbox"
      onChange={change}
    ></input>
  )
}

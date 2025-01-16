/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"

export default function NotifyAllPostsInput() {
  const allNotifyPosts = useDataStore((state) => state.allNotifyPosts)
  const toggleNotifyPostsAll = useDataStore(
    (state) => state.toggleNotifyPostsAll,
  )

  function change() {
    toggleNotifyPostsAll()
  }

  return (
    <input
      checked={allNotifyPosts}
      className="peer h-0 w-0"
      type="checkbox"
      onChange={change}
    ></input>
  )
}

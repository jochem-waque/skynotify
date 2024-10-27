/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import {
  updateAllNotifyPosts,
  updateAllNotifyReplies,
  updateAllNotifyReposts,
  useProfilesStore,
} from "@/util/profilesStore"

export default function NotifyAllChipInput({
  type,
}: {
  type: "posts" | "reposts" | "replies"
}) {
  const checked = useProfilesStore((state) =>
    type === "posts"
      ? state.allNotifyPosts
      : type === "reposts"
        ? state.allNotifyReposts
        : state.allNotifyReplies,
  )
  const toggleAll = useProfilesStore((state) =>
    type === "posts"
      ? state.toggleNotifyPostsAll
      : type === "reposts"
        ? state.toggleNotifyRepostsAll
        : state.toggleNotifyRepliesAll,
  )
  const update =
    type === "posts"
      ? updateAllNotifyPosts
      : type === "reposts"
        ? updateAllNotifyReposts
        : updateAllNotifyReplies

  function change() {
    toggleAll()
    update()
  }

  return (
    <input
      checked={checked}
      className="peer h-0 w-0"
      type="checkbox"
      onChange={change}
    ></input>
  )
}

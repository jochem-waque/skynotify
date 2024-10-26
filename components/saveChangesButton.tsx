/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { save } from "@/actions/save"
import { useProfilesStore } from "@/util/profilesStore"

export default function SaveChangesButton() {
  const notifyPosts = useProfilesStore((state) => state.notifyPosts)
  const notifyReposts = useProfilesStore((state) => state.notifyReposts)
  const notifyReplies = useProfilesStore((state) => state.notifyReplies)

  async function click() {
    await save(
      [...notifyPosts.union(notifyReposts).union(notifyReplies)].map((did) => ({
        target: did,
        posts: notifyPosts.has(did),
        reposts: notifyReposts.has(did),
        replies: notifyReplies.has(did),
      })),
    )
  }

  return (
    <button
      onClick={click}
      type="button"
      className="z-10 w-full rounded-lg bg-blue-400 p-4 text-center dark:bg-blue-600"
    >
      Save changes
    </button>
  )
}

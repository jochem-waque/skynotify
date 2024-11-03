/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
export default function ImmutableChipList({
  posts,
  reposts,
  replies,
}: {
  posts: boolean
  reposts: boolean
  replies: boolean
}) {
  return (
    <>
      <span
        className={`${posts ? "bg-blue-400 dark:bg-blue-600" : "bg-neutral-200 dark:bg-neutral-700"} select-none rounded-full px-3 py-1`}
      >
        Posts
      </span>
      <span
        className={`${reposts ? "bg-blue-400 dark:bg-blue-600" : "bg-neutral-200 dark:bg-neutral-700"} select-none rounded-full px-3 py-1`}
      >
        Replies
      </span>
      <span
        className={`${replies ? "bg-blue-400 dark:bg-blue-600" : "bg-neutral-200 dark:bg-neutral-700"} select-none rounded-full px-3 py-1`}
      >
        Reposts
      </span>
    </>
  )
}

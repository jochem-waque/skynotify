/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import NotificationChipInput from "./notificationChipInput"

export default function NotificationChips({
  did,
  defaultPosts,
  defaultReposts,
  defaultReplies,
}: {
  did: string
  defaultPosts: boolean
  defaultReposts: boolean
  defaultReplies: boolean
}) {
  return (
    <form className="flex flex-wrap gap-2">
      <label className="relative flex items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-500 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white">
        <span className="z-10 select-none">Posts</span>
        <NotificationChipInput
          did={did}
          defaultChecked={defaultPosts}
          name={"posts"}
        ></NotificationChipInput>
      </label>
      <label className="relative flex items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-500 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white">
        <span className="z-10 select-none">Reposts</span>
        <NotificationChipInput
          did={did}
          defaultChecked={defaultReposts}
          name={"reposts"}
        ></NotificationChipInput>
      </label>
      <label className="relative flex items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-500 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white">
        <span className="z-10 select-none">Replies</span>
        <NotificationChipInput
          did={did}
          defaultChecked={defaultReplies}
          name={"replies"}
        ></NotificationChipInput>
      </label>
    </form>
  )
}

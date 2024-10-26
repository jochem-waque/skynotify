/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import NotificationChipInput from "./notificationChipInput"

export default function NotificationChips({ did }: { did: string }) {
  return (
    <form className="flex flex-wrap gap-2">
      <label className="flex items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-700 dark:outline-white has-[:checked]:dark:bg-blue-600">
        <span className="select-none">Posts</span>
        <NotificationChipInput did={did} name={"posts"}></NotificationChipInput>
      </label>
      <label className="flex items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-700 dark:outline-white has-[:checked]:dark:bg-blue-600">
        <span className="select-none">Reposts</span>
        <NotificationChipInput
          did={did}
          name={"reposts"}
        ></NotificationChipInput>
      </label>
      <label className="flex items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-700 dark:outline-white has-[:checked]:dark:bg-blue-600">
        <span className="select-none">Replies</span>
        <NotificationChipInput
          did={did}
          name={"replies"}
        ></NotificationChipInput>
      </label>
    </form>
  )
}

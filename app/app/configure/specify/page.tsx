/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import NotifyAllChipInput from "@/components/profile/notifyAllChipInput"
import ProfileChipsList from "@/components/profile/profileChipsLists"
import SaveChangesButton from "@/components/saveChangesButton"

export default function Page() {
  return (
    <main className="flex w-full grow flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl">Set notifications</h1>
        <p>
          Finally, select the kinds of notifications you&apos;d like to receive
          from each profile.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="flex items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white has-[:checked]:dark:bg-blue-600">
          <NotifyAllChipInput type={"posts"}></NotifyAllChipInput>
          <span className="select-none">Posts</span>
        </label>
        <label className="flex items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white has-[:checked]:dark:bg-blue-600">
          <NotifyAllChipInput type={"reposts"}></NotifyAllChipInput>
          <span className="select-none">Reposts</span>
        </label>
        <label className="flex items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white has-[:checked]:dark:bg-blue-600">
          <NotifyAllChipInput type={"replies"}></NotifyAllChipInput>
          <span className="select-none">Replies</span>
        </label>
      </div>
      <div className="flex flex-col gap-2">
        <ProfileChipsList></ProfileChipsList>
      </div>
      <div className="sticky bottom-4 mt-auto flex after:absolute after:-bottom-4 after:left-0 after:z-0 after:h-[calc(100%+2rem)] after:w-full after:bg-white after:dark:bg-neutral-900">
        <SaveChangesButton></SaveChangesButton>
      </div>
    </main>
  )
}

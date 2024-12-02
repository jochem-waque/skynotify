/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import NoFollowing from "@/components/noFollowing"
import { Metadata } from "next"
import NotifyAllChipInput from "./notifyAllChipInput"
import ProfileListWithChip from "./profileListWithChip"
import SaveChangesButton from "./saveChangesButton"

export const metadata: Metadata = {
  title: "Set notifications | SkyNotify",
  robots: "none",
}

export default function Page() {
  return (
    <>
      <main className="flex flex-col gap-4">
        <h1 className="text-2xl">Set notifications</h1>
        <div className="flex flex-col gap-2">
          <p>
            Select the kinds of notifications you&apos;d like to receive from
            each profile.
          </p>
          <div className="flex flex-wrap gap-2">
            <label className="flex cursor-pointer items-center rounded-full bg-neutral-100 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white has-[:checked]:dark:bg-blue-600">
              <NotifyAllChipInput type={"posts"}></NotifyAllChipInput>
              <span className="select-none">Posts</span>
            </label>
            <label className="flex cursor-pointer items-center rounded-full bg-neutral-100 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white has-[:checked]:dark:bg-blue-600">
              <NotifyAllChipInput type={"reposts"}></NotifyAllChipInput>
              <span className="select-none">Reposts</span>
            </label>
            <label className="flex cursor-pointer items-center rounded-full bg-neutral-100 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white has-[:checked]:dark:bg-blue-600">
              <NotifyAllChipInput type={"replies"}></NotifyAllChipInput>
              <span className="select-none">Replies</span>
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <ProfileListWithChip></ProfileListWithChip>
          </div>
          <div className="sticky bottom-2 flex w-full flex-col gap-2 after:absolute after:-bottom-2 after:z-0 after:h-[calc(100%+1rem)] after:w-full after:bg-white after:dark:bg-neutral-900">
            <SaveChangesButton></SaveChangesButton>
          </div>
        </div>
      </main>
      <NoFollowing></NoFollowing>
    </>
  )
}

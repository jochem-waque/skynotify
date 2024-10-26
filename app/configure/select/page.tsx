/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import NoFollowing from "@/components/noFollowing"
import ProfileSelectorList from "@/components/profile/profileSelectorList"
import SelectAllChipInput from "@/components/profile/selectAllChipInput"
import Link from "next/link"

export default function Page() {
  return (
    <main className="flex w-full max-w-lg grow flex-col items-start gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl">Select</h1>
        <p>
          Now, select the accounts you&apos;d like to receive notifications for.
          You&apos;ll be able to set the types of notifications later.
        </p>
      </div>
      <label className="flex items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white has-[:checked]:dark:bg-blue-600">
        <SelectAllChipInput></SelectAllChipInput>
        <span className="select-none peer-checked:hidden">Select all</span>
        <span className="hidden select-none peer-checked:inline">
          Deselect all
        </span>
      </label>
      <div className="flex w-full flex-col gap-2">
        <NoFollowing></NoFollowing>
        <ProfileSelectorList></ProfileSelectorList>
      </div>
      <div className="sticky bottom-4 mt-auto flex w-full after:absolute after:-bottom-4 after:left-0 after:z-0 after:h-[calc(100%+2rem)] after:w-full after:bg-white after:dark:bg-neutral-900">
        <Link
          href="specify"
          className="z-10 w-full rounded-lg bg-blue-400 p-4 text-center dark:bg-blue-600"
        >
          Continue
        </Link>
      </div>
    </main>
  )
}

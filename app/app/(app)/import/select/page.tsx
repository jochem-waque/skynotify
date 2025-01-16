/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import NoFollowing from "@/components/noFollowing"
import ProgressBar from "@/components/progressBar"
import { Metadata } from "next"
import Link from "next/link"
import SearchableProfileList from "./searchableProfileList"
import ToggleSelectAll from "./toggleSelectAll"

export const metadata: Metadata = {
  title: "Select profiles | SkyNotify",
  robots: "none",
}

export default function Page() {
  return (
    <>
      <main className="flex flex-col gap-4">
        <h1 className="text-2xl">Select profiles</h1>
        <div className="flex flex-col gap-2">
          <p>
            Select all the profiles you&apos;d like to receive notifications
            for. You&apos;ll be able to specify the kinds of notifications
            you&apos;d like to receive from each profile later.
          </p>
          <ToggleSelectAll></ToggleSelectAll>
          <ProgressBar></ProgressBar>
          <SearchableProfileList></SearchableProfileList>
          <div className="sticky bottom-18 flex w-full after:absolute after:-bottom-2 after:z-0 after:h-[calc(100%+1rem)] after:w-full after:bg-neutral-100 dark:after:bg-neutral-900">
            <Link
              href="specify"
              className="bg-primary z-10 w-full rounded-lg p-4 text-center transition-opacity hover:opacity-75"
            >
              Continue
            </Link>
          </div>
        </div>
      </main>
      <NoFollowing></NoFollowing>
    </>
  )
}

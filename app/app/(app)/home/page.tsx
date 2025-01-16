/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { Metadata } from "next"
import Configuration from "./configuration"
import PruneProfiles from "./pruneProfiles"
import SaveChangesButton from "./saveChangesButton"

export const metadata: Metadata = {
  title: "Overview | SkyNotify",
}

export default function Page() {
  return (
    <>
      <main className="flex flex-col gap-4">
        <h1 className="text-2xl">Home</h1>
        <div className="flex flex-col gap-2">
          <p>
            You&apos;re currently receiving notifications for the following
            accounts:
          </p>
          <PruneProfiles></PruneProfiles>
          <Configuration></Configuration>
          <div className="sticky bottom-18 flex w-full flex-col gap-2 after:absolute after:-bottom-2 after:z-0 after:h-[calc(100%*(1+1/3))] after:w-full after:bg-white dark:after:bg-neutral-900">
            <SaveChangesButton></SaveChangesButton>
          </div>
        </div>
      </main>
    </>
  )
}

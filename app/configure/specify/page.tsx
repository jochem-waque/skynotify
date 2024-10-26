/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import ProfileChipsList from "@/components/profile/profileChipsLists"
import SyncSelected from "@/components/profile/syncSelected"
import Link from "next/link"

export default function Page() {
  return (
    <main className="flex w-full max-w-lg grow flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl">Set notifications</h1>
        <p>
          Finally, select the types of notifications you&apos;d like to receive
          for each account.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <ProfileChipsList></ProfileChipsList>
      </div>
      <div className="sticky bottom-4 mt-auto flex after:absolute after:-bottom-4 after:z-0 after:h-[calc(100%+2rem)] after:w-full after:bg-white after:dark:bg-black">
        <Link
          href="specify"
          className="z-10 w-full rounded-lg bg-blue-400 p-4 text-center dark:bg-blue-600"
        >
          Save changes
        </Link>
      </div>
      <SyncSelected></SyncSelected>
    </main>
  )
}

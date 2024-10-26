/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import ProfileSelectorList from "@/components/profile/profileSelectorList"
import SyncNotificationPreferences from "@/components/profile/syncNotificationPreferences"
import RedirectOnEmptyStore from "@/components/redirectOnEmptyStore"
import Link from "next/link"

export default function Page() {
  // TODO get rid of double bottom padding
  return (
    <main className="flex w-full max-w-lg grow flex-col gap-4">
      <RedirectOnEmptyStore></RedirectOnEmptyStore>
      <SyncNotificationPreferences></SyncNotificationPreferences>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl">Select</h1>
        <p>
          Now, select the accounts you&apos;d like to receive notifications for.
          You&apos;ll be able to set the types of notifications later.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <ProfileSelectorList></ProfileSelectorList>
      </div>
      <div className="sticky bottom-4 mt-auto flex after:absolute after:-bottom-4 after:z-0 after:h-[calc(100%+2rem)] after:w-full after:bg-white after:dark:bg-black">
        <Link
          href="specify"
          className="z-10 w-full rounded-lg bg-blue-400 p-4 dark:bg-blue-600"
        >
          Continue
        </Link>
      </div>
    </main>
  )
}

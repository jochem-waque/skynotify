/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import ProfileSelector from "@/components/profileSelector"
import Link from "next/link"

export default function Page() {
  return (
    <main className="flex max-w-lg flex-col gap-2 overflow-hidden">
      <h1 className="text-3xl">Following</h1>
      <p>
        Now, select the accounts you&apos;d like to receive notifications for.
        You&apos;ll be able to specify whether you want to receive post, repost
        and/or reply notifications later.
      </p>
      <ProfileSelector></ProfileSelector>
      <Link href="specify" className="w-full rounded-lg bg-blue-500 p-4">
        Continue
      </Link>
    </main>
  )
}

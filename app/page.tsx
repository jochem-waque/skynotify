/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import GetStarted from "@/components/getStarted"
import Drizzle from "@/util/drizzle"
import { accountTable } from "@/util/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"

export default async function Page() {
  const cookiesResult = await cookies()
  const accountId = cookiesResult.get("account")
  let account
  if (accountId) {
    ;[account] = await Drizzle.select({})
      .from(accountTable)
      .where(eq(accountTable.id, accountId.value))
      .limit(1)
  }

  return (
    <main className="container relative z-0 flex h-full flex-col items-center justify-center gap-48">
      <div className="text-center">
        <h1 className="text-4xl">Bluesky Post Notifications</h1>
        <span>by jochem.cc</span>
      </div>
      <GetStarted authenticated={!!account}></GetStarted>
    </main>
  )
}

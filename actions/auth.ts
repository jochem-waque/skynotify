/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use server"

import Drizzle from "@/util/db"
import { accountTable } from "@/util/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

type AuthError = "invalid_input" | "account_not_found" | "none"

export async function auth(
  _previousState: AuthError,
  data: FormData,
): Promise<AuthError> {
  const accountId = data.get("account")
  const installed = data.get("installed")
  if (typeof accountId !== "string") {
    return "invalid_input"
  }

  const [account] = await Drizzle.select({ name: accountTable.name })
    .from(accountTable)
    .where(eq(accountTable.id, accountId))
    .limit(1)
  if (!account) {
    return "account_not_found"
  }

  const cookiesResult = await cookies()
  cookiesResult.set("account", accountId)

  redirect(installed ? "/configure" : "/install")
}

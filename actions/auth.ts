/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use server"

import Drizzle from "@/util/drizzle"
import { accountTable } from "@/util/schema"
import { eq } from "drizzle-orm"

type ErrorCodes = "invalid_input" | "account_not_found"
type State =
  | { error: true; code: ErrorCodes }
  | { error: false; name: string; account: string }
  | { error: null }

export async function auth(
  _previousState: State,
  data: FormData,
): Promise<State> {
  const accountId = data.get("account")
  if (!(typeof accountId === "string")) {
    return { error: true, code: "invalid_input" }
  }

  const [account] = await Drizzle.select({ name: accountTable.name })
    .from(accountTable)
    .where(eq(accountTable.id, accountId))
    .limit(1)
  if (!account) {
    return { error: true, code: "account_not_found" }
  }

  return { error: false, name: account.name, account: accountId }
}

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { getAccount } from "./db"
import { cookies } from "next/headers"
import "server-only"

export async function getCurrentAccount() {
  const cookiesResult = await cookies()
  const accountId = cookiesResult.get("account")
  const account = accountId ? await getAccount(accountId.value) : null
  return account
}

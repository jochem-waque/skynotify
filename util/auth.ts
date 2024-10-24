/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import "server-only"

import Drizzle from "./drizzle"
import { accountTable } from "./schema"
import { eq } from "drizzle-orm"

export async function getAccount(accountId: string) {
  const [account] = await Drizzle.select({ name: accountTable.name })
    .from(accountTable)
    .where(eq(accountTable.id, accountId))
    .limit(1)

  return account ?? null
}

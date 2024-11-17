/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use server"

import Drizzle from "@/util/db"
import { tokenTable } from "@/util/schema"
import { eq } from "drizzle-orm"

export async function updateToken(oldToken: string, newToken: string) {
  console.log("Updating token", oldToken, "-->", newToken)

  await Drizzle.update(tokenTable)
    .set({ token: newToken })
    .where(eq(tokenTable.token, oldToken))
}

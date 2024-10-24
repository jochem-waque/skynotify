/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use server"

import { getCurrentAccount } from "@/util/auth"
import Drizzle from "@/util/db"
import { accountTable } from "@/util/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

export async function putToken(token?: string) {
  const account = await getCurrentAccount()
  if (!account) {
    redirect("/auth?installed=true")
  }

  const [updated] = await Drizzle.update(accountTable)
    .set({ token })
    .where(eq(accountTable.id, account.id))
    .returning()

  return updated ?? null
}

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use server"

import { getCurrentAccount } from "@/util/auth"
import Drizzle from "@/util/db"
import { subscriptionTable } from "@/util/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

export async function save(
  data: Omit<typeof subscriptionTable.$inferInsert, "account">[],
) {
  const account = await getCurrentAccount()
  if (!account) {
    redirect("/auth?installed=true")
  }

  await Drizzle.transaction(async (tx) => {
    await tx
      .delete(subscriptionTable)
      .where(eq(subscriptionTable.account, account.id))
    return await tx
      .insert(subscriptionTable)
      .values(
        data.map((subscription) => ({ ...subscription, account: account.id })),
      )
      .onConflictDoNothing()
  })

  redirect("/configure/success")
}

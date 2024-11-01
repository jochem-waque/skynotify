/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use server"

import Drizzle from "@/util/db"
import { subscriptionTable } from "@/util/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

export async function save(
  token: string,
  subscriptions: Omit<typeof subscriptionTable.$inferInsert, "token">[],
) {
  await Drizzle.transaction(async (tx) => {
    await tx.delete(subscriptionTable).where(eq(subscriptionTable.token, token))
    return await tx
      .insert(subscriptionTable)
      .values(
        subscriptions
          .slice(0, 50)
          .map((subscription) => ({ ...subscription, token })),
      )
      .onConflictDoNothing()
  })

  redirect("/configure/success")
}

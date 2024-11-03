/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use server"

import { SubscriptionLimit } from "@/config"
import Drizzle from "@/util/db"
import { subscriptionTable } from "@/util/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

export async function save(
  token: string,
  subscriptions: Omit<typeof subscriptionTable.$inferInsert, "token">[],
) {
  try {
    await Drizzle.transaction(async (tx) => {
      const deletion = await tx
        .delete(subscriptionTable)
        .where(eq(subscriptionTable.token, token))
      if (subscriptions.length === 0) {
        return deletion
      }

      return await tx
        .insert(subscriptionTable)
        .values(
          subscriptions
            .slice(0, SubscriptionLimit)
            .map((subscription) => ({ ...subscription, token })),
        )
        .onConflictDoNothing()
    })
  } catch (e) {
    console.error(e)
    return
  }

  redirect("/overview")
}

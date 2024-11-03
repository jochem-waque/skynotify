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

const limit = parseInt(process.env.NEXT_PUBLIC_SUBSCRIPTION_LIMIT)

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
            .slice(0, limit)
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

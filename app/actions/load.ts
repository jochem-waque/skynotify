/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use server"

import Drizzle from "@/util/db"
import { subscriptionTable, tokenTable } from "@/util/schema"
import { eq } from "drizzle-orm"

export async function load(token: string) {
  return await Drizzle.select({
    target: subscriptionTable.target,
    posts: subscriptionTable.posts,
    reposts: subscriptionTable.reposts,
    replies: subscriptionTable.replies,
  })
    .from(subscriptionTable)
    .innerJoin(tokenTable, eq(subscriptionTable.token, tokenTable.id))
    .where(eq(tokenTable.token, token))
}

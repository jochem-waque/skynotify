/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { boolean, pgTable, primaryKey, text } from "drizzle-orm/pg-core"

export const accountTable = pgTable("account", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  token: text("token"),
})

export const subscriptionTable = pgTable(
  "subscription",
  {
    account: text("account")
      .notNull()
      .references(() => accountTable.id),
    target: text("target").notNull(),
    posts: boolean("posts").notNull(),
    reposts: boolean("reposts").notNull(),
    replies: boolean("replies").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.account, table.target] }),
  }),
)

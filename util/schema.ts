/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { pgTable, primaryKey, text } from "drizzle-orm/pg-core"

export const accountTable = pgTable("account", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  token: text("token"),
})

export const subscriptionTable = pgTable(
  "subscription",
  {
    account: text("account").notNull(),
    target: text("target").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.account, table.target] }),
  }),
)

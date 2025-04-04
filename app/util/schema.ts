/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

export const tokenTable = pgTable("token", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  unregistered: timestamp("unregistered"),
})

export const subscriptionTable = pgTable(
  "subscription",
  {
    token: integer("token")
      .notNull()
      .references(() => tokenTable.id),
    target: text("target").notNull(),
    posts: boolean("posts").notNull(),
    reposts: boolean("reposts").notNull(),
    replies: boolean("replies").notNull(),
  },
  (table) => [primaryKey({ columns: [table.token, table.target] })],
)

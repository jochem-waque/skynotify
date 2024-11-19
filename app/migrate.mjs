/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

const pg = postgres(process.env.DATABASE_URL)
const orm = drizzle(pg)
await migrate(orm, { migrationsFolder: "./drizzle" })
await pg.end()

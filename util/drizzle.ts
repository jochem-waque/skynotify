/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

const drizzleClientSingleton = () => {
  console.log("Instantiate drizzle client")
  const pg = postgres(process.env.DATABASE_URL)
  const orm = drizzle(pg)
  return orm
}

declare const globalThis: {
  drizzleGlobal: ReturnType<typeof drizzleClientSingleton>
} & typeof global

const Drizzle = globalThis.drizzleGlobal ?? drizzleClientSingleton()

export default Drizzle

if (process.env.NODE_ENV !== "production") {
  globalThis.drizzleGlobal = Drizzle
}

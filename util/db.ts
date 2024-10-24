/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { accountTable } from "./schema"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import "server-only"

const drizzleClientSingleton = async () => {
  const pg = postgres(process.env.DATABASE_URL)
  const orm = drizzle(pg)
  await migrate(orm, { migrationsFolder: "./drizzle" })
  return orm
}

declare const globalThis: {
  drizzleGlobal: Awaited<ReturnType<typeof drizzleClientSingleton>>
} & typeof global

const Drizzle = globalThis.drizzleGlobal ?? (await drizzleClientSingleton())

export default Drizzle

if (process.env.NODE_ENV !== "production") {
  globalThis.drizzleGlobal = Drizzle
}

export async function getAccount(accountId: string) {
  const [account] = await Drizzle.select()
    .from(accountTable)
    .where(eq(accountTable.id, accountId))
    .limit(1)

  return account ?? null
}

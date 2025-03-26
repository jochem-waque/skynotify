/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use server"

import Drizzle from "@/util/db"
import { tokenTable } from "@/util/schema"
import { eq } from "drizzle-orm"

export async function updateToken(oldToken: string, newToken: string) {
  await Drizzle.update(tokenTable)
    .set({ token: newToken, unregistered: null })
    .where(eq(tokenTable.token, oldToken))
}

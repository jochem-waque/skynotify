/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Subscribe from "@/components/subscribe"
import { getCurrentAccount } from "@/util/auth"
import { redirect } from "next/navigation"

export default async function Page() {
  const account = await getCurrentAccount()
  if (!account) {
    redirect("/auth?installed=true")
  }

  return (
    <main className="container flex h-full flex-col justify-between gap-4">
      <h1>Test</h1>
      <Subscribe></Subscribe>
    </main>
  )
}

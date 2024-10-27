/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { getCurrentAccount } from "@/util/auth"
import { redirect } from "next/navigation"

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const account = await getCurrentAccount()
  if (!account) {
    redirect("/auth?installed=true")
  }

  return children
}

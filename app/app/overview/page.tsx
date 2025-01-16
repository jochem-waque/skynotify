/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { Metadata } from "next"
import { redirect, RedirectType } from "next/navigation"

export const metadata: Metadata = {
  title: "Overview | SkyNotify",
  robots: "none",
}

export default function Page() {
  redirect("/home", RedirectType.replace)
}

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { redirect, RedirectType } from "next/navigation"

export default function Page() {
  redirect("/home", RedirectType.replace)
}

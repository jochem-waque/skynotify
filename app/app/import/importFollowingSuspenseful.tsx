/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import ImportFollowing from "./importFollowing"
import { Suspense } from "react"

export default function ImportFollowingSuspenseful() {
  return (
    <Suspense>
      <ImportFollowing></ImportFollowing>
    </Suspense>
  )
}

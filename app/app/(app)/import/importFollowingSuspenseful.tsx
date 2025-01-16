/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { Suspense } from "react"
import ImportFollowing from "./importFollowing"

export default function ImportFollowingSuspenseful() {
  return (
    <Suspense>
      <ImportFollowing></ImportFollowing>
    </Suspense>
  )
}

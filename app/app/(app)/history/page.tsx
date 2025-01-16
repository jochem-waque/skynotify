/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Notifications from "./notifications"

export default function Page() {
  return (
    <main className="flex grow flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Notifications></Notifications>
      </div>
    </main>
  )
}

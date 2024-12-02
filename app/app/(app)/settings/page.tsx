/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import RedirectDropdown from "./redirectDropdown"

export default function Page() {
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl">Settings</h1>
      <div>
        <div className="flex gap-2 text-lg">
          <span>Redirect mode: </span>
          <RedirectDropdown></RedirectDropdown>
        </div>
        <ul className="list-inside list-disc">
          <li>
            <span className="font-bold">Direct (fastest)</span>: directly open
            posts. Opens posts in the browser on some platforms.
          </li>
          <li>
            <span className="font-bold">Indirect</span>: redirect to a page that
            attempts to open the Bluesky app. Works well on Apple devices.
          </li>
        </ul>
      </div>
    </main>
  )
}

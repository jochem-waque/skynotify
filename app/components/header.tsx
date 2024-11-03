/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import NavigationButton from "./navigationButton"

export default function Header() {
  return (
    <header className="flex justify-between px-2">
      <NavigationButton></NavigationButton>
      <h1 className="text-center text-3xl">SkyNotify</h1>
      <div></div>
    </header>
  )
}

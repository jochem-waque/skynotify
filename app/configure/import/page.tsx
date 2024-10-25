/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import ImportFollowing from "@/components/importFollowing"

export default function Page() {
  return (
    <main className="container flex h-full flex-col justify-between gap-4">
      <div className="flex flex-col overflow-hidden">
        <h1>Following</h1>
        <p>Let&apos;s import your Bluesky following</p>
        <ImportFollowing></ImportFollowing>
      </div>
    </main>
  )
}

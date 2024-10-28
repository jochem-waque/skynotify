/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import ImportFollowing from "@/components/importFollowing"

export default function Page() {
  return (
    <main className="container flex grow flex-col justify-between gap-4">
      <div className="flex grow flex-col gap-2">
        <h1 className="text-3xl">Import following</h1>
        <p>Next, let&apos;s import your Bluesky following.</p>
        <ImportFollowing></ImportFollowing>
      </div>
    </main>
  )
}

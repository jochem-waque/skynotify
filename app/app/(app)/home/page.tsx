/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { Metadata } from "next"
import Configuration from "./configuration"

export const metadata: Metadata = {
  title: "Overview | SkyNotify",
}

export default function Page() {
  return (
    <>
      <main className="flex flex-col gap-4">
        <h1 className="text-2xl">Home</h1>
        <div className="flex flex-col gap-2">
          <Configuration></Configuration>
        </div>
      </main>
    </>
  )
}

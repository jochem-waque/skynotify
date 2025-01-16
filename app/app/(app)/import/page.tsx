/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import ProgressBar from "@/components/progressBar"
import { Metadata } from "next"
import ImportFollowingSuspenseful from "./importFollowingSuspenseful"

export const metadata: Metadata = {
  title: "Import following | SkyNotify",
  robots: "none",
}

export default function Page() {
  return (
    <main className="flex grow flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p>Let&apos;s import your Bluesky following!</p>
        <ProgressBar></ProgressBar>
        <ImportFollowingSuspenseful></ImportFollowingSuspenseful>
      </div>
    </main>
  )
}

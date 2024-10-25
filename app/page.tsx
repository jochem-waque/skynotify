/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import GetStarted from "@/components/getStarted"
import { getCurrentAccount } from "@/util/auth"
import { Viewport } from "next"

// TODO this is rough. when typing the url into chrome, the keyboard causes the
// innerHeight to be wrong until the user taps the screen. this fixes it, but is
// horrible when the keyboard does need to be used
export const viewport: Viewport = { interactiveWidget: "resizes-content" }

export default async function Page() {
  const account = await getCurrentAccount()

  return (
    <main className="container relative z-0 flex h-full max-w-lg flex-col items-center justify-center gap-48">
      <div className="text-center">
        <h1 className="text-4xl">Bluesky Post Notifications</h1>
        <span>by jochem.cc</span>
      </div>
      <GetStarted authenticated={!!account}></GetStarted>
    </main>
  )
}

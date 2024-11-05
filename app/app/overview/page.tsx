/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import RedirectDropdown from "./settings"
import SupportId from "./supportId"
import Configuration from "@/app/overview/configuration"
import ReturnToSetup from "@/app/overview/returnToSetup"
import Footer from "@/components/footer"
import Header from "@/components/header"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Overview | SkyNotify",
}

export default function Page() {
  return (
    <>
      <Header></Header>
      <main className="flex grow flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl">Settings</h2>
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
              <span className="font-bold">Indirect</span>: redirect to a page
              that attempts to open the Bluesky app. Works well on Apple
              devices.
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl">Notifications</h2>
          <Configuration></Configuration>
          <div className="sticky bottom-2 flex flex-col after:absolute after:-bottom-2 after:z-0 after:h-[calc(100%+1rem)] after:w-full after:bg-white after:dark:bg-neutral-900">
            <ReturnToSetup></ReturnToSetup>
          </div>
        </div>
      </main>
      <Footer>
        <SupportId></SupportId>
      </Footer>
    </>
  )
}

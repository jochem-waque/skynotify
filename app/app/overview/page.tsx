/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Configuration from "@/components/configuration"
import Footer from "@/components/footer"
import Header from "@/components/header"
import ReturnToSetup from "@/components/returnToSetup"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Overview | Bsky Notifs",
}

export default function Page() {
  return (
    <>
      <Header></Header>
      <main className="flex grow flex-col gap-2">
        <h2 className="text-2xl">Overview</h2>

        <div className="flex flex-col gap-2 rounded-lg">
          <Configuration></Configuration>
        </div>
        <div className="sticky bottom-2 flex flex-col after:absolute after:-bottom-2 after:z-0 after:h-[calc(100%+1rem)] after:w-full after:bg-white after:dark:bg-neutral-900">
          <ReturnToSetup></ReturnToSetup>
        </div>
      </main>
      <Footer></Footer>
    </>
  )
}

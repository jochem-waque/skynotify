/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import ImportFollowingSuspenseful from "./importFollowingSuspenseful"
import Footer from "@/components/footer"
import Header from "@/components/header"
import InstructionList from "@/components/instructionList"
import ProgressBar from "@/components/progressBar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Import following | SkyNotify",
}

export default function Page() {
  return (
    <>
      <Header></Header>
      <main className="flex grow flex-col gap-4">
        <InstructionList step="import">
          <p>Next, let&apos;s import your Bluesky following.</p>
          <ProgressBar></ProgressBar>
          <ImportFollowingSuspenseful></ImportFollowingSuspenseful>
        </InstructionList>
      </main>
      <Footer></Footer>
    </>
  )
}

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Footer from "@/components/footer"
import ImportFollowing from "@/components/importFollowing"
import InstructionList from "@/components/instructionList"
import SetSetupState from "@/components/setSetupState"

export default function Page() {
  return (
    <>
      <SetSetupState setupState={"import"}></SetSetupState>
      <header className="text-3xl">Bluesky Post Notifications</header>
      <main className="flex grow flex-col gap-4">
        <InstructionList step="import">
          <p>Next, let&apos;s import your Bluesky following.</p>
          <ImportFollowing></ImportFollowing>
        </InstructionList>
      </main>
      <Footer></Footer>
    </>
  )
}

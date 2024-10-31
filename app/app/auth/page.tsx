/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import AuthForm from "@/components/authForm"
import Footer from "@/components/footer"
import InstructionList from "@/components/instructionList"
import SetSetupState from "@/components/setSetupState"
import { getCurrentAccount } from "@/util/auth"
import { redirect } from "next/navigation"

export default async function Page() {
  const account = await getCurrentAccount()
  if (account) {
    redirect("import")
  }

  return (
    <>
      <SetSetupState setupState={"authentication"}></SetSetupState>
      <header className="text-3xl">Bsky Post Notifications</header>
      <main className="flex grow flex-col gap-4">
        <InstructionList step="authentication">
          <AuthForm></AuthForm>
        </InstructionList>
      </main>
      <Footer></Footer>
    </>
  )
}

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import AuthForm from "@/components/authForm"
import InstructionList from "@/components/instructionList"
import { getCurrentAccount } from "@/util/auth"
import { redirect } from "next/navigation"

export default async function Page() {
  const account = await getCurrentAccount()
  if (account) {
    redirect("import")
  }

  return (
    <>
      <header className="text-3xl">Bluesky Post Notifications</header>
      <main className="flex grow flex-col gap-4">
        <InstructionList step="authentication">
          <AuthForm></AuthForm>
        </InstructionList>
      </main>
      <footer>Footer stuff</footer>
    </>
  )
}

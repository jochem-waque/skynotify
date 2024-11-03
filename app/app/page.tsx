/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Footer from "@/components/footer"
import GetStarted from "@/components/getStarted"
import RedirectFromRoot from "@/components/redirectFromRoot"
import Link from "next/link"

export default async function Page() {
  return (
    <>
      <main className="flex grow flex-col items-center justify-center gap-2">
        <RedirectFromRoot></RedirectFromRoot>
        <div className="text-center">
          <h1 className="text-4xl">Bsky Post Notifications</h1>
          <span>
            by{" "}
            <Link
              className="underline hover:opacity-75"
              href="https://github.com/Jochem-W"
            >
              Jochem-W
            </Link>
          </span>
        </div>
        <div className="max-h-16 grow"></div>
        <GetStarted></GetStarted>
        <p className="max-w-[60ch] text-center text-xs opacity-50">
          By clicking this button, you acknowledge that you have read and agree
          to the{" "}
          <Link
            className="underline transition-opacity hover:opacity-75"
            href="privacy"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            className="underline transition-opacity hover:opacity-75"
            href="liability"
          >
            Liability Disclaimer
          </Link>
        </p>
      </main>
      <Footer absolute={true}></Footer>
    </>
  )
}

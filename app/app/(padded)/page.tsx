/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Footer from "@/components/footer"
import GetStarted from "@/components/getStarted"
import RedirectFromRoot from "@/components/redirectFromRoot"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Real-time Bluesky post notifications | SkyNotify",
}

export default async function Page() {
  return (
    <>
      <div className="flex grow flex-col justify-between gap-4">
        <div></div>
        <main className="flex grow flex-col items-center justify-center gap-2">
          <div className="text-center">
            <h1 className="text-4xl">SkyNotify</h1>
            <p className="opacity-50">
              Real-time background push notifications for Bluesky posts
            </p>
          </div>
          <div className="max-h-4 grow"></div>
          <GetStarted></GetStarted>
          <p className="max-w-[60ch] text-center text-xs opacity-50">
            By clicking this button, you acknowledge that you have read and
            agree to the{" "}
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
        <Footer></Footer>
      </div>
      <RedirectFromRoot></RedirectFromRoot>
    </>
  )
}

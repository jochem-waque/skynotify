/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Redirect from "./redirect"
import Footer from "@/components/footer"
import { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { UAParser } from "ua-parser-js"

export const metadata: Metadata = {
  title: "Redirecting to post | SkyNotify",
}

export default async function Page({
  params,
}: {
  params: Promise<{ pid: string; did: string }>
}) {
  const { pid, did } = await params
  const linkUrl = new URL(
    `https://bsky.app/profile/${decodeURIComponent(did)}/post/${decodeURIComponent(pid)}`,
  )
  let redirectUrl = new URL(linkUrl)

  const hdrs = await headers()
  const userAgent = hdrs.get("User-Agent")
  if (userAgent) {
    const parser = new UAParser(userAgent)
    switch (parser.getOS().name) {
      case "Android":
        redirectUrl = new URL(
          `intent:/${redirectUrl.pathname}#Intent;scheme=bluesky;package=xyz.blueskyweb.app;end`,
        )
        break
      case "iOS":
      case "macOS":
        // TODO should be ipadOS only
        redirectUrl = new URL(`bluesky:/${redirectUrl.pathname}`)
        break
      default:
        break
    }
  }

  return (
    <>
      <Redirect href={redirectUrl.toString()}></Redirect>
      <div className="flex grow flex-col items-center justify-center gap-1">
        <h1 className="text-center text-3xl">Redirecting to Bluesky</h1>
        <Link
          className="text-lg text-blue-500 underline transition-opacity hover:opacity-75"
          href={linkUrl.toString()}
        >
          Click here if you&apos;re not redirected
        </Link>
      </div>
      <Footer></Footer>
    </>
  )
}

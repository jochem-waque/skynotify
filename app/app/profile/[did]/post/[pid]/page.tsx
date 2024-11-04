/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { Metadata } from "next"
import { headers } from "next/headers"
import { redirect, RedirectType } from "next/navigation"
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
  let url = new URL(
    `https://bsky.app/profile/${decodeURIComponent(did)}/post/${decodeURIComponent(pid)}`,
  )

  const hdrs = await headers()
  const userAgent = hdrs.get("User-Agent")
  if (!userAgent) {
    redirect(url.toString(), RedirectType.replace)
  }

  const parser = new UAParser(userAgent)
  switch (parser.getOS().name) {
    case "Android":
      url = new URL(
        `intent:/${url.pathname}#Intent;scheme=bluesky;package=xyz.blueskyweb.app;end`,
      )
      break
    case "iOS":
    case "macOS":
      url = new URL(`bluesky:/${url.pathname}`)
      break
    default:
      break
  }

  redirect(url.toString(), RedirectType.replace)
}

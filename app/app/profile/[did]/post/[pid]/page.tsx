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
  title: "Redirecting to post | Bsky Notifs",
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
  if (userAgent) {
    const parser = new UAParser(userAgent)
    if (parser.getOS().name === "Android") {
      url = new URL(
        `intent:/${url.pathname}#Intent;scheme=bluesky;package=xyz.blueskyweb.app;S.browser_fallback_url=${url};end`,
      )
    }
  }

  redirect(url.toString(), RedirectType.replace)
}

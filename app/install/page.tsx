/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import PlatformInstructions from "@/components/platformInstructions"
import PlatformSelect from "@/components/platformSelect"
import RedirectOnInstall from "@/components/redirectOnInstall"
import { Browser, OS, Platform, simplifyPlatform } from "@/util/platform"
import { headers } from "next/headers"
import Link from "next/link"
import UAParser from "ua-parser-js"

async function parseUserAgent(): Promise<Platform> {
  const headersResult = await headers()
  const userAgent = headersResult.get("User-Agent")
  if (!userAgent) {
    return "unknown"
  }
  const parser = new UAParser(userAgent)

  let os: OS
  switch (parser.getOS().name) {
    case "Android":
      os = "android"
      break
    case "Windows":
      os = "windows"
      break
    case "iOS":
      os = "ios"
      break
    case "Mac OS":
      os = "macos"
      break
    default:
      os = parser.getDevice().type === "mobile" ? "mobile" : "desktop"
      break
  }

  let browser: Browser
  switch (parser.getEngine().name) {
    case "Blink":
      browser = "chromium"
      break
    case "WebKit":
      browser = "safari"
      break
    case "Gecko":
      browser = "firefox"
      break
    default:
      browser = "unknown"
      break
  }

  return simplifyPlatform(`${os}-${browser}`)
}

export default async function Page() {
  const platform = await parseUserAgent()

  return (
    <main className="container z-10 flex h-full w-full flex-col justify-between gap-4 bg-white dark:bg-black">
      <div className="flex flex-col items-start gap-4 overflow-hidden">
        <div className="flex flex-col gap-2">
          <h1 className="text-center text-3xl">Bluesky Post Notifications</h1>
          <div className="flex flex-wrap items-center gap-2 text-xl">
            <h2>Install for </h2>{" "}
            <PlatformSelect platform={platform}></PlatformSelect>
          </div>
        </div>
        <PlatformInstructions></PlatformInstructions>
      </div>
      <Link
        href={"/configure"}
        className="w-full rounded-lg bg-blue-400 p-4 text-center transition-opacity hover:opacity-75 dark:bg-blue-600"
      >
        I&apos;ve installed the app
      </Link>
      <RedirectOnInstall></RedirectOnInstall>
    </main>
  )
}

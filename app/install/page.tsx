/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import InstallationContent from "@/components/installation/installationContent"
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
    <main className="container flex max-w-lg grow flex-col gap-4">
      <InstallationContent defaultPlatform={platform}></InstallationContent>
      <div className="sticky bottom-4 mt-auto flex after:absolute after:-bottom-4 after:left-0 after:z-0 after:h-[calc(100%+2rem)] after:w-full after:bg-white after:dark:bg-neutral-900">
        <Link
          href={"configure/import"}
          className="z-10 w-full rounded-lg bg-blue-400 p-4 text-center transition-opacity hover:opacity-75 dark:bg-blue-600"
        >
          I&apos;ve installed the app
        </Link>
      </div>
      <RedirectOnInstall></RedirectOnInstall>
    </main>
  )
}

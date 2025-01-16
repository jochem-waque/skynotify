/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Footer from "@/components/footer"
import { Browser, OS, Platform, simplifyPlatform } from "@/util/platform"
import { Metadata } from "next"
import { headers } from "next/headers"
import { UAParser } from "ua-parser-js"
import InstallationContent from "./installationContent"

export const metadata: Metadata = {
  title: "Install | SkyNotify",
  robots: "none",
}

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
    case "macOS":
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
    <>
      <main className="flex grow flex-col gap-4">
        <h1 className="text-2xl">Installation</h1>
        <div className="flex flex-col gap-2">
          <InstallationContent defaultPlatform={platform}></InstallationContent>
          <p className="underline">
            To continue, please open the installed app.
          </p>
        </div>
      </main>
      <Footer></Footer>
    </>
  )
}

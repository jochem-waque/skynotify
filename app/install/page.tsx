/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import AppLocation from "@/components/appLocation"
import PlatformInstructions from "@/components/platformInstructions"
import { Browser, OS, Platform, simplifyPlatform } from "@/util/platform"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { UAParser } from "ua-parser-js"

// TODO it could be possible to refactor this to a server component and use
// headers()... but it won't have many benefits i think?

export default function Page() {
  const router = useRouter()
  const [platform, setPlatform] = useState<Platform>("unknown")

  useEffect(() => {
    const userAgent = new UAParser()

    let os: OS
    switch (userAgent.getOS().name) {
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
        os = userAgent.getDevice().type === "mobile" ? "mobile" : "desktop"
        break
    }

    let browser: Browser
    switch (userAgent.getEngine().name) {
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

    setPlatform(simplifyPlatform(`${os}-${browser}`))
  }, [])

  useEffect(() => {
    function listener() {
      router.replace("/configure")
    }

    window.addEventListener("appinstalled", listener)

    return () => window.removeEventListener("appinstaled", listener)
  }, [router])

  return (
    <main className="container z-10 flex h-full w-full flex-col justify-between gap-4 bg-white dark:bg-black">
      <div className="flex flex-col items-start gap-4 overflow-hidden">
        <div className="flex flex-col gap-2">
          <h1 className="text-center text-3xl">Bluesky Post Notifications</h1>
          <div className="flex flex-wrap items-center gap-2 text-xl">
            <h2>Install for </h2>{" "}
            <select
              className="inline border-b bg-transparent dark:border-white"
              onChange={(evt) => setPlatform(evt.target.value as Platform)}
              name="platform"
              value={platform}
            >
              <option className="text-base dark:bg-black" value="android">
                Android
              </option>
              <option
                className="text-base dark:bg-black"
                value="desktop-chromium"
              >
                Chrome on desktops
              </option>
              <option className="text-base dark:bg-black" value="macos-safari">
                Safari on MacOS
              </option>
              <option className="text-base dark:bg-black" value="ios">
                iOS
              </option>
              <option className="text-base dark:bg-black" value="firefox">
                Firefox
              </option>
              <option className="text-base dark:bg-black" value="unknown">
                Other
              </option>
            </select>
          </div>
        </div>
        <div className="flex shrink flex-col items-start gap-2 overflow-y-auto">
          <PlatformInstructions platform={platform}></PlatformInstructions>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <AppLocation platform={platform}></AppLocation>
        <Link
          replace={true}
          href={"/configure"}
          className="w-full rounded-lg bg-blue-400 p-4 text-center transition-opacity hover:opacity-75 dark:bg-blue-600"
        >
          I&apos;ve installed the app
        </Link>
      </div>
    </main>
  )
}

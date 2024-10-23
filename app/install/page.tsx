/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { UAParser } from "ua-parser-js"

type OS = "windows" | "macos" | "ios" | "android" | "desktop" | "mobile"
type Browser = "chromium" | "firefox" | "safari" | "unknown"
type ExactPlatform = `${OS}-${Browser}`
type Platform =
  | "android"
  | "desktop-chromium"
  | "macos-safari"
  | "ios"
  | "unknown"
  | "firefox"

function simplifyPlatform(platform: ExactPlatform): Platform {
  switch (platform) {
    // "Add to Home Screen" in hamburger menu
    case "android-chromium":
    case "mobile-chromium":
      return "android"

    // + in address bar
    case "desktop-chromium":
    case "windows-chromium":
    case "macos-chromium":
      return "desktop-chromium"

    // Non-mobile Safari, assume MacOS
    case "desktop-safari":
    case "macos-safari":
      return "macos-safari"

    // iOS or mobile Safari
    case "mobile-safari":
    case "ios-chromium":
    case "ios-safari":
      return "ios"

    // Unknown or impossible combinations
    case "windows-unknown":
    case "macos-unknown":
    case "android-unknown":
    case "desktop-unknown":
    case "mobile-unknown":
    case "ios-unknown":
    case "android-safari":
    case "windows-safari":
      return "unknown"

    // Any Firefox
    case "windows-firefox":
    case "macos-firefox":
    case "ios-firefox":
    case "android-firefox":
    case "desktop-firefox":
    case "mobile-firefox":
      return "firefox"
  }
}

function platformInstructions(platform: Platform) {
  switch (platform) {
    case "android":
      return (
        <ol className="list-inside list-decimal">
          <li>
            Open the hamburger menu <span className="font-black">⋮</span> in the
            browser navigation bar
          </li>
          <li>
            Click <span className="font-bold">Add to Home screen</span>, or a
            similarly named option
          </li>
          <li>
            Click <span className="font-bold">Install</span>
          </li>
        </ol>
      )
    case "desktop-chromium":
      return (
        <>
          <p>
            Click the install button in the address bar on the left and follow
            the instructions in the installation prompt.
          </p>
          <p>
            If this button is not shown, the app can be installed by opening the
            hamburger menu <span className="font-black">⋮</span> and looking for
            an <span className="font-bold">Install</span> option, sometimes
            inside of an <span className="font-bold">Apps</span> or{" "}
            <span className="font-bold">Share</span> dropdown.
          </p>
        </>
      )
    case "macos-safari":
      return (
        <ol className="list-inside list-decimal">
          <li>
            Click the{" "}
            <svg
              viewBox="0 0 387.94 512"
              className="relative top-0.5 inline w-4 fill-white align-baseline"
              role="img"
            >
              <polyline points="273.69 118.96 193.97 39.24 114.25 118.96 94.64 99.33 193.97 0 293.29 99.33 273.69 118.96" />
              <polygon points="179.05 19.62 208.89 19.62 208.89 332.95 179.05 332.95 179.05 19.62" />
              <path d="M343.17,512H44.76c-24.68,0-44.76-20.08-44.76-44.76V198.67c0-24.68,20.08-44.76,44.76-44.76h104.44v29.84H44.76c-8.24,0-14.92,6.7-14.92,14.92v268.57c0,8.22,6.68,14.92,14.92,14.92h298.41c8.24,0,14.92-6.7,14.92-14.92V198.67c0-8.22-6.68-14.92-14.92-14.92h-104.44v-29.84h104.44c24.68,0,44.76,20.08,44.76,44.76v268.57c0,24.68-20.08,44.76-44.76,44.76" />
            </svg>{" "}
            button in the browser navigation bar
          </li>
          <li>
            Click <span className="font-bold">Add to Dock</span>, or{" "}
            <span className="font-bold">Add to Home Screen</span> on iPadOS
          </li>
        </ol>
      )
    // TODO button might not always be in navbar
    case "ios":
      return (
        <ol className="list-inside list-decimal">
          <li>
            Click the{" "}
            <svg
              viewBox="0 0 387.94 512"
              className="relative top-0.5 inline w-4 fill-white align-baseline"
              role="img"
            >
              <polyline points="273.69 118.96 193.97 39.24 114.25 118.96 94.64 99.33 193.97 0 293.29 99.33 273.69 118.96" />
              <polygon points="179.05 19.62 208.89 19.62 208.89 332.95 179.05 332.95 179.05 19.62" />
              <path d="M343.17,512H44.76c-24.68,0-44.76-20.08-44.76-44.76V198.67c0-24.68,20.08-44.76,44.76-44.76h104.44v29.84H44.76c-8.24,0-14.92,6.7-14.92,14.92v268.57c0,8.22,6.68,14.92,14.92,14.92h298.41c8.24,0,14.92-6.7,14.92-14.92V198.67c0-8.22-6.68-14.92-14.92-14.92h-104.44v-29.84h104.44c24.68,0,44.76,20.08,44.76,44.76v268.57c0,24.68-20.08,44.76-44.76,44.76" />
            </svg>{" "}
            button in the browser navigation bar
          </li>
          <li>
            Click <span className="font-bold">Add to Home Screen</span>
          </li>
        </ol>
      )
    case "unknown":
      return (
        <>
          <p>
            Your browser could not be automatically detected. Please select an
            applicable browser from the dropdown menu, or use the instructions
            below to install the app.
          </p>
          <ul className="list-inside list-disc">
            <li>
              On mobile devices, progressive web apps can usually be installed
              by clicking an{" "}
              <span className="font-bold">Add to Home screen</span> button in
              supported browsers. This option might be inside of another menu,
              and this option might require the use of Safari on iOS and iPadOS
              devices, or Chrome on Android devices.
            </li>
            <li>
              On desktop devices, progressive web apps can usually be installed
              by clicking a button on the left of the inside of the address bar
              in supported browsers. On other browsers, you might need to look
              for an <span className="font-bold">Install</span> button inside of
              the hamburger menu <span className="font-black">⋮</span> on the
              navigation bar, sometimes inside of an{" "}
              <span className="font-bold">Apps</span> or{" "}
              <span className="font-bold">Share</span> dropdown.
            </li>
          </ul>
        </>
      )
    case "firefox":
      return (
        <p>
          Firefox is currently not officially supported. Please use a different
          browser, or install the{" "}
          <Link
            className="text-blue-500 underline transition-opacity hover:opacity-75"
            href="https://addons.mozilla.org/firefox/addon/pwas-for-firefox/"
            target="_blank"
          >
            Progressive Web Apps for Firefox
          </Link>{" "}
          extension. No additional support will be given.
        </p>
      )
  }
}

export default function Page() {
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

  return (
    <div className="container z-10 flex h-full w-full flex-col justify-between gap-4 bg-white dark:bg-black">
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
          {platformInstructions(platform)}
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <span>To skip this page, open the app using the separate icon.</span>
        <Link
          href={"/configure"}
          className="w-full rounded-lg bg-blue-400 p-4 text-center transition-opacity hover:opacity-75 dark:bg-blue-600"
        >
          I&apos;ve installed the app
        </Link>
      </div>
    </div>
  )
}

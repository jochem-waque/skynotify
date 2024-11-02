/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { Platform } from "@/util/platform"
import Link from "next/link"

export default function PlatformInstructions({
  platform,
}: {
  platform: Platform
}) {
  switch (platform) {
    case "android":
      return (
        <div id="android" className="flex flex-col gap-2">
          <ol className="list-inside list-decimal">
            <li>
              Open the hamburger menu <span className="font-black">⋮</span> in
              the browser navigation bar
            </li>
            <li>
              Click <span className="font-bold">Add to Home screen</span>, or a
              similarly named option
            </li>
            <li>
              Click <span className="font-bold">Install</span>
            </li>
          </ol>
        </div>
      )
    case "desktop-chromium":
      return (
        <div id="desktop-chromium" className="flex flex-col gap-2">
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
        </div>
      )
    case "macos-safari":
      return (
        <div id="macos-safari" className="flex flex-col gap-2">
          <ol className="list-inside list-decimal">
            <li>
              Click the{" "}
              <svg
                className="relative top-0.5 inline w-4 fill-current align-baseline"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="12 5.6 26 34.4"
              >
                <path d="M30.3 13.7L25 8.4l-5.3 5.3-1.4-1.4L25 5.6l6.7 6.7z"></path>{" "}
                <path d="M24 7h2v21h-2z"></path>{" "}
                <path d="M35 40H15c-1.7 0-3-1.3-3-3V19c0-1.7 1.3-3 3-3h7v2h-7c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V19c0-.6-.4-1-1-1h-7v-2h7c1.7 0 3 1.3 3 3v18c0 1.7-1.3 3-3 3z"></path>{" "}
              </svg>{" "}
              button in the browser navigation bar
            </li>
            <li>
              Click <span className="font-bold">Add to Dock</span>, or{" "}
              <span className="font-bold">Add to Home Screen</span> on iPadOS
            </li>
          </ol>
        </div>
      )
    case "ios":
      return (
        <div id="ios" className="flex flex-col gap-2">
          <ol className="list-inside list-decimal">
            <li>
              Click the{" "}
              <svg
                className="relative top-0.5 inline w-4 fill-current align-baseline"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="12 5.6 26 34.4"
              >
                <path d="M30.3 13.7L25 8.4l-5.3 5.3-1.4-1.4L25 5.6l6.7 6.7z"></path>{" "}
                <path d="M24 7h2v21h-2z"></path>{" "}
                <path d="M35 40H15c-1.7 0-3-1.3-3-3V19c0-1.7 1.3-3 3-3h7v2h-7c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V19c0-.6-.4-1-1-1h-7v-2h7c1.7 0 3 1.3 3 3v18c0 1.7-1.3 3-3 3z"></path>{" "}
              </svg>{" "}
              button in the browser navigation bar
            </li>
            <li>
              Click <span className="font-bold">Add to Home Screen</span>
            </li>
          </ol>
        </div>
      )
    case "unknown":
      return (
        <div id="unknown" className="flex flex-col gap-2">
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
        </div>
      )
    case "firefox":
      return (
        <p id="firefox" className="block">
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
    default:
      return null
  }
}

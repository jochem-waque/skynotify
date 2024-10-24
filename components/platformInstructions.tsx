/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Link from "next/link"

export default function PlatformInstructions() {
  return (
    <>
      <div
        id="android"
        className="hidden flex-col gap-2 overflow-y-auto target:flex"
      >
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
        <p>
          If you&apos;ve previously installed the app and want to automatically
          skip this page, open the app using the icon on your home screen or
          from the list of installed apps.
        </p>
      </div>
      <div
        id="desktop-chromium"
        className="hidden flex-col gap-2 overflow-y-auto target:flex"
      >
        <p>
          Click the install button in the address bar on the left and follow the
          instructions in the installation prompt.
        </p>
        <p>
          If this button is not shown, the app can be installed by opening the
          hamburger menu <span className="font-black">⋮</span> and looking for
          an <span className="font-bold">Install</span> option, sometimes inside
          of an <span className="font-bold">Apps</span> or{" "}
          <span className="font-bold">Share</span> dropdown.
        </p>
        <p>
          If you&apos;ve previously installed the app and want to automatically
          skip this page, open the app using the icon on your desktop or from
          the list of installed apps.
        </p>
      </div>
      <div
        id="macos-safari"
        className="hidden flex-col gap-2 overflow-y-auto target:flex"
      >
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
        <p>
          If you&apos;ve previously installed the app and want to automatically
          skip this page, open the app using the icon on your desktop or from
          the list of installed apps.
        </p>
      </div>
      <div
        id="ios"
        className="hidden flex-col gap-2 overflow-y-auto target:flex"
      >
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
        <p>
          If you&apos;ve previously installed the app and want to automatically
          skip this page, open the app using the icon on your home screen or
          from the list of installed apps.
        </p>
      </div>
      <div
        id="unknown"
        className="hidden flex-col gap-2 overflow-y-auto target:flex"
      >
        <p>
          Your browser could not be automatically detected. Please select an
          applicable browser from the dropdown menu, or use the instructions
          below to install the app.
        </p>
        <ul className="list-inside list-disc">
          <li>
            On mobile devices, progressive web apps can usually be installed by
            clicking an <span className="font-bold">Add to Home screen</span>{" "}
            button in supported browsers. This option might be inside of another
            menu, and this option might require the use of Safari on iOS and
            iPadOS devices, or Chrome on Android devices.
          </li>
          <li>
            On desktop devices, progressive web apps can usually be installed by
            clicking a button on the left of the inside of the address bar in
            supported browsers. On other browsers, you might need to look for an{" "}
            <span className="font-bold">Install</span> button inside of the
            hamburger menu <span className="font-black">⋮</span> on the
            navigation bar, sometimes inside of an{" "}
            <span className="font-bold">Apps</span> or{" "}
            <span className="font-bold">Share</span> dropdown.
          </li>
        </ul>
      </div>
      <p id="firefox" className="hidden overflow-y-auto target:block">
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
    </>
  )
}

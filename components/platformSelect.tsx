/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { Platform } from "@/util/platform"
import { useEffect } from "react"

export default function PlatformSelect({ platform }: { platform: Platform }) {
  useEffect(() => {
    window.location.hash = platform
  }, [platform])

  return (
    <select
      className="inline border-b bg-transparent dark:border-white"
      onChange={(evt) => (window.location.hash = evt.currentTarget.value)}
      defaultValue={platform}
      name="platform"
    >
      <option className="text-base dark:bg-black" value="android">
        Android
      </option>
      <option className="text-base dark:bg-black" value="desktop-chromium">
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
  )
}

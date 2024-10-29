/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import PlatformInstructions from "@/components/installation/platformInstructions"
import { Platform } from "@/util/platform"
import { useEffect, useRef, useState } from "react"

export default function InstallationContent({
  defaultPlatform,
}: {
  defaultPlatform: Platform
}) {
  const [platform, setPlatform] = useState<Platform>(defaultPlatform)
  const ref = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    if (ref.current) {
      setPlatform(ref.current.value as Platform)
    }
  }, [])

  return (
    <>
      First, let&apos;s get this app installed on your device.
      <div className="flex flex-wrap items-center gap-2 text-lg">
        <h3>Install for </h3>{" "}
        <select
          ref={ref}
          className="inline border-b bg-transparent dark:border-white"
          onChange={(event) =>
            setPlatform(event.currentTarget.value as Platform)
          }
          defaultValue={defaultPlatform}
          name="platform"
        >
          <option className="text-base dark:bg-neutral-900" value="android">
            Android
          </option>
          <option
            className="text-base dark:bg-neutral-900"
            value="desktop-chromium"
          >
            Chrome on desktops
          </option>
          <option
            className="text-base dark:bg-neutral-900"
            value="macos-safari"
          >
            Safari on MacOS
          </option>
          <option className="text-base dark:bg-neutral-900" value="ios">
            iOS
          </option>
          <option className="text-base dark:bg-neutral-900" value="firefox">
            Firefox
          </option>
          <option className="text-base dark:bg-neutral-900" value="unknown">
            Other
          </option>
        </select>
      </div>
      <PlatformInstructions platform={platform}></PlatformInstructions>
    </>
  )
}

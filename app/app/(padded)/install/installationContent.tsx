/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { Platform } from "@/util/platform"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import PlatformInstructionList from "./platformInstructionList"

export default function InstallationContent({
  defaultPlatform,
}: {
  defaultPlatform: Platform
}) {
  const [platform, setPlatform] = useState<Platform>(defaultPlatform)
  const ref = useRef<HTMLSelectElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (ref.current) {
      setPlatform(ref.current.value as Platform)
    }
  }, [])

  useEffect(() => {
    function listener(event: MediaQueryListEvent | MediaQueryList) {
      if (event.matches) {
        router.replace("/import")
      }
    }

    const mql = window.matchMedia("(display-mode: standalone)")
    listener(mql)
    mql.addEventListener("change", listener)

    return () => mql.removeEventListener("change", listener)
  }, [router])

  return (
    <>
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
      <PlatformInstructionList platform={platform}></PlatformInstructionList>
    </>
  )
}

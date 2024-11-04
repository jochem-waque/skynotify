/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { useEffect, useRef, useState } from "react"

// TODO is this a bad practice?
export default function ScrollIntoViewOnProfiles() {
  const profiles = useDataStore((state) => state.profiles)
  const [scrolled, setScrolled] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || profiles.size === 0 || scrolled) {
      return
    }

    const current = ref.current

    window.requestAnimationFrame(() => {
      current.scrollIntoView()
      setScrolled(true)
    })
  }, [profiles, scrolled])

  if (scrolled) {
    return null
  }

  return <div ref={ref}></div>
}

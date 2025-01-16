/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { usePathname } from "next/navigation"
import { MouseEvent, useRef } from "react"
import NavigationButton from "./navigationButton"

export default function Navigation() {
  const ref = useRef<HTMLElement>(null)
  const pathname = usePathname()

  function click(evt: MouseEvent<HTMLAnchorElement>) {
    if (!ref.current) {
      return
    }

    const start = ref.current.scrollLeft
    const end = start + ref.current.clientWidth

    const linkStart = evt.currentTarget.offsetLeft
    const linkEnd = linkStart + evt.currentTarget.clientWidth

    if (linkStart > start && linkEnd < end) {
      return
    }

    let offset = 16
    if (evt.currentTarget.offsetLeft < start) {
      offset = -offset
    }

    ref.current.scrollTo({
      left: evt.currentTarget.offsetLeft + offset,
      behavior: "smooth",
    })
  }

  return (
    <nav
      ref={ref}
      className="sticky bottom-0 left-0 z-20 flex min-w-full [justify-content:safe_center] gap-2 overflow-x-auto bg-neutral-200 p-2 pb-4 sm:pb-2 dark:bg-neutral-950"
    >
      <NavigationButton
        href="/home"
        title="Home"
        icon="🏠"
        active={pathname === "/home"}
        onClick={click}
      ></NavigationButton>
      <NavigationButton
        href="/history"
        title="History"
        icon="🗒️"
        active={pathname === "/history"}
        onClick={click}
      ></NavigationButton>
      <NavigationButton
        href="/import"
        title="Import"
        icon="📲"
        active={pathname.startsWith("/import")}
        onClick={click}
      ></NavigationButton>
      <NavigationButton
        href="/settings"
        title="Settings"
        icon="⚙️"
        active={pathname === "/settings"}
        onClick={click}
      ></NavigationButton>
    </nav>
  )
}

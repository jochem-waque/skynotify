/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MouseEvent, useRef } from "react"

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
      className="sticky bottom-0 left-0 z-20 flex min-w-full [justify-content:safe_center] gap-2 overflow-x-auto bg-neutral-100 p-2 pb-4 sm:pb-2 dark:bg-neutral-950"
    >
      <Link
        className={`${pathname === "/home" ? "bg-neutral-200 dark:bg-neutral-900" : ""} flex h-12 w-20 shrink-0 flex-col items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-900`}
        href="/home"
        onClick={click}
      >
        <span>🏠</span>
        <span className="text-sm">Home</span>
      </Link>
      <Link
        className={`${pathname === "/history" ? "bg-neutral-200 dark:bg-neutral-900" : ""} flex h-12 w-20 shrink-0 flex-col items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-900`}
        href="/history"
        onClick={click}
      >
        <span>🗒️</span>
        <span className="text-sm">History</span>
      </Link>
      <Link
        className={`${pathname.startsWith("/import") ? "bg-neutral-200 dark:bg-neutral-900" : ""} flex h-12 w-20 shrink-0 flex-col items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-900`}
        href="/import"
        onClick={click}
      >
        <span>📲</span>
        <span className="text-sm">Import</span>
      </Link>
      {/* <Link
        className={`${pathname === "/about" ? "bg-neutral-200 dark:bg-neutral-900" : ""} flex h-12 w-20 flex-col items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-900`}
        href="/about"
      >
        <span>❔</span>
        <span className="text-sm">About</span>
      </Link> */}
      <Link
        className={`${pathname === "/settings" ? "bg-neutral-200 dark:bg-neutral-900" : ""} flex h-12 w-20 shrink-0 flex-col items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-900`}
        href="/settings"
        onClick={click}
      >
        <span>⚙️</span>
        <span className="text-sm">Settings</span>
      </Link>
    </nav>
  )
}

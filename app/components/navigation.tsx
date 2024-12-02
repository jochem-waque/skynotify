/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()

  console.log(pathname)

  return (
    <nav className="sticky bottom-0 z-20 flex w-full justify-center gap-2 bg-neutral-100 py-1 dark:bg-neutral-950">
      <Link
        className={`${pathname === "/home" ? "bg-neutral-200 dark:bg-neutral-900" : ""} flex h-12 w-20 flex-col items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-900`}
        href="/home"
      >
        <span>🏠</span>
        <span className="text-sm">Home</span>
      </Link>
      <Link
        className={`${pathname.startsWith("/import") ? "bg-neutral-200 dark:bg-neutral-900" : ""} flex h-12 w-20 flex-col items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-900`}
        href="/import"
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
        className={`${pathname === "/settings" ? "bg-neutral-200 dark:bg-neutral-900" : ""} flex h-12 w-20 flex-col items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-900`}
        href="/settings"
      >
        <span>⚙️</span>
        <span className="text-sm">Settings</span>
      </Link>
    </nav>
  )
}

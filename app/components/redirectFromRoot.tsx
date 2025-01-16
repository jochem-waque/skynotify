/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

export default function RedirectFromRoot() {
  const router = useRouter()
  const mql = useRef<MediaQueryList>(null)

  useEffect(() => {
    function listener(event: MediaQueryListEvent | MediaQueryList) {
      if (event.matches) {
        router.replace("/home")
      }
    }

    if (!mql.current) {
      mql.current = window.matchMedia("(display-mode: standalone)")
    }

    const current = mql.current

    listener(current)
    current.addEventListener("change", listener)

    return () => current.removeEventListener("change", listener)
  }, [router])

  return null
}

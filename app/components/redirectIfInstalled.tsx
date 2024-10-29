/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RedirectIfInstalled({ url }: { url: string }) {
  const router = useRouter()

  useEffect(() => {
    function listener(event: MediaQueryListEvent | MediaQueryList) {
      if (event.matches) {
        router.replace(url)
      }
    }

    const mql = window.matchMedia("(display-mode: standalone)")
    listener(mql)
    mql.addEventListener("change", listener)

    return () => mql.removeEventListener("change", listener)
  }, [router, url])

  return null
}

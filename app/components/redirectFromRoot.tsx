/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RedirectFromRoot() {
  const router = useRouter()
  const hasHydrated = useDataStore((state) => state.hasHydrated)
  const setupState = useDataStore((state) => state.setupState)

  useEffect(() => {
    function listener(event: MediaQueryListEvent | MediaQueryList) {
      if (event.matches) {
        router.replace("import")
      }
    }

    if (!hasHydrated) {
      return
    }

    switch (setupState) {
      case "installation":
        router.replace("install")
        return
      case "import":
        router.replace("import")
        return
      case "completed":
        router.replace("success")
        return
      default:
        const mql = window.matchMedia("(display-mode: standalone)")
        listener(mql)
        mql.addEventListener("change", listener)

        return () => mql.removeEventListener("change", listener)
    }
  }, [router, hasHydrated, setupState])

  return null
}

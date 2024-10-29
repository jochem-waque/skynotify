/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RedirectIfInstalled() {
  const setSetupState = useDataStore((state) => state.setSetupState)
  const router = useRouter()

  useEffect(() => {
    function listener(event: MediaQueryListEvent | MediaQueryList) {
      if (!event.matches) {
        return
      }

      setSetupState("authentication")
      router.replace("auth")
    }

    const mql = window.matchMedia("(display-mode: standalone)")
    listener(mql)
    mql.addEventListener("change", listener)

    return () => mql.removeEventListener("change", listener)
  }, [router, setSetupState])

  return null
}

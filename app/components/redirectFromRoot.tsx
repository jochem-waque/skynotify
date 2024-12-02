/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RedirectFromRoot() {
  const router = useRouter()

  useEffect(() => {
    async function listener(event: MediaQueryListEvent | MediaQueryList) {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        router.replace("/home")
        return
      }

      if (event.matches) {
        router.replace("/import")
      }
    }

    const mql = window.matchMedia("(display-mode: standalone)")
    listener(mql)
    mql.addEventListener("change", listener)

    return () => mql.removeEventListener("change", listener)
  }, [router])

  return null
}

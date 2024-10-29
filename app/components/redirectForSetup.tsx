/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RedirectForSetup() {
  const router = useRouter()
  const hasHydrated = useDataStore((state) => state.hasHydrated)
  const setupState = useDataStore((state) => state.setupState)

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    switch (setupState) {
      case "installation":
        router.replace("install")
        break
      case "authentication":
        router.replace("auth")
        break
      case "import":
        router.replace("import")
        break
      case "completed":
        router.replace("success")
        break
    }
  }, [router, hasHydrated, setupState])

  return null
}

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import Onboarding from "@/components/onboarding"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    function listener() {
      router.push("/configure")
    }

    const mql = window.matchMedia("(display-mode: standalone)")
    if (mql.matches) {
      router.push("/configure")
    }

    mql.addEventListener("change", listener)

    return () => {
      mql.removeEventListener("change", listener)
    }
  }, [router])

  return <Onboarding></Onboarding>
}

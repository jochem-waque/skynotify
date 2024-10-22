/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import Onboarding from "@/components/onboarding"
import { useEffect, useState } from "react"

export default function Page() {
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    function listener({ matches }: MediaQueryListEvent) {
      setIsStandalone(matches)
    }

    const mql = window.matchMedia("(display-mode: standalone)")
    setIsStandalone(mql.matches)

    mql.addEventListener("change", listener)

    return () => {
      mql.removeEventListener("change", listener)
    }
  })

  if (!isStandalone) {
    return <Onboarding></Onboarding>
  }
}

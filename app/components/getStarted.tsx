/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { BeforeInstallPromptEvent } from "@/util/types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function GetStarted() {
  const router = useRouter()
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent>()

  useEffect(() => {
    function listener(event: Event) {
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", listener)

    return () => window.removeEventListener("beforeinstallprompt", listener)
  }, [])

  async function promptAndRedirect() {
    const result = await installEvent?.prompt()
    if (result?.outcome === "accepted") {
      router.push("/install?accepted")
      return
    }

    router.push("/install")
  }

  if (installEvent) {
    return (
      <button
        type="button"
        className="bg-primary w-full max-w-48 rounded-lg p-4 text-center transition-opacity hover:opacity-75"
        onClick={promptAndRedirect}
      >
        Get started
      </button>
    )
  }

  return (
    <Link
      className="bg-primary w-full max-w-48 rounded-lg p-4 text-center transition-opacity hover:opacity-75"
      href={"install"}
    >
      Get started
    </Link>
  )
}

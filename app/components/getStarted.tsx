/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { BeforeInstallPromptEvent } from "@/util/types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

/*
 * If possible, prompt to install. If not authenticated, redirect to auth with
 * query parameter indicating installation status. Otherwise, redirect to
 * install or import depending on installation status.
 */
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
    await installEvent?.prompt()
    router.push("install", { scroll: true })
  }

  if (installEvent) {
    return (
      <button
        type="button"
        className="rounded-lg bg-blue-400 p-4 text-center transition-opacity hover:opacity-75 disabled:opacity-50 dark:bg-blue-600"
        onClick={promptAndRedirect}
      >
        Get started
      </button>
    )
  }

  return (
    <Link
      className="rounded-lg bg-blue-400 p-4 text-center transition-opacity hover:opacity-75 disabled:opacity-50 dark:bg-blue-600"
      href={"install"}
    >
      Get started
    </Link>
  )
}

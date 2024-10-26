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
export default function GetStarted({
  authenticated,
}: {
  authenticated: boolean
}) {
  const router = useRouter()
  const [installed, setInstalled] = useState(false)
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent>()

  useEffect(() => {
    function listener(event: Event) {
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", listener)

    return () => window.removeEventListener("beforeinstallprompt", listener)
  }, [])

  useEffect(() => {
    async function checkInstalledApps() {
      if (!navigator.getInstalledRelatedApps) {
        return
      }

      const apps = await navigator.getInstalledRelatedApps()
      setInstalled(
        apps.some(
          (app) =>
            app.platform === "webapp" &&
            app.url &&
            new URL(app.url).hostname === location.hostname,
        ),
      )
    }

    checkInstalledApps()
  }, [])

  async function promptAndRedirect() {
    const result = await installEvent?.prompt()
    const accepted = result?.outcome === "accepted"
    if (!authenticated) {
      router.push(`auth?installed=${accepted}`)
      return
    }

    router.push(accepted || installed ? "configure/import" : "install")
  }

  if (installEvent) {
    return (
      <button
        className="rounded-lg bg-blue-400 p-4 text-2xl transition-opacity hover:opacity-75 disabled:opacity-50 dark:bg-blue-600"
        onClick={promptAndRedirect}
      >
        Get started
      </button>
    )
  }

  return (
    <Link
      className="rounded-lg bg-blue-400 p-4 text-2xl transition-opacity hover:opacity-75 disabled:opacity-50 dark:bg-blue-600"
      href={
        installed && authenticated
          ? "import"
          : authenticated
            ? "install"
            : `auth?installed=${installed}`
      }
    >
      Get started
    </Link>
  )
}

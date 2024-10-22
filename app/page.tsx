/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt(): Promise<{ outcome: "accepted" | "dismissed"; platforms: string }>
}

declare global {
  interface Navigator {
    getInstalledRelatedApps?(): Promise<
      {
        id?: string
        platform:
          | "chrome_web_store"
          | "play"
          | "chromeos_play"
          | "webapp"
          | "windows"
          | "f-droid"
          | "amazon"
        url?: string
        version?: string
      }[]
    >
  }
}

export default function Page() {
  const router = useRouter()
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent>()
  const [disabled, setDisabled] = useState(true)
  const [installed, setInstalled] = useState(false)
  const [log, setLog] = useState("")

  useEffect(() => {
    setInstalled(window.matchMedia("(display-mode: standalone)").matches)
    if (navigator.getInstalledRelatedApps) {
      navigator
        .getInstalledRelatedApps()
        .then((result) => setLog(JSON.stringify(result))) // TODO
    }
  }, [])

  useEffect(() => {
    setDisabled("BeforeInstallPromptEvent" in window && !installEvent)
  }, [installEvent])

  useEffect(() => {
    function listener(event: Event) {
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", listener)

    return () => window.removeEventListener("beforeinstallprompt", listener)
  }, [])

  if (installed) {
    router.replace("/configure")
  }

  async function tryInstall(event?: BeforeInstallPromptEvent) {
    if (!event) {
      // TODO: different installation flow
      router.replace("/configure")
      return
    }

    setDisabled(true)
    const { outcome } = await event.prompt()
    if (outcome === "accepted") {
      router.replace("/configure")
    }

    setDisabled(false)
  }

  return (
    <main>
      <div className="flex min-h-[100svh] flex-col items-center justify-center gap-48">
        <div className="text-center">
          <h1 className="text-4xl">Bluesky Post Notifications</h1>
          <span>by jochem.cc</span>
          <code>{log}</code>
        </div>
        <button
          disabled={disabled}
          onClick={() => tryInstall(installEvent)}
          className="rounded-lg bg-blue-400 px-16 py-4 text-2xl transition-opacity hover:opacity-75 disabled:cursor-progress disabled:opacity-25 dark:bg-blue-600"
        >
          Get started
        </button>
      </div>
    </main>
  )
}

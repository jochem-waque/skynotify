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

  useEffect(() => {
    function listener() {
      router.replace("/configure")
    }

    const mql = window.matchMedia("(display-mode: standalone)")
    if (mql.matches) {
      router.replace("/configure")
    }

    mql.addEventListener("change", listener)

    return () => {
      mql.removeEventListener("change", listener)
    }
  }, [router])

  useEffect(() => {
    function listener() {
      router.replace("/configure")
    }

    window.addEventListener("appinstalled", listener)

    return () => window.removeEventListener("appinstaled", listener)
  }, [router])

  useEffect(() => {
    function listener(event: Event) {
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", listener)

    return () => window.removeEventListener("beforeinstallprompt", listener)
  }, [])

  async function tryInstall(event?: BeforeInstallPromptEvent) {
    if (!event) {
      router.replace("/install")
      return
    }

    await event.prompt()
  }

  return (
    <main className="container relative z-0 flex h-full flex-col items-center justify-center gap-48">
      <div className="text-center">
        <h1 className="text-4xl">Bluesky Post Notifications</h1>
        <span>by jochem.cc</span>
      </div>
      <button
        onClick={() => tryInstall(installEvent)}
        className="rounded-lg bg-blue-400 px-16 py-4 text-2xl transition-opacity hover:opacity-75 dark:bg-blue-600"
      >
        Get started
      </button>
    </main>
  )
}

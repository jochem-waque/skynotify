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

export default function Onboarding() {
  const router = useRouter()
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent>()

  function listener(event: Event) {
    setInstallEvent(event as BeforeInstallPromptEvent)
  }

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", listener)

    return () => window.removeEventListener("beforeinstallprompt", listener)
  }, [])

  async function tryInstall(event?: BeforeInstallPromptEvent) {
    if (!event) {
      router.push("/install")
      return
    }

    await event.prompt()
  }

  return (
    <main className="relative z-0 flex min-h-[100svh] flex-col items-center justify-center gap-48">
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

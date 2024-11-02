/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_AUTHOR: string
      NEXT_PUBLIC_SUBSCRIPTION_LIMIT: string
      NEXT_PUBLIC_VAPID_KEY: string
      DATABASE_URL: string
      HOSTNAME: string
    }
  }

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

  interface NotificationOptions {
    actions?: { action: string; title: string; icon?: string }[]
    badge?: string
    body?: string
    data?: unknown
    dir?: NotificationDirection
    icon?: string
    image?: string
    lang?: string
    renotify?: boolean
    requireInteraction?: boolean
    silent?: boolean | null
    tag?: string
    timestamp?: number
    vibrate?: number[]
  }
}

export {}
export type BeforeInstallPromptEvent = Event & {
  prompt(): Promise<{ outcome: "accepted" | "dismissed"; platforms: string }>
}

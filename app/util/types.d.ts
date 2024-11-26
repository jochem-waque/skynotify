/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
type Action = "like" | "repost" | "unlike" | "unrepost"

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_HOSTNAME: string
      NEXT_PUBLIC_VAPID_KEY: string
      DATABASE_URL: string
      EMAIL: string
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

  interface Notification {
    image: string
    timestamp: number
    actions: { action: Action; title: string; icon?: string }[]
  }

  interface NotificationEvent {
    action: Action
  }

  interface NotificationOptions {
    actions?: { action: Action; title: string; icon?: string }[]
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

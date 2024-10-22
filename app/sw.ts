/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import FirebaseApp from "@/util/firebase"
import { defaultCache } from "@serwist/next/worker"
import { getMessaging } from "firebase/messaging/sw"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist } from "serwist"

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})

self.addEventListener("notificationclick", (event) => {
  const url = new URL(event.notification.data.FCM_MSG.notification.click_action)
  if (url.hostname !== "bsky.app") {
    return
  }

  self.clients.openWindow(
    self.navigator.userAgent.toLowerCase().includes("android")
      ? `intent:/${url.pathname}#Intent;scheme=bluesky;package=xyz.blueskyweb.app;S.browser_fallback_url=${url};end`
      : url,
  )
})

getMessaging(FirebaseApp)

serwist.addEventListeners()

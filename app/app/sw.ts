/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import FirebaseApp from "@/util/firebase"
import { defaultCache } from "@serwist/next/worker"
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw"
import { get } from "idb-keyval"
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
  if (
    url.protocol !== "https" ||
    (url.hostname !== self.location.hostname && url.hostname !== "bsky.app")
  ) {
    return event.waitUntil(self.clients.openWindow(url))
  }

  if (url.hostname !== "bsky.app") {
    return
  }

  if (self.navigator.userAgent.toLowerCase().includes("android")) {
    return event.waitUntil(
      self.clients.openWindow(
        `intent:/${url.pathname}#Intent;scheme=bluesky;package=xyz.blueskyweb.app;S.browser_fallback_url=${url};end`,
      ),
    )
  }

  return event.waitUntil(self.clients.openWindow(url))
})

const messaging = getMessaging(FirebaseApp)

async function getClickAction(url?: string) {
  if (!url) {
    return undefined
  }

  const mode = (await get<"direct" | "manual">("redirect_mode")) ?? "direct"
  if (mode === "direct") {
    return url
  }

  const parsed = new URL(url)
  parsed.hostname = self.location.hostname
  return url.toString()
}

onBackgroundMessage(messaging, async (payload) => {
  if (!payload.data) {
    return
  }

  const { title, body, icon, image, tag, timestamp, url } = payload.data
  if (!title) {
    return
  }

  self.registration.showNotification(title, {
    badge: "/badge.png",
    body,
    data: {
      FCM_MSG: { notification: { click_action: await getClickAction(url) } },
    },
    icon,
    image,
    silent: true,
    tag,
    timestamp: Number(timestamp),
  })
})

serwist.addEventListeners()

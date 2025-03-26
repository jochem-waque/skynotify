/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { NotificationPayload } from "@/util/notification"
import { defaultCache } from "@serwist/next/worker"
import { initializeApp } from "firebase/app"
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw"
import { get, update } from "idb-keyval"
import { PrecacheEntry, Serwist, SerwistGlobalConfig } from "serwist"

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }

  const process: { env: NodeJS.ProcessEnv }
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
  if (url.protocol !== "https:") {
    return event.waitUntil(self.clients.openWindow(url))
  }

  return event.waitUntil(
    get<"direct" | "manual">("redirect_mode").then((mode) => {
      if (mode === "manual") {
        url.host = self.location.host
        return self.clients.openWindow(url)
      }

      if (self.navigator.userAgent.toLowerCase().includes("android")) {
        return self.clients.openWindow(
          `intent:/${url.pathname}#Intent;scheme=bluesky;package=xyz.blueskyweb.app;S.browser_fallback_url=${url};end`,
        )
      }

      return self.clients.openWindow(url)
    }),
  )
})

const firebaseApp = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
})
const messaging = getMessaging(firebaseApp)

onBackgroundMessage(messaging, (payload) => {
  if (!payload.data) {
    return
  }

  const { title, body, icon, image, tag, timestamp, url } = payload.data
  if (!title) {
    return
  }

  update<NotificationPayload[]>("history", (old) => [
    { title, body, icon, image, tag, timestamp, url },
    ...(old ?? []),
  ])

  self.registration.showNotification(title, {
    badge: "/badge.png",
    body,
    data: { FCM_MSG: { notification: { click_action: url } } },
    icon,
    image,
    silent: true,
    tag,
    timestamp: Number(timestamp),
  })
})

serwist.addEventListeners()

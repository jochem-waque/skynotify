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

const Actions = {
  Like: "like",
  Unlike: "unlike",
  Repost: "repost",
  Unrepost: "unrepost",
}

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

async function like(notification: Notification) {
  await self.registration.showNotification(notification.title, {
    badge: "/badge.png",
    body: `Liked a post from ${notification.title}`,
    icon: notification.icon,
    silent: true,
    tag: notification.tag,
    timestamp: notification.timestamp,
  })

  await new Promise((resolve) => setTimeout(resolve, 2500))

  await self.registration.showNotification(notification.title, {
    badge: "/badge.png",
    body: notification.body,
    data: notification.data,
    icon: notification.icon,
    image: notification.image,
    silent: true,
    tag: notification.tag,
    timestamp: notification.timestamp,
    actions: notification.actions.map((action) =>
      action.action === "like"
        ? { action: "unlike", title: "Remove like" }
        : action.action === "unlike"
          ? { action: "like", title: "Like" }
          : action,
    ),
  })
}

self.addEventListener("notificationclick", (event) => {
  switch (event.action) {
    case "like":
      event.waitUntil(like(event.notification))
      return
    default:
      break
  }

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

const messaging = getMessaging(FirebaseApp)

onBackgroundMessage(messaging, (payload) => {
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
    data: { FCM_MSG: { notification: { click_action: url } } },
    icon,
    image,
    silent: true,
    tag,
    timestamp: Number(timestamp),
    actions: [
      { action: Actions.Like, title: "Like" },
      { action: Actions.Repost, title: "Repost" },
    ],
  })
})

serwist.addEventListeners()

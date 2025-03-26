/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { onMessage } from "firebase/messaging"
import { get } from "idb-keyval"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

export default function OpenBackgroundNotifications() {
  const getMessaging = useDataStore((state) => state.getMessaging)
  const router = useRouter()
  const registration = useRef<ServiceWorkerRegistration>(null)

  useEffect(() => {
    async function listener(event: MessageEvent) {
      if (
        event.data.messageType !== "notification-clicked" ||
        !event.data.notification.click_action
      ) {
        return
      }

      const url = new URL(event.data.notification.click_action)
      if (url.protocol !== "https:") {
        router.replace(url.toString())
        return
      }

      const mode = await get<"direct" | "manual">("redirect_mode")

      if (mode === "manual") {
        url.host = self.location.host
        router.replace(url.toString())
        return
      }

      if (self.navigator.userAgent.toLowerCase().includes("android")) {
        router.replace(
          `intent:/${url.pathname}#Intent;scheme=bluesky;package=xyz.blueskyweb.app;S.browser_fallback_url=${url};end`,
        )
        return
      }

      router.replace(url.toString())
    }

    navigator.serviceWorker.addEventListener("message", listener)
    return () => {
      navigator.serviceWorker.removeEventListener("message", listener)
    }
  }, [router])

  useEffect(() => {
    async function setRegistration() {
      registration.current = await navigator.serviceWorker.ready
    }

    setRegistration()
  }, [])

  useEffect(() => {
    const messaging = getMessaging()
    return onMessage(messaging, (payload) => {
      if (!payload.data || !registration.current) {
        return
      }

      const { title, body, icon, image, tag, timestamp, url } = payload.data
      if (!title) {
        return
      }

      registration.current.showNotification(title, {
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
  }, [getMessaging])

  return null
}

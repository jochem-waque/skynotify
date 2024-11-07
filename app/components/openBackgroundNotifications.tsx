/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import FirebaseApp from "@/util/firebase"
import { getMessaging, onMessage } from "firebase/messaging"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

export default function OpenBackgroundNotifications() {
  const router = useRouter()
  const registration = useRef<ServiceWorkerRegistration>(null)

  useEffect(() => {
    function listener(event: MessageEvent) {
      if (event.data.messageType === "notification-clicked") {
        router.replace(event.data.notification.click_action)
      }
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
    const messaging = getMessaging(FirebaseApp)
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
  }, [])

  return null
}

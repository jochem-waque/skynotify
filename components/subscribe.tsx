/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import FirebaseApp from "@/util/firebase"
import { FirebaseError } from "firebase/app"
import { getMessaging, getToken } from "firebase/messaging"
import { useState, useEffect } from "react"

export default function Subscribe() {
  const [token, setToken] = useState("")

  useEffect(() => {
    async function restoreToken() {
      const registration = await navigator.serviceWorker.getRegistration()
      const subscription = await registration?.pushManager.getSubscription()
      if (subscription) {
        subscribeToPush(registration)
      }
    }

    restoreToken()
  }, [])

  useEffect(() => {
    function listener(event: MessageEvent) {
      if (event.data.messageType === "notification-clicked") {
        window.location.href = event.data.notification.click_action
      }
    }

    navigator.serviceWorker.addEventListener("message", listener)
    return () => {
      navigator.serviceWorker.removeEventListener("message", listener)
    }
  }, [])

  async function subscribeToPush(registration?: ServiceWorkerRegistration) {
    registration ??= await navigator.serviceWorker.getRegistration()
    if (!registration) {
      return // TODO this shouldn't be possible
    }

    const messaging = getMessaging(FirebaseApp)
    let token
    try {
      token = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      })
    } catch (err) {
      if (
        !(err instanceof FirebaseError) ||
        err.code !== "messaging/permission-blocked"
      ) {
        // TODO: other error
        return
      }

      return
    }

    setToken(token)
  }

  return <button onClick={() => subscribeToPush()}>Subscribe</button>
}

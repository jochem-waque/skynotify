/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import FirebaseApp from "@/util/firebase"
import { getMessaging, getToken } from "firebase/messaging"
import { useState, useEffect } from "react"

function Subscribe() {
  const [isSupported, setIsSupported] = useState(false)
  const [token, setToken] = useState("")

  useEffect(() => {
    async function registerNotifications() {
      const registration = await navigator.serviceWorker.getRegistration()
      const subscription = await registration?.pushManager.getSubscription()
      if (subscription) {
        subscribeToPush(registration)
      }
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)
      registerNotifications()
    }
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
      return // TODO: error
    }

    const messaging = getMessaging(FirebaseApp)
    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey:
        "BL5X3aTsXTsiij2gjvsbVYCEKirzRaAaJ6ipnlI63PxaOCXbMDDb-KZ5_pQEPHZnORGct6aYYjgQc-cxrhm4D-c",
    })
    setToken(token)
  }

  if (!isSupported) {
    return null
  }

  if (token) {
    return (
      <code className="break-all bg-neutral-100 p-1 dark:bg-neutral-900">
        {token}
      </code>
    )
  }

  return (
    <button onClick={() => subscribeToPush()}>
      Subscribe to push notifications
    </button>
  )
}

export default function Page() {
  return <Subscribe></Subscribe>
}

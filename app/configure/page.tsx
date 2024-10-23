/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import FirebaseApp from "@/util/firebase"
import { FirebaseError } from "firebase/app"
import { getMessaging, getToken } from "firebase/messaging"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function Page() {
  const [isSupported, setIsSupported] = useState(false)
  const [token, setToken] = useState("")
  const [denied, setDenied] = useState(false)

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
    let token
    try {
      token = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        vapidKey:
          "BL5X3aTsXTsiij2gjvsbVYCEKirzRaAaJ6ipnlI63PxaOCXbMDDb-KZ5_pQEPHZnORGct6aYYjgQc-cxrhm4D-c",
      })
    } catch (err) {
      if (
        !(err instanceof FirebaseError) ||
        err.code !== "messaging/permission-blocked"
      ) {
        // TODO: other error
        return
      }

      setDenied(true)
      return
    }

    setToken(token)
  }

  if (!isSupported) {
    return null
  }

  return (
    <main className="container">
      {token && (
        <code className="break-all bg-neutral-100 p-1 dark:bg-neutral-900">
          {token}
        </code>
      )}
      {!token && (
        <button onClick={() => subscribeToPush()}>
          Subscribe to push notifications
        </button>
      )}
      {denied && <Link href="/">Click here now lol</Link>}
    </main>
  )
}

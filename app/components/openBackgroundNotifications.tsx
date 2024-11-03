/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import FirebaseApp from "@/util/firebase"
import { getMessaging, onMessage } from "firebase/messaging"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function OpenBackgroundNotifications() {
  const router = useRouter()

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
    const messaging = getMessaging(FirebaseApp)
    return onMessage(messaging, () => console.log)
  }, [])

  return null
}

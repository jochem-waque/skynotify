/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import FirebaseApp from "@/util/firebase"
import { useDataStore } from "@/util/store"
import { getMessaging, getToken } from "firebase/messaging"
import { useEffect } from "react"

export default function UpdateToken() {
  const setToken = useDataStore((state) => state.setToken)

  useEffect(() => {
    async function updateToken() {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        return
      }

      const messaging = getMessaging(FirebaseApp)

      setToken(
        await getToken(messaging, {
          serviceWorkerRegistration: registration,
          vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
        }),
      )
    }

    updateToken()
  }, [setToken])

  return null
}

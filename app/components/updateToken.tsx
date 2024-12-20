/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import FirebaseApp from "@/util/firebase"
import { useDataStore } from "@/util/store"
import { getMessaging, getToken } from "firebase/messaging"
import { useEffect, useRef } from "react"

export default function UpdateToken() {
  const setToken = useDataStore((state) => state.setToken)
  const loadSaved = useDataStore((state) => state.loadSaved)
  const fetchSelected = useDataStore((state) => state.fetchSelected)
  const once = useRef(true)

  useEffect(() => {
    async function updateToken() {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        return
      }

      const messaging = getMessaging(FirebaseApp)

      const token = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      })
      // TODO race condition: if the token changes, the config might not be fetched correctly
      setToken(token)
      loadSaved(token).then(() => fetchSelected())
    }

    if (once.current) {
      once.current = false
      updateToken()
    }
  }, [setToken, fetchSelected, loadSaved])

  return null
}

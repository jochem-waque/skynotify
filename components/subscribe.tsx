/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { putToken } from "@/actions/token"
import FirebaseApp from "@/util/firebase"
import { FirebaseError } from "firebase/app"
import { getMessaging, getToken } from "firebase/messaging"

export default function Subscribe() {
  // TODO handle token expiry

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

    await putToken(token)
  }

  return <button onClick={() => subscribeToPush()}>Subscribe</button>
}

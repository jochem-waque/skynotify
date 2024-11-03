/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { save } from "@/actions/save"
import FirebaseApp from "@/util/firebase"
import { useDataStore } from "@/util/store"
import { FirebaseError } from "firebase/app"
import { getMessaging, getToken } from "firebase/messaging"

const limit = parseInt(process.env.NEXT_PUBLIC_SUBSCRIPTION_LIMIT)

export default function SaveChangesButton() {
  const selected = useDataStore((state) => state.selected)
  const notifyPosts = useDataStore((state) => state.notifyPosts)
  const notifyReposts = useDataStore((state) => state.notifyReposts)
  const notifyReplies = useDataStore((state) => state.notifyReplies)
  const saveCurrent = useDataStore((state) => state.saveCurrent)

  async function click() {
    const token = await subscribeToPush()
    if (!token) {
      // TODO
      return
    }

    saveCurrent()
    await save(
      token,
      [...selected.values()].slice(0, limit).map((did) => ({
        target: did,
        posts: notifyPosts.has(did),
        reposts: notifyReposts.has(did),
        replies: notifyReplies.has(did),
      })),
    )
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      return null
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
        return null
      }

      return null
    }

    return token
  }

  return (
    <button
      onClick={click}
      type="button"
      className="z-10 w-full rounded-lg bg-blue-400 p-4 text-center dark:bg-blue-600"
    >
      Save changes
    </button>
  )
}

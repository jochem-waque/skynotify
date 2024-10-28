/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { save } from "@/actions/save"
import { putToken } from "@/actions/token"
import FirebaseApp from "@/util/firebase"
import { useProfilesStore } from "@/util/profilesStore"
import { FirebaseError } from "firebase/app"
import { getMessaging, getToken } from "firebase/messaging"

export default function SaveChangesButton() {
  const notifyPosts = useProfilesStore((state) => state.notifyPosts)
  const notifyReposts = useProfilesStore((state) => state.notifyReposts)
  const notifyReplies = useProfilesStore((state) => state.notifyReplies)

  async function click() {
    await subscribeToPush()
    await save(
      [...notifyPosts.union(notifyReposts).union(notifyReplies)].map((did) => ({
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

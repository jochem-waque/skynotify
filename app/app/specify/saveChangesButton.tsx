/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { save } from "@/actions/save"
import { SubscriptionLimit } from "@/config"
import FirebaseApp from "@/util/firebase"
import { useDataStore } from "@/util/store"
import { FirebaseError } from "firebase/app"
import { getMessaging, getToken } from "firebase/messaging"
import { useState } from "react"

export default function SaveChangesButton() {
  const selected = useDataStore((state) => state.selected)
  const notifyPosts = useDataStore((state) => state.notifyPosts)
  const notifyReposts = useDataStore((state) => state.notifyReposts)
  const notifyReplies = useDataStore((state) => state.notifyReplies)
  const saveCurrent = useDataStore((state) => state.saveCurrent)
  const [error, setError] = useState("")
  const [disabled, setDisabled] = useState(false)

  async function click() {
    setDisabled(true)
    const token = await subscribeToPush()
    if (!token) {
      setDisabled(false)
      return
    }

    saveCurrent()
    await save(
      token,
      [...selected.values()].slice(0, SubscriptionLimit).map((did) => ({
        target: did,
        posts: notifyPosts.has(did),
        reposts: notifyReposts.has(did),
        replies: notifyReplies.has(did),
      })),
    )

    // redirect works by throwing an error that Next handles
    setError(
      "An unexpected error occurred while saving the configuration, please try again later.",
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
        setError("An unexpected error occurred, please try again later.")
        return null
      }

      setError(
        "Notification permission was denied. You might need to manually allow access to notifications.",
      )
      return null
    }

    setError("")
    return token
  }

  return (
    <>
      {error && <p className="z-10 text-red-500">{error}</p>}
      <button
        onClick={click}
        disabled={disabled}
        type="button"
        className="z-10 w-full rounded-lg bg-blue-400 p-4 text-center disabled:opacity-75 dark:bg-blue-600"
      >
        Save changes
      </button>
    </>
  )
}

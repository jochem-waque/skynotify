/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import {
  updateAllNotifyPosts,
  updateAllNotifyReplies,
  updateAllNotifyReposts,
  useDataStore,
} from "@/util/store"
import { ChangeEvent, useEffect } from "react"

export default function NotificationChipInput({
  type,
  did,
}: {
  type: "reposts" | "replies" | "posts"
  did: string
}) {
  const checked = useDataStore((state) =>
    type === "posts"
      ? state.notifyPosts
      : type === "reposts"
        ? state.notifyReposts
        : state.notifyReplies,
  )
  const setPreference = useDataStore((state) =>
    type === "posts"
      ? state.setNotifyPosts
      : type === "reposts"
        ? state.setNotifyReposts
        : state.setNotifyReplies,
  )
  const update =
    type === "posts"
      ? updateAllNotifyPosts
      : type === "reposts"
        ? updateAllNotifyReposts
        : updateAllNotifyReplies
  const setUnsaved = useDataStore((state) => state.setUnsaved)

  useEffect(() => update(), [update])

  function change(event: ChangeEvent<HTMLInputElement>) {
    setPreference(did, event.currentTarget.checked)
    update()
    setUnsaved()
  }

  return (
    <input
      checked={checked.has(did)}
      className="h-0 w-0"
      type="checkbox"
      onChange={change}
    ></input>
  )
}

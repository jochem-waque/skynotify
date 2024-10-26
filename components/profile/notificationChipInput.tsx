/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useProfilesStore } from "@/util/profilesStore"
import { ChangeEvent } from "react"

export default function NotificationChipInput({
  name,
  did,
}: {
  name: "reposts" | "replies" | "posts"
  did: string
}) {
  const checked = useProfilesStore((state) =>
    name === "posts"
      ? state.notifyPosts
      : name === "reposts"
        ? state.notifyReposts
        : state.notifyReplies,
  )
  const setPreference = useProfilesStore((state) =>
    name === "posts"
      ? state.setNotifyPosts
      : name === "reposts"
        ? state.setNotifyReposts
        : state.setNotifyReplies,
  )

  function change(event: ChangeEvent<HTMLInputElement>) {
    setPreference(did, event.currentTarget.checked)
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

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useProfilesStore } from "@/util/profilesStore"
import { ChangeEvent } from "react"

export default function NotificationChipInput({
  defaultChecked,
  name,
  did,
}: {
  defaultChecked: boolean
  name: "reposts" | "replies" | "posts"
  did: string
}) {
  const setPreference = useProfilesStore((state) =>
    name === "reposts"
      ? state.setNotifyReposts
      : name === "replies"
        ? state.setNotifyReplies
        : state.setNotifyPosts,
  )

  function change(event: ChangeEvent<HTMLInputElement>) {
    setPreference(did, event.currentTarget.checked)
  }

  return (
    <input
      defaultChecked={defaultChecked}
      className="h-0 w-0"
      type="checkbox"
      onChange={change}
    ></input>
  )
}

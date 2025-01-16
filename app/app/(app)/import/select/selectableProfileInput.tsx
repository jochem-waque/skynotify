/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { ChangeEvent, useEffect, useState } from "react"

export default function SelectableProfileInput({
  did,
}: Pick<ProfileView, "did">) {
  const setSelected = useDataStore((state) => state.setSelected)
  const setNotifyPosts = useDataStore((state) => state.setNotifyPosts)
  const isSelected = useDataStore((state) => state.isSelected)
  const [thisSelected, setThisSelected] = useState(isSelected(did))

  useEffect(() => {
    setThisSelected(isSelected(did))
  }, [did, isSelected])

  function change(event: ChangeEvent<HTMLInputElement>) {
    setThisSelected(event.currentTarget.checked)
    setSelected(event.currentTarget.name, event.currentTarget.checked)
    if (event.currentTarget.checked) {
      setNotifyPosts(event.currentTarget.name, true)
    }
  }

  return (
    <input
      className="h-0 w-0"
      onChange={change}
      checked={thisSelected}
      name={did}
      type="checkbox"
    ></input>
  )
}

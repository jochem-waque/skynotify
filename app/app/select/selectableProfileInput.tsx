/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { ChangeEvent, useEffect, useState } from "react"

const limit = parseInt(process.env.NEXT_PUBLIC_SUBSCRIPTION_LIMIT)

export default function SelectableProfileInput({
  did,
}: Pick<ProfileView, "did">) {
  const selected = useDataStore((state) => state.selected)
  const setSelected = useDataStore((state) => state.setSelected)
  const isSelected = selected.has(did)

  function change(event: ChangeEvent<HTMLInputElement>) {
    setSelected(event.currentTarget.name, event.currentTarget.checked)
  }

  // TODO doesn't seem to work otherwise in production
  const [disabled, setDisabled] = useState(false)
  useEffect(() => {
    setDisabled(selected.size >= limit && !isSelected)
  }, [isSelected, selected.size])

  useEffect(() => {
    if (disabled) {
      console.log("Disabled is true")
    }
  }, [disabled])

  useEffect(() => console.log("Limit", limit), [])

  useEffect(() => {
    console.log(selected.size)
  }, [selected.size])

  useEffect(() => {
    console.log(selected.size)
  }, [selected])

  return (
    <input
      disabled={disabled}
      className="h-0 w-0"
      onChange={change}
      checked={isSelected}
      name={did}
      type="checkbox"
    ></input>
  )
}

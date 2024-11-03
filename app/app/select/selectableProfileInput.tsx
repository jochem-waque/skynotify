/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { ChangeEvent, useMemo } from "react"

const limit = parseInt(process.env.NEXT_PUBLIC_SUBSCRIPTION_LIMIT)

export default function SelectableProfileInput({
  did,
}: Pick<ProfileView, "did">) {
  const selected = useDataStore((state) => state.selected)
  const setSelected = useDataStore((state) => state.setSelected)
  const isSelected = useMemo(() => selected.has(did), [selected, did])
  const disabled = useMemo(
    () => selected.size >= limit && !isSelected,
    [selected, isSelected],
  )

  function change(event: ChangeEvent<HTMLInputElement>) {
    setSelected(event.currentTarget.name, event.currentTarget.checked)
  }

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

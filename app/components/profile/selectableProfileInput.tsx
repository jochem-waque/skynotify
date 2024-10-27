/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { updateAllSelected, useProfilesStore } from "../../util/profilesStore"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { ChangeEvent, useEffect } from "react"

export default function SelectableProfileInput({
  did,
}: Pick<ProfileView, "did">) {
  const selected = useProfilesStore((state) => state.selected)
  const setSelected = useProfilesStore((state) => state.setSelected)

  useEffect(() => {
    updateAllSelected()
  }, [])

  function change(event: ChangeEvent<HTMLInputElement>) {
    setSelected(event.currentTarget.name, event.currentTarget.checked)
    updateAllSelected()
  }

  return (
    <input
      className="h-0 w-0"
      onChange={change}
      checked={selected.has(did)}
      name={did}
      type="checkbox"
    ></input>
  )
}

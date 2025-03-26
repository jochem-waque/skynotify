/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { ChangeEvent, useEffect, useState } from "react"

export default function NotifyRepliesInput({ did }: { did: string }) {
  const isNotifyReplies = useDataStore((state) => state.isNotifyReplies)
  const setNotifyReplies = useDataStore((state) => state.setNotifyReplies)
  const setUnsaved = useDataStore((state) => state.setUnsaved)
  const [checked, setChecked] = useState(isNotifyReplies(did))

  // TODO fix double rerender
  useEffect(() => {
    setChecked(isNotifyReplies(did))
  }, [did, isNotifyReplies])

  function change(event: ChangeEvent<HTMLInputElement>) {
    setNotifyReplies(did, event.currentTarget.checked)
    setChecked(event.currentTarget.checked)
    setUnsaved()
  }

  return (
    <input
      checked={checked}
      className="h-0 w-0"
      type="checkbox"
      onChange={change}
    ></input>
  )
}

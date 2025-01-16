/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { ChangeEvent, useEffect, useState } from "react"

export default function NotifyRepostsInput({ did }: { did: string }) {
  const isNotifyReposts = useDataStore((state) => state.isNotifyReposts)
  const setNotifyReposts = useDataStore((state) => state.setNotifyReposts)
  const setUnsaved = useDataStore((state) => state.setUnsaved)
  const [checked, setChecked] = useState(isNotifyReposts(did))

  // TODO fix double rerender
  useEffect(() => {
    setChecked(isNotifyReposts(did))
  }, [did, isNotifyReposts])

  function change(event: ChangeEvent<HTMLInputElement>) {
    setNotifyReposts(did, event.currentTarget.checked)
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

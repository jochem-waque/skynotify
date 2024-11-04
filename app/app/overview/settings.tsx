/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { get, update } from "idb-keyval"
import { ChangeEvent, useEffect, useState } from "react"

const defaultValue = "direct"

export default function RedirectDropdown() {
  const [value, setValue] = useState<string>()

  function change(event: ChangeEvent<HTMLSelectElement>) {
    setValue(event.currentTarget.value)
  }

  useEffect(() => {
    if (!value) {
      return
    }

    update("redirect_mode", () => value)
  }, [value])

  useEffect(() => {
    async function thing() {
      const current = await get<string>("redirect_mode")
      setValue(current ?? defaultValue)
    }

    thing()
  }, [])

  return (
    <select
      className="inline border-b bg-transparent dark:border-white"
      disabled={!value}
      value={value}
      onChange={change}
      defaultValue={defaultValue}
    >
      <option className="text-base dark:bg-neutral-900" value="direct">
        Direct (fastest)
      </option>
      <option className="text-base dark:bg-neutral-900" value="manual">
        Manual
      </option>
    </select>
  )
}

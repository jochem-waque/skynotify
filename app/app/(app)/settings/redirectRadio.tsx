/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { get, update } from "idb-keyval"
import { ChangeEvent, useEffect, useState } from "react"
import { UAParser } from "ua-parser-js"

export default function RedirectRadio() {
  const [value, setValue] = useState<string>()

  function change(event: ChangeEvent<HTMLInputElement>) {
    if (event.currentTarget.checked) {
      setValue(event.currentTarget.value)
    }
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
      if (current !== undefined) {
        setValue(current)
        return
      }

      const parser = new UAParser()
      const os = parser.getOS()?.name
      if (os === "iOS" || os === "macOS") {
        setValue("manual")
        return
      }

      setValue("direct")
    }

    thing()
  }, [])

  return (
    <fieldset
      disabled={!value}
      className="flex flex-col gap-1 disabled:opacity-50"
    >
      <label>
        <input
          type="radio"
          value="direct"
          checked={value === "direct"}
          onChange={change}
        ></input>{" "}
        Direct (fastest): directly open posts. Opens posts in the browser on
        some platforms.
      </label>
      <label>
        <input
          type="radio"
          value="manual"
          checked={value === "manual"}
          onChange={change}
        ></input>{" "}
        Indirect: redirect to a page that attempts to open the Bluesky app.
        Works well on Apple devices.
      </label>
    </fieldset>
  )
}

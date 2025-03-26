/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { useEffect, useState } from "react"

export default function SupportId() {
  const token = useDataStore((state) => state.token)
  const [hash, setHash] = useState<string>()

  useEffect(() => {
    async function calculateHash(value: string) {
      const msgUint8 = new TextEncoder().encode(value)
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      setHash(hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""))
    }

    if (!token) {
      return
    }

    calculateHash(token)
  }, [token])

  return hash ? (
    <span>
      Support ID: <span className="font-mono"></span>
      {hash.slice(0, 8)}
    </span>
  ) : null
}

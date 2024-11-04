/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { useRouter } from "next/navigation"

export default function ReturnToSetup() {
  const loadSaved = useDataStore((state) => state.loadSaved)
  const router = useRouter()

  function click() {
    loadSaved()
    router.push("import")
  }

  return (
    <button
      className="z-10 rounded-lg bg-blue-400 p-4 transition-opacity hover:opacity-75 dark:bg-blue-600"
      onClick={click}
      type="button"
    >
      Return to setup
    </button>
  )
}

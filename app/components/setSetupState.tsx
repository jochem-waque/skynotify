/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { useDataStore } from "@/util/store"
import { useEffect } from "react"

export default function SetSetupState({
  setupState,
}: {
  setupState: Parameters<Parameters<typeof useDataStore>[0]>[0]["setupState"]
}) {
  const setSetupState = useDataStore((state) => state.setSetupState)

  useEffect(() => {
    setSetupState(setupState)
  }, [setSetupState, setupState])

  return null
}

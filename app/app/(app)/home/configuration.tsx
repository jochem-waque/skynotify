/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import EditableProfile from "./editableProfile"

// TODO in the future, this might need infinite scroll and a searchbar too
export default function Configuration() {
  const profiles = useDataStore((state) => state.profiles)

  return (
    <>
      {[...profiles.entries()].map(([did, profile]) => (
        <EditableProfile
          key={did}
          did={did}
          profile={profile}
        ></EditableProfile>
      ))}
    </>
  )
}

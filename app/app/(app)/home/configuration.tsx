/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import SearchableList from "@/components/searchableList"
import { useDataStore } from "@/util/store"
import EditableProfile from "./editableProfile"

export default function Configuration() {
  const profiles = useDataStore((state) => state.profiles)

  return (
    <SearchableList
      items={[...profiles.entries()].map(([did, value]) => ({ did, ...value }))}
      renderItem={({ did, ...profile }) => (
        <EditableProfile
          key={did}
          did={did}
          profile={profile}
        ></EditableProfile>
      )}
      keys={["handle", "displayName", "description"]}
      placeholder="Search profiles"
    ></SearchableList>
  )
}

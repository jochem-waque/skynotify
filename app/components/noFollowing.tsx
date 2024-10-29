/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "../util/store"

export default function NoFollowing() {
  const fetching = useDataStore((state) => state.fetching)
  const profiles = useDataStore((state) => state.profiles)

  if (fetching || profiles.size > 0) {
    return null
  }

  return <p>It appears that you don&apos;t follow anyone on Bluesky</p>
}

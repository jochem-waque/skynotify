/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useProfilesStore } from "../util/profilesStore"

export default function NoFollowing() {
  const fetching = useProfilesStore((state) => state.fetching)
  const profiles = useProfilesStore((state) => state.profiles)

  if (fetching || profiles.length) {
    return null
  }

  return <p>It appears that you don&apos;t follow anyone on Bluesky</p>
}

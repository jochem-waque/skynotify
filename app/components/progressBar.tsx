/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"

export default function ProgressBar() {
  const fetching = useDataStore((state) => state.fetching)
  const profiles = useDataStore((state) => state.profiles)
  const followsCount = useDataStore((state) => state.followsCount)

  const percentage = fetching
    ? 100 * Math.min(1, profiles.size / followsCount)
    : 100

  return (
    <div
      className={`${fetching ? "mt-0 min-h-1" : "-mt-2 min-h-0"} relative w-full rounded-lg bg-neutral-100 transition-[margin-top,min-height] dark:bg-neutral-800`}
    >
      <div
        style={{ width: `${percentage}%` }}
        className="absolute h-full rounded-lg bg-blue-400 transition-[width] dark:bg-blue-600"
      ></div>
    </div>
  )
}

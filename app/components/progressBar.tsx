/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"

export default function ProgressBar() {
  const fetching = useDataStore((state) => state.fetching)
  const profiles = useDataStore((state) => state.profiles)
  const followsCount = useDataStore((state) => state.followsCount)
  const fetchError = useDataStore((state) => state.fetchError)

  const percentage =
    followsCount > 0 ? 100 * Math.min(1, profiles.size / followsCount) : 100

  return (
    <>
      {fetchError && (
        <p className="text-red-500">
          An unexpected error occurred while loading the requested user&apos;s
          following, please try again later.
        </p>
      )}
      <div
        className={`${fetching || fetchError ? "mt-0 min-h-1" : "-mt-2 min-h-0"} relative w-full rounded-lg bg-neutral-200 transition-[margin-top,min-height] dark:bg-neutral-800`}
      >
        <div
          style={{ width: `${percentage}%` }}
          className={`${fetchError ? "bg-red-500" : "bg-primary"} absolute h-full rounded-lg transition-[width]`}
        ></div>
      </div>
    </>
  )
}

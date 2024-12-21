/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useRouter } from "next/navigation"

export default function NavigationButton() {
  const router = useRouter()

  return (
    <svg
      onClick={() => router.back()}
      className="w-4 shrink-0 cursor-pointer fill-current"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="15.6 15.3 18.4 19.4"
    >
      <path d="M25.3 34.7L15.6 25l9.7-9.7 1.4 1.4-8.3 8.3 8.3 8.3z"></path>{" "}
      <path d="M17 24h17v2H17z"></path>
    </svg>
  )
}

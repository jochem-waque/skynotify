/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Redirect({ href }: { href: string }) {
  const router = useRouter()

  useEffect(() => router.replace(href), [router, href])

  return null
}

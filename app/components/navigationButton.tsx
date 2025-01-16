/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import Link from "next/link"
import { ComponentProps } from "react"

type Props = {
  active: boolean
  icon: string
  title: string
  href: string
}

export default function NavigationButton({
  active,
  icon,
  title,
  href,
  ...rest
}: Props & Omit<ComponentProps<typeof Link>, keyof Props & "className">) {
  if (active) {
    return (
      <Link
        className="flex h-12 w-20 shrink-0 flex-col items-center justify-center rounded-lg bg-neutral-300 hover:bg-neutral-300 dark:bg-neutral-900 dark:hover:bg-neutral-900"
        href={href}
        {...rest}
      >
        <h2>{icon}</h2>
        <h1 className="text-sm">{title}</h1>
      </Link>
    )
  }

  return (
    <Link
      className="flex h-12 w-20 shrink-0 flex-col items-center justify-center rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-900"
      href={href}
      {...rest}
    >
      <span>{icon}</span>
      <span className="text-sm">{title}</span>
    </Link>
  )
}

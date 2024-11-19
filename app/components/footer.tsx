/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Link from "next/link"
import { ReactNode } from "react"

export default function Footer({
  absolute,
  children,
}: {
  absolute?: boolean
  children?: ReactNode
}) {
  return (
    <footer
      className={`${absolute ? "absolute bottom-0" : ""} flex w-full flex-col items-center gap-1 text-xs opacity-50`}
    >
      {children}
      <span>Not affiliated with Bluesky</span>
      <div className="flex flex-wrap justify-center gap-2">
        <Link
          className="underline transition-opacity hover:opacity-75"
          href="/privacy"
        >
          Privacy Policy
        </Link>
        <span className="border-r border-current"></span>
        <Link
          className="underline transition-opacity hover:opacity-75"
          href="/liability"
        >
          Liability Disclaimer
        </Link>
        <span className="border-r border-current"></span>
        <Link
          className="underline transition-opacity hover:opacity-75"
          href={`mailto:${process.env.EMAIL}`}
        >
          Contact
        </Link>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <span>
          Made with <span className="font-mono">&lt;3</span>
        </span>
        <span className="border-r border-current"></span>
        <span>
          &copy;{" "}
          <Link
            className="underline transition-opacity hover:opacity-75"
            href="https://github.com/Jochem-W"
          >
            Jochem-W
          </Link>{" "}
          2024
        </span>
      </div>
    </footer>
  )
}

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Link from "next/link"

export default function Footer({ absolute }: { absolute?: boolean }) {
  return (
    <footer
      className={`${absolute ? "absolute bottom-0" : ""} flex w-full justify-center gap-2`}
    >
      <p>&copy; {process.env.AUTHOR} 2024</p>
      <span className="border-r border-current"></span>
      <Link
        className="underline transition-opacity hover:opacity-75"
        href="/privacy"
      >
        Privacy Policy
      </Link>
      <span className="border-r border-current"></span>
      <Link
        className="underline transition-opacity hover:opacity-75"
        href="/terms"
      >
        Terms of Use
      </Link>
    </footer>
  )
}

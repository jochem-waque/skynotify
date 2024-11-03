/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Link from "next/link"

export default function Footer({ absolute }: { absolute?: boolean }) {
  return (
    <footer
      className={`${absolute ? "absolute bottom-0" : ""} flex w-full flex-wrap justify-center gap-2 text-xs opacity-50`}
    >
      <span>
        Made with <span className="brightness-0 grayscale dark:invert">❤️</span>
      </span>
      <span className="border-r border-current"></span>
      <span>
        &copy;{" "}
        <Link
          className="underline hover:opacity-75"
          href="https://github.com/Jochem-W"
        >
          Jochem-W
        </Link>{" "}
        2024
      </span>
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
        href="/liability"
      >
        Liability Disclaimer
      </Link>
    </footer>
  )
}

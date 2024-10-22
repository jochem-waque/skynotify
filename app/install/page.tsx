/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Link from "next/link"

export default function Page() {
  return (
    <div className="absolute z-10 flex h-full w-full flex-col justify-between bg-white p-4 dark:bg-black">
      <div className="flex flex-col gap-4">
        <h2 className="text-center text-3xl">Installation</h2>
        <p>
          Your browser doesn&apos;t appear to support Progessive Web App
          installation prompts. Instead, please manually install the app by
          doing the following:
        </p>
        <p>Instructions...</p>
      </div>
      <Link
        href={"/configure"}
        className="rounded-lg bg-blue-400 py-4 text-center transition-opacity hover:opacity-75 dark:bg-blue-600"
      >
        I&apos;ve installed the app
      </Link>
    </div>
  )
}

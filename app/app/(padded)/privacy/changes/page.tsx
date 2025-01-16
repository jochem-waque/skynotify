/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Footer from "@/components/footer"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy policy changes | SkyNotify",
  robots: "none",
}

export default function Page() {
  return (
    <>
      <main className="flex grow flex-col gap-4">
        <h1 className="text-2xl">Privacy Policy Changes</h1>
        <div className="flex grow flex-col gap-1">
          <h3 className="text-xl">2024-11-25</h3>
          <ul className="list-inside list-disc">
            <li>
              Clarify that Google Firebase stores anonymous analytics consisting
              of the amount and types of notifications sent.
            </li>
            <li>
              Clarify that the amount and types of notifications sent is stored
              locally.
            </li>
          </ul>
        </div>
      </main>
      <Footer></Footer>
    </>
  )
}

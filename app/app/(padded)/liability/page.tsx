/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Footer from "@/components/footer"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Liability disclaimer | SkyNotify",
  robots: "none",
}

export default function Page() {
  return (
    <>
      <main className="flex grow flex-col gap-1">
        <h1 className="text-2xl">Liability Disclaimer</h1>
        <p>
          This service is provided without warranty of any kind. I am not liable
          for any claim, damages or other liability caused by this service,
          whether directly or indirectly.
        </p>
        <p>
          Furthermore, I am providing this service for free, at no expense to
          the user, on a reasonable-effort basis. No rights can be derived from
          this service.
        </p>
      </main>
      <Footer></Footer>
    </>
  )
}

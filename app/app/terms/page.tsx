/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Footer from "@/components/footer"
import Link from "next/link"

export default function Page() {
  return (
    <>
      <header>
        <h1 className="text-3xl">Bsky Post Notifications</h1>
      </header>
      <main className="flex grow flex-col gap-4">
        <h2 className="text-2xl">Terms of Use</h2>
        <p>
          By using this service, you agree to the Terms of Use as described on
          this page, and the{" "}
          <Link
            href="privacy"
            className="text-blue-500 underline transition-opacity hover:opacity-75"
          >
            Privacy Policy
          </Link>
          . These terms can change at any time without notification. If the
          privacy policy changes, an effort will be made to notify all users of
          this service.
        </p>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl">Service provision</h3>
          <p>
            This service is currently provided for free, and I have no
            obligation to provide this service. Furthermore, I reserve the right
            to cut off access to this service for specific users for any reason,
            or to provide users with special access to this service to meet
            their specific needs.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl">Liability</h3>
          <p>
            This service is provided without warranty of any kind. I am not
            liable for any claim, damages or other liability caused by this
            service, whether directly or indirectly.
          </p>
        </div>
      </main>
      <Footer></Footer>
    </>
  )
}

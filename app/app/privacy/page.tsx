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
        <h2 className="text-2xl">Privacy Policy</h2>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl">Data processing</h3>
          <p>
            When this service is interacted with, data is sent through
            Cloudflare&apos;s network before arriving at the origin server. As
            such, the{" "}
            <Link
              className="text-blue-500 underline transition-opacity hover:opacity-75"
              href="https://www.cloudflare.com/privacypolicy/"
            >
              Cloudflare Privacy Policy
            </Link>{" "}
            applies. For an overview of the data processed by Cloudflare, please
            refer to the &quot;Network&quot; tab in the browser&apos;s Developer
            tools.
          </p>
          <p>
            To provide this service, some data is processed by Google to enable
            the sending and receiving of push notifications. As such, the{" "}
            <Link
              className="text-blue-500 underline transition-opacity hover:opacity-75"
              href="https://firebase.google.com/support/privacy"
            >
              Privacy and Security in Firebase
            </Link>{" "}
            document applies.
          </p>
          <p>
            Additionally, any data that the user enters, or any data that the
            user generates as a result of their interaction with this service,
            may be further processed on the origin server.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl">Data storage</h3>
          <p>
            To provide this service, the user&apos;s data needs to be stored.
            This data consists of Firebase Cloud Messaging tokens, Bluesky
            account identifiers, and Boolean values indiciating the notification
            preferences. This data is anonymous, and cannot be traced back to
            any individual user.
          </p>
          <p>
            Additionally, your data might also be stored by third parties. For
            more information, please refer to the{" "}
            <Link
              className="text-blue-500 underline transition-opacity hover:opacity-75"
              href="https://www.cloudflare.com/privacypolicy/"
            >
              Cloudflare Privacy Policy
            </Link>{" "}
            and the{" "}
            <Link
              className="text-blue-500 underline transition-opacity hover:opacity-75"
              href="https://firebase.google.com/support/privacy"
            >
              Privacy and Security in Firebase
            </Link>{" "}
            document.
          </p>
        </div>
      </main>
      <Footer></Footer>
    </>
  )
}

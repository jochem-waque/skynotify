/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Footer from "@/components/footer"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy | SkyNotify",
  robots: "none",
}

export default function Page() {
  return (
    <>
      <main className="flex grow flex-col gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl">Privacy Policy</h1>
          <span className="text-sm opacity-50">
            Last updated:{" "}
            <Link className="underline" href="privacy/changes">
              2024-11-25
            </Link>
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl">Cookies and local data storage</h3>
          <p>
            To provide this service, the use of cookies and other forms of local
            browser storage is required, henceforth collectively referred to as
            &quot;cookies&quot;. Cookies are only used to store the user&apos;s
            notification settings, to enable the receiving of push notifications
            in the background, and to cache parts of the website to improve the
            website&apos;s responsiveness.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl">Third party data processing and storage</h3>
          <p>
            To help secure this service, users of this service, and the operator
            of this service, data is sent through Cloudflare&apos;s network
            before arriving at the origin server. As such, the{" "}
            <Link
              className="text-blue-500 underline transition-opacity hover:opacity-75"
              href="https://www.cloudflare.com/privacypolicy/"
            >
              Cloudflare Privacy Policy
            </Link>{" "}
            applies. This data might be transferred, stored or processed outside
            of the EU.
          </p>
          <p>
            To enable the receiving of push notifications, the Firebase
            installation ID is processed and stored by Google Firebase, as
            listed on the{" "}
            <Link
              className="text-blue-500 underline transition-opacity hover:opacity-75"
              href="https://firebase.google.com/support/privacy"
            >
              Privacy and Security in Firebase
            </Link>{" "}
            page. This data might be transferred, stored or processed outside of
            the EU, and is automatically deleted when the app is no longer
            installed for a prolonged time.
          </p>
          <p>
            Furthermore, the total amount and types of notifications sent on a
            day is stored by Google Firebase as part of the Firebase Cloud
            Messaging analytics. This data is anonymous, and might be
            transferred, stored or processed outside of the EU.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl">Data processing and storage</h3>
          <p>
            Any data that the user enters, or any data that the user generates
            as a result of their interaction with this service, may be further
            processed on the origin server. This data is processed in the EU.
          </p>
          <p>
            To provide this service, a portion of the user&apos;s data needs to
            be stored remotely. This data consists of Google Firebase Cloud
            Messaging tokens, Bluesky account identifiers, and Boolean values
            indicating notification preferences. Users are distinguished and
            addressed solely by their Firebase Cloud Messaging token, which is
            insufficient to identify a person. This data is stored in the EU,
            and automatically deleted when the app is uninstalled and the
            Firebase Cloud Messaging token is unreachable.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl">Logging and analytics</h3>
          <p>
            To protect the service from abuse, some data may be logged and
            stored for a prolonged time by Cloudflare. This data might be
            transferred, stored or processed outside of the EU. Additionally,
            some error logs might be temporarily stored on the origin server to
            help diagnose issues. This data is stored in the EU. Neither the
            logs stored by Cloudflare, nor the logs stored on the origin server
            can be used to identify a person.
          </p>
          <p>
            To monitor performance, with the goal of improving the performance
            and user experience of the application, some data related to the
            speed at which the website loads is stored or processed by
            Cloudflare. This data might be transferred, stored or processed
            outside of the EU.
          </p>
          <p>
            To monitor the operation of the backend, the amount and types of
            notifications are stored and retained indefinitely. This data is
            anonymous, and stored and processed in the EU.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl">The user&apos;s rights</h3>
          <p>
            The user is allowed to exercise any legal right from their current
            jurisdiction. Additionally, the user is allowed to exercise any
            right under the GDPR, regardless of their jurisdiction.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl">Contact</h3>
          <p>
            If the user has any questions, or would like to exercise their
            rights, they can contact the administrators of the service using the
            email address at the bottom of the page.
          </p>
        </div>
      </main>
      <Footer></Footer>
    </>
  )
}

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Footer from "@/components/footer"
import Header from "@/components/header"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy | SkyNotify",
}

export default function Page() {
  return (
    <>
      <Header></Header>
      <main className="flex grow flex-col gap-4">
        <h2 className="text-2xl">Privacy Policy</h2>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl">Cookies and local data storage</h3>
          <p>
            To provide this service, the use of cookies and other forms of local
            browser storage is required, henceforth collectively referred to as
            &quot;cookies&quot;. Cookies are used exclusively for the provision
            of this service, and are not used for any other purposes, such as
            tracking. Cookies are exclusively placed by this service, and not by
            any third party.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl">Data processing</h3>
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
            applies. For an overview of the data processed by Cloudflare, please
            refer to the &quot;Network&quot; tab in the browser&apos;s Developer
            tools. This data may also be used to monitor the performance of this
            service, with the intention of improving performance.
          </p>
          <p>
            To enable the sending and receiving of push notifications, some user
            data is processed by Google Firebase.
          </p>
          <p>
            Additionally, any data that the user enters, or any data that the
            user generates as a result of their interaction with this service,
            may be further processed on the origin server. This data is
            currently processed in Germany.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl">Remote data storage</h3>
          <p>
            To provide this service, the user&apos;s data needs to be stored
            remotely. This data consists of Google Firebase Cloud Messaging
            tokens, Bluesky account identifiers, and Boolean values indicating
            notification preferences. This data is anonymous, and cannot be
            traced back to any individual user. This data is currently stored in
            Germany.
          </p>
          <p>
            Additionally, the user&apos;s data might also be stored by third
            parties. For more information, please refer to the{" "}
            <Link
              className="text-blue-500 underline transition-opacity hover:opacity-75"
              href="https://www.cloudflare.com/privacypolicy/"
            >
              Cloudflare Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl">Personal data</h3>
          <p>
            This service only makes use of personal data, such as IP addresses,
            when it is necessary for the operation and security of the service.
            This data is automatically processed and stored by Cloudflare. For
            more information, please refer to the{" "}
            <Link
              className="text-blue-500 underline transition-opacity hover:opacity-75"
              href="https://www.cloudflare.com/privacypolicy/"
            >
              Cloudflare Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer></Footer>
    </>
  )
}

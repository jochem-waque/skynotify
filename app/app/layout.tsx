/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import LoadConfig from "@/components/loadConfig"
import OpenBackgroundNotifications from "@/components/openBackgroundNotifications"
import UpdateToken from "@/components/updateToken"
import { Metadata, Viewport } from "next"
import { Noto_Sans, Noto_Sans_Mono } from "next/font/google"
import Head from "next/head"
import "./globals.css"

const font = Noto_Sans({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
})

const mono = Noto_Sans_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  keywords: ["#nobridge", "bluesky", "notifications", "push", "posts"],
  description:
    "Web app that provides real-time background push notifications for Bluesky posts",
  applicationName: "SkyNotify",
  robots: "nofollow",
  openGraph: {
    type: "website",
    siteName: "SkyNotify",
    title: "SkyNotify",
    description:
      "Web app that provides real-time background push notifications for Bluesky posts",
    images: "/icon-192x192.png",
    url: `https://${process.env.NEXT_PUBLIC_HOSTNAME}`,
  },
  twitter: {
    card: "summary",
    title: "SkyNotify",
    description:
      "Web app that provides real-time background push notifications for Bluesky posts",
    images: "/icon-192x192.png",
  },
  metadataBase: new URL(`https://${process.env.NEXT_PUBLIC_HOSTNAME}/`),
}

export const viewport: Viewport = { interactiveWidget: "resizes-content" }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${font.variable} ${mono.variable} font-sans`}>
      <Head>
        <script key="website-data" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "SkyNotify",
            url: "https://${process.env.NEXT_PUBLIC_HOSTNAME}/",
          })}
        </script>
      </Head>
      <body className="mx-auto flex min-h-[100svh] flex-col items-center p-4">
        <div className="container relative flex max-w-xl grow flex-col gap-4">
          {children}
        </div>
        <OpenBackgroundNotifications></OpenBackgroundNotifications>
        <LoadConfig></LoadConfig>
        <UpdateToken></UpdateToken>
      </body>
    </html>
  )
}

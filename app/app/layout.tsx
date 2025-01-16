/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import OpenBackgroundNotifications from "@/components/openBackgroundNotifications"
import UpdateToken from "@/components/updateToken"
import { Metadata, Viewport } from "next"
import { Noto_Sans, Noto_Sans_Mono } from "next/font/google"
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
    url: `./`,
  },
  alternates: { canonical: "./" },
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
      <head>
        {process.env.NODE_ENV === "development" && (
          <script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            async
          ></script>
        )}
        <script
          key="website-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "SkyNotify",
              url: `https://${process.env.NEXT_PUBLIC_HOSTNAME}/`,
            }),
          }}
        ></script>
      </head>
      <body>
        <div className="relative flex min-h-[100svh] w-full grow flex-col">
          {children}
        </div>
        <OpenBackgroundNotifications></OpenBackgroundNotifications>
        <UpdateToken></UpdateToken>
      </body>
    </html>
  )
}

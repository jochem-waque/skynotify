/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import "./globals.css"
import LoadConfig from "@/components/loadConfig"
import OpenBackgroundNotifications from "@/components/openBackgroundNotifications"
import { Metadata, Viewport } from "next"
import { Noto_Sans, Noto_Sans_Mono } from "next/font/google"

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

// TODO re-evaluate
export const viewport: Viewport = { interactiveWidget: "resizes-content" }

export const metadata: Metadata = {
  keywords: ["#nobridge"],
  description:
    "Web app that provides real-time background push notifications for Bluesky posts",
  openGraph: {
    title: "SkyNotify",
    description:
      "Web app that provides real-time background push notifications for Bluesky posts",
    images: "/icon-192x192.png",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${font.variable} ${mono.variable} font-sans`}>
      <body className="mx-auto flex min-h-[100svh] flex-col items-center p-4">
        <div className="container relative flex max-w-xl grow flex-col gap-4">
          {children}
        </div>
        <OpenBackgroundNotifications></OpenBackgroundNotifications>
        <LoadConfig></LoadConfig>
      </body>
    </html>
  )
}

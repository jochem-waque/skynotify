/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import "./globals.css"
import OpenBackgroundNotifications from "@/components/openBackgroundNotifications"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="flex h-[100svh] flex-col items-center p-4">
        <OpenBackgroundNotifications></OpenBackgroundNotifications>
        {children}
      </body>
    </html>
  )
}

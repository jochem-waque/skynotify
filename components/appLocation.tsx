/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { Platform } from "@/util/platform"

export default function AppLocation({ platform }: { platform: Platform }) {
  if (platform === "firefox" || platform === "unknown") {
    return
  }

  const options = []
  if (platform === "android" || platform === "ios") {
    options.push("on your home screen")
  }

  if (platform === "desktop-chromium" || platform === "macos-safari") {
    options.push("on your desktop")
  }

  if (platform !== "ios") {
    options.push("in the list of installed apps")
  }

  const last = options.pop() as string
  return (
    <span>
      To skip this page, open the app using the icon{" "}
      {options.length > 0 ? options.join(", ") + ` or ${last}` : last}
    </span>
  )
}

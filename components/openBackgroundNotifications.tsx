/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useEffect } from "react"

export default function OpenBackgroundNotifications() {
  useEffect(() => {
    function listener(event: MessageEvent) {
      if (event.data.messageType === "notification-clicked") {
        window.location.href = event.data.notification.click_action
      }
    }

    navigator.serviceWorker.addEventListener("message", listener)
    return () => {
      navigator.serviceWorker.removeEventListener("message", listener)
    }
  }, [])

  return null
}

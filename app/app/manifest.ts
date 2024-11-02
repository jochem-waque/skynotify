/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bsky Post Notifications",
    short_name: "Bsky Notifs",
    description: "A Progressive Web App for Bluesky post notifications",
    id: "/",
    scope: "/",
    start_url: "/", // TODO
    display: "standalone",
    orientation: "natural",
    launch_handler: {
      client_mode: "navigate-existing",
    },
    theme_color: "#1185fe",
    background_color: "#bfbfbf",
    prefer_related_applications: false,
    related_applications: [
      {
        platform: "webapp",
        url: `https://${process.env.NEXT_PUBLIC_HOSTNAME}/manifest.webmanifest`,
      },
    ],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-720x1280.png",
        sizes: "720x1280",
        form_factor: "narrow",
      },
      {
        src: "/screenshot-1280x720.png",
        sizes: "1280x720",
        form_factor: "wide",
      },
    ],
  }
}

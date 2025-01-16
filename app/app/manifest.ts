/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SkyNotify",
    short_name: "SkyNotify",
    description: "A Progressive Web App for Bluesky post notifications",
    id: "/",
    scope: "/",
    start_url: "/home",
    display: "standalone",
    orientation: "natural",
    launch_handler: {
      client_mode: "navigate-existing",
    },
    theme_color: "#60a5fa",
    background_color: "#ffffff",
    prefer_related_applications: false,
    related_applications: [
      {
        platform: "webapp",
        url: `https://${process.env.NEXT_PUBLIC_HOSTNAME}/manifest.webmanifest`,
      },
    ],
    protocol_handlers: [
      {
        protocol: "web+skynotify",
        url: "/link/url=%s",
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
        src: "/narrow/landing.png",
        sizes: "1442x3202",
        form_factor: "narrow",
      },
      // Only 5 screenshots are displayed, add dark landing
      {
        src: "/narrow/landing_dark.png",
        sizes: "1442x3202",
        form_factor: "narrow",
      },
      {
        src: "/narrow/import.png",
        sizes: "1442x3202",
        form_factor: "narrow",
      },
      {
        src: "/narrow/specify.png",
        sizes: "1442x3202",
        form_factor: "narrow",
      },
      {
        src: "/narrow/overview.png",
        sizes: "1442x3202",
        form_factor: "narrow",
      },
      {
        src: "/wide/landing.png",
        sizes: "2560x1440",
        form_factor: "wide",
      },
      {
        src: "/wide/import.png",
        sizes: "2560x1440",
        form_factor: "wide",
      },
      {
        src: "/wide/specify.png",
        sizes: "2560x1440",
        form_factor: "wide",
      },
      {
        src: "/wide/overview.png",
        sizes: "2560x1440",
        form_factor: "wide",
      },
      {
        src: "/wide/landing_dark.png",
        sizes: "2560x1440",
        form_factor: "wide",
      },
      {
        src: "/wide/import_dark.png",
        sizes: "2560x1440",
        form_factor: "wide",
      },
      {
        src: "/wide/specify_dark.png",
        sizes: "2560x1440",
        form_factor: "wide",
      },
      {
        src: "/wide/overview_dark.png",
        sizes: "2560x1440",
        form_factor: "wide",
      },
    ],
  }
}

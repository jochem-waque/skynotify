/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Variables from "@/util/variables";
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bluesky Post Notifications",
    short_name: "BPN",
    description: "A Progressive Web App for Bluesky post notifications",
    id: "/",
    start_url: "/app",
    display: "standalone",
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
        // @ts-expect-error Types are outdated
        form_factor: "narrow",
      },
      {
        src: "/screenshot-1280x720.png",
        sizes: "1280x720",
        // @ts-expect-error Types are outdated
        form_factor: "wide",
      },
    ],
    theme_color: "#1185fe",
    background_color: "#bfbfbf",
    related_applications: [
      {
        platform: "webapp",
        url: `https://${Variables.hostname}/manifest.webmanifest`,
      },
    ],
    scope: "/",
    orientation: "natural",
  };
}

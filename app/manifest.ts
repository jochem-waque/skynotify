/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BlueSky Post Notifications",
    short_name: "BSPN",
    description: "A Progressive Web App for BlueSky post notifications",
    id: "/",
    start_url: "/",
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
  };
}

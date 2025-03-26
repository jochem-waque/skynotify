/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import withSerwistInit from "@serwist/next"

const withSerwist = withSerwistInit({
  swSrc: "app/sw/sw.ts",
  swDest: "public/sw.js",
})

export default withSerwist({
  images: {
    remotePatterns: [{ hostname: "cdn.bsky.app", protocol: "https" }],
  },
})

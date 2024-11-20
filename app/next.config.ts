/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import withSerwistInit from "@serwist/next"

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
})

const csp = [
  "default-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",

  "script-src-attr 'none'",
  "script-src-elem 'self' 'unsafe-inline'",
  process.env.NODE_ENV !== "production"
    ? "script-src 'unsafe-eval'"
    : "script-src 'none'",

  "style-src-attr 'unsafe-inline'",
  process.env.NODE_ENV !== "production"
    ? "style-src-elem 'self' 'unsafe-inline'"
    : "style-src-elem 'self'",
  "style-src 'none'",

  "manifest-src 'self'",
  "font-src 'self'",
  "worker-src 'self'",
  "connect-src 'self' https://public.api.bsky.app https://cdn.bsky.app https://firebaseinstallations.googleapis.com https://fcmregistrations.googleapis.com",
  "img-src 'self' https://cdn.bsky.app",

  "upgrade-insecure-requests",

  "report-to csp-endpoint",
  // TODO "sandbox allow-same-origin allow-scripts",
].join("; ")

export default withSerwist({
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Referer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
          { key: "Content-Security-Policy", value: csp },
          {
            key: "Reporting-Endpoints",
            value: `Reporting-Endpoints: csp-endpoint="https://${process.env.NEXT_PUBLIC_HOSTNAME}/csp"`,
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [{ hostname: "cdn.bsky.app", protocol: "https" }],
  },
})

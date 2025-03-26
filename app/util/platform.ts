/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
export type OS = "windows" | "macos" | "ios" | "android" | "desktop" | "mobile"
export type Browser = "chromium" | "firefox" | "safari" | "unknown"
export type Platform =
  | "android"
  | "desktop-chromium"
  | "macos-safari"
  | "ios"
  | "unknown"
  | "firefox"

export function simplifyPlatform(platform: `${OS}-${Browser}`): Platform {
  switch (platform) {
    // Any Android Chrome
    case "android-chromium":
    case "mobile-chromium":
      return "android"

    // Any non-mobile Chrome
    case "desktop-chromium":
    case "windows-chromium":
    case "macos-chromium":
      return "desktop-chromium"

    // Non-mobile Safari, assume MacOS
    case "desktop-safari":
    case "macos-safari":
      return "macos-safari"

    // iOS or mobile Safari
    case "mobile-safari":
    case "ios-chromium":
    case "ios-safari":
      return "ios"

    // Unknown or impossible combinations
    case "windows-unknown":
    case "macos-unknown":
    case "android-unknown":
    case "desktop-unknown":
    case "mobile-unknown":
    case "ios-unknown":
    case "android-safari":
    case "windows-safari":
      return "unknown"

    // Any Firefox
    case "windows-firefox":
    case "macos-firefox":
    case "ios-firefox":
    case "android-firefox":
    case "desktop-firefox":
    case "mobile-firefox":
      return "firefox"
  }
}

/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import firebaseApp from "@/firebase";
import { defaultCache } from "@serwist/next/worker";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

self.addEventListener("notificationclick", (event) => {
  const url = new URL(
    event.notification.data.FCM_MSG.notification.click_action
  );
  if (url.hostname === self.location.hostname) {
    return;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  self.clients.openWindow(
    userAgent.includes("android")
      ? `intent:/${url.pathname}#Intent;scheme=bluesky;package=xyz.blueskyweb.app;S.browser_fallback_url=${url};end`
      : url
  );
});

const messaging = getMessaging(firebaseApp);
onBackgroundMessage(messaging, console.log);

serwist.addEventListeners();

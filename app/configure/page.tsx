/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client";

import FirebaseApp from "@/util/firebase";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useState, useEffect } from "react";

function Subscribe() {
  const [isSupported, setIsSupported] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    async function registerServiceWorker() {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        subscribeToPush(registration);
      }
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  if (!isSupported) {
    return null;
  }

  if (token) {
    return <code>{token}</code>;
  }

  async function subscribeToPush(registration?: ServiceWorkerRegistration) {
    registration = await navigator.serviceWorker.getRegistration();

    const messaging = getMessaging(FirebaseApp);
    onMessage(messaging, (payload) => {
      console.log(payload);
      if (!payload.fcmOptions?.link) {
        return;
      }

      window.open(payload.fcmOptions.link);
    });

    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey:
        "BL5X3aTsXTsiij2gjvsbVYCEKirzRaAaJ6ipnlI63PxaOCXbMDDb-KZ5_pQEPHZnORGct6aYYjgQc-cxrhm4D-c",
    });
    setToken(token);
  }

  return (
    <button onClick={() => subscribeToPush()}>
      Subscribe to push notifications
    </button>
  );
}

export default function Page() {
  return (
    <>
      <Subscribe></Subscribe>
    </>
  );
}

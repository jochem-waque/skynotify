/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client";

import firebaseApp from "@/firebase";
import { getMessaging, getToken } from "firebase/messaging";
import { useEffect, useState } from "react";

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone) {
    return null;
  }

  return (
    <div>
      <h3>Install App</h3>
      <button>Add to Home Screen</button>
      {isIOS && (
        <p>
          To install this app on your iOS device, tap the share button
          <span role="img" aria-label="share icon">
            {" "}
            ⎋{" "}
          </span>
          and then %quot;Add to Home Screen%quot;
          <span role="img" aria-label="plus icon">
            {" "}
            ➕{" "}
          </span>
          .
        </p>
      )}
    </div>
  );
}

function Subscribe() {
  const [isSupported, setIsSupported] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  if (!isSupported) {
    return null;
  }

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    if (sub) {
      subscribeToPush(registration);
    }
  }

  if (token) {
    console.log(token);
    return null;
  }

  async function subscribeToPush(registration?: ServiceWorkerRegistration) {
    registration = await navigator.serviceWorker.getRegistration();

    const messaging = getMessaging(firebaseApp);
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
      <InstallPrompt></InstallPrompt>
      <Subscribe></Subscribe>
    </>
  );
}

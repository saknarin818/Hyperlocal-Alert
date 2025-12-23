// src/pushNotifications.ts
import { messaging, db } from "./firebase"; // Adjust path if needed
import { getToken, onMessage } from "firebase/messaging";
import { doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";

const VAPID_KEY = "BIYi3H95nrSpdpGyNcwmvxyV5k3opxt6a_mR94aleJW-_upDQEaCeAhzwtYOGABnMxP2Wt7gZoohfiyomwOSzyo"; // Use your actual VAPID key here!

export async function registerForPush(): Promise<string | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Worker not supported by this browser.");
    throw new Error("Service Worker not supported");
  }

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("Service Worker registered.", registration);

    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
    if (currentToken) {
      console.log("FCM registration token:", currentToken);
      await setDoc(doc(db, "fcmTokens", currentToken), {
        token: currentToken,
        createdAt: serverTimestamp()
      }, { merge: true }); // Use merge: true to avoid overwriting existing data if token is already there
      return currentToken;
    } else {
      console.log("No FCM registration token available. Requesting permission...");
      // Permission might be denied or not requested yet
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const newToken = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
        if (newToken) {
          await setDoc(doc(db, "fcmTokens", newToken), {
            token: newToken,
            createdAt: serverTimestamp()
          }, { merge: true });
          return newToken;
        }
      }
      return null;
    }
  } catch (err) {
    console.error("Error getting token or registering SW:", err);
    throw err;
  }
}

export async function unregisterToken(token: string) {
  try {
    await deleteDoc(doc(db, "fcmTokens", token));
    console.log("FCM token unregistered from Firestore:", token);
  } catch (err) {
    console.error("Error unregistering token:", err);
    throw err;
  }
}

export function onForegroundMessage(handler: (payload: any) => void) {
  onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    handler(payload);
  });
}
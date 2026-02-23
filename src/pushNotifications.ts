// src/pushNotifications.ts

import { messaging, db, auth } from "./firebase";
import { getToken, onMessage } from "firebase/messaging";
import {
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

const VAPID_KEY =
  "BIYi3H95nrSpdpGyNcwmvxyV5k3opxt6a_mR94aleJW-_upDQEaCeAhzwtYOGABnMxP2Wt7gZoohfiyomwOSzyo";

export async function registerForPush(): Promise<string | null> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker not supported");
  }

  if (!auth.currentUser) {
    throw new Error("User not logged in");
  }

  if (!messaging) {
    throw new Error("Messaging not supported in this browser");
  }

  try {
    // ลงทะเบียน Service Worker
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    // ขอ permission ก่อน
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return null;
    }

    // ขอ token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) return null;

    // 🔥 ผูก token กับ user
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      fcmTokens: arrayUnion(token),
      updatedAt: serverTimestamp()
    });

    return token;
  } catch (err) {
    console.error("Error registering push:", err);
    throw err;
  }
}

export async function unregisterToken(token: string) {
  if (!auth.currentUser) return;

  try {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      fcmTokens: arrayRemove(token)
    });
  } catch (err) {
    console.error("Error removing token:", err);
    throw err;
  }
}

export function onForegroundMessage(handler: (payload: any) => void) {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log("Foreground message:", payload);
    handler(payload);
  });
}
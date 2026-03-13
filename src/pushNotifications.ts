// src/pushNotifications.ts

import { messaging, db, auth } from "./firebase";
import { getToken, onMessage, MessagePayload } from "firebase/messaging";
import {
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDoc
} from "firebase/firestore";

const VAPID_KEY = process.env.REACT_APP_VAPID_KEY || "";
const TOKEN_REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 วัน
let tokenRefreshTimeout: NodeJS.Timeout | null = null;

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

  if (!VAPID_KEY) {
    throw new Error("VAPID_KEY not configured");
  }

  let retries = 3;
  while (retries > 0) {
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
        updatedAt: serverTimestamp(),
        tokenExpiresAt: serverTimestamp()
      });

      // Set up automatic token refresh
      setUpTokenRefresh();

      console.log("✅ Push registration successful:", token);
      return token;
    } catch (err) {
      retries--;
      console.error(`Error registering push (retries left: ${retries}):`, err);

      if (retries > 0) {
        // รอ 2 วินาที ก่อนลอง
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw err;
      }
    }
  }

  return null;
}

/**
 * 🔄 ตั้งค่า Automatic Token Refresh
 */
function setUpTokenRefresh() {
  if (tokenRefreshTimeout) {
    clearTimeout(tokenRefreshTimeout);
  }

  tokenRefreshTimeout = setTimeout(async () => {
    try {
      if (auth.currentUser && messaging) {
        console.log("🔄 Refreshing FCM token...");
        const registration = await navigator.serviceWorker.ready;

        const newToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration as ServiceWorkerRegistration
        });

        if (newToken) {
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            fcmTokens: arrayUnion(newToken),
            tokenExpiresAt: serverTimestamp()
          });

          console.log("✅ Token refreshed successfully");
          setUpTokenRefresh(); // ตั้งค่า refresh ใหม่
        }
      }
    } catch (err) {
      console.error("Error refreshing token:", err);
      // ลองใหม่ใน 1 ชั่วโมง
      tokenRefreshTimeout = setTimeout(setUpTokenRefresh, 60 * 60 * 1000);
    }
  }, TOKEN_REFRESH_INTERVAL);
}

/**
 * 🔴 ลบ token เฉพาะตัว
 */
export async function unregisterToken(token: string) {
  if (!auth.currentUser) return;

  try {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      fcmTokens: arrayRemove(token)
    });
    console.log("✅ Token removed:", token);
  } catch (err) {
    console.error("Error removing token:", err);
    throw err;
  }
}

/**
 * 🔴 ลบ token ทั้งหมดของ user (ใช้ตอนซื่อ logout)
 */
export async function unregisterAllTokens() {
  if (!auth.currentUser) return;

  if (tokenRefreshTimeout) {
    clearTimeout(tokenRefreshTimeout);
  }

  try {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const tokens = userSnap.data()?.fcmTokens || [];

      // ลบทีละตัว
      for (const token of tokens) {
        await updateDoc(userRef, {
          fcmTokens: arrayRemove(token)
        });
      }

      console.log("✅ All tokens removed");
    }
  } catch (err) {
    console.error("Error removing all tokens:", err);
    throw err;
  }
}

/**
 * 🔔 ฟังข้อความเมื่อแอปเปิดอยู่ (Foreground)
 */
export function onForegroundMessage(handler: (payload: MessagePayload) => void) {
  if (!messaging) {
    return () => {}; // Return empty unsubscribe function if messaging not available
  }

  return onMessage(messaging, (payload) => {
    console.log("Foreground message:", payload);
    handler(payload);
  });
}
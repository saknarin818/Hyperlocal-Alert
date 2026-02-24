import {setGlobalOptions} from "firebase-functions/v2";
import {onRequest} from "firebase-functions/v2/https";
import {onDocumentUpdated, onDocumentCreated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();
setGlobalOptions({maxInstances: 10});

// ==============================================================
// 1. แจ้งเตือน "ทุกคน" เมื่อมีเหตุการณ์ใหม่ (Create)
// ==============================================================
export const notifyonnewincident = onDocumentCreated("incidents/{incidentId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const incidentData = snapshot.data();
  const usersSnapshot = await admin.firestore().collection("users").get();
  
  const tokens: string[] = [];
  const tokenToUserId: Record<string, string> = {};

  usersSnapshot.forEach((doc) => {
    const userData = doc.data();
    if (userData.fcmTokens && Array.isArray(userData.fcmTokens)) {
      userData.fcmTokens.forEach((token: string) => {
        tokens.push(token);
        tokenToUserId[token] = doc.id;
      });
    }
  });

  if (tokens.length === 0) return;

  const multicastMessage: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: "🚨 มีการแจ้งเหตุการณ์ใหม่ในพื้นที่!",
      body: `ประเภท: ${incidentData.type || "ไม่ระบุ"} - สถานที่: ${incidentData.location || "ไม่ระบุ"}`,
    },
    webpush: {
      notification: { icon: "https://hyperlocal-alert.web.app/LOGO_CAS.png" },
      fcmOptions: { link: "https://hyperlocal-alert.web.app/event" },
    },
  };

  const response = await admin.messaging().sendEachForMulticast(multicastMessage);

  // ลบ Token ที่พัง
  const tokensToRemove: Promise<any>[] = [];
  response.responses.forEach((result, index) => {
    if (result.error && (result.error.code === "messaging/invalid-registration-token" || result.error.code === "messaging/registration-token-not-registered")) {
      const userId = tokenToUserId[tokens[index]];
      if (userId) {
        tokensToRemove.push(
          admin.firestore().collection("users").doc(userId).update({
            fcmTokens: admin.firestore.FieldValue.arrayRemove(tokens[index])
          })
        );
      }
    }
  });
  await Promise.all(tokensToRemove);
});

// ==============================================================
// 2. แจ้งเตือน "รายบุคคล" เมื่อเหตุการณ์อัปเดตสถานะเป็นเสร็จสิ้น (Update)
// ==============================================================
export const notifyonincidentapproval = onDocumentUpdated("incidents/{incidentId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const newData = snapshot.after.data();
  const oldData = snapshot.before.data();

  if (newData.status !== "เสร็จสิ้น" || oldData.status === "เสร็จสิ้น") return;

  const targetUserId = newData.userId;
  if (!targetUserId) return; // ถ้าไม่มี UID ข้ามการส่ง

  const userDoc = await admin.firestore().collection("users").doc(targetUserId).get();
  if (!userDoc.exists) return;

  const userData = userDoc.data();
  const tokens: string[] = userData?.fcmTokens || [];

  if (tokens.length === 0) return;

  const multicastMessage: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: "✅ เหตุการณ์ของคุณดำเนินการเสร็จสิ้นแล้ว!",
      body: `ประเภท: ${newData.type || "ไม่ระบุ"} - ${String(newData.description || "").slice(0, 100)}...`,
    },
    webpush: {
      notification: { icon: "https://hyperlocal-alert.web.app/LOGO_CAS.png" },
      fcmOptions: { link: "https://hyperlocal-alert.web.app/event" },
    },
  };

  const response = await admin.messaging().sendEachForMulticast(multicastMessage);

  const tokensToRemove: Promise<any>[] = [];
  response.responses.forEach((result, index) => {
    if (result.error && (result.error.code === "messaging/invalid-registration-token" || result.error.code === "messaging/registration-token-not-registered")) {
      tokensToRemove.push(
        admin.firestore().collection("users").doc(targetUserId).update({
          fcmTokens: admin.firestore.FieldValue.arrayRemove(tokens[index])
        })
      );
    }
  });
  await Promise.all(tokensToRemove);
});
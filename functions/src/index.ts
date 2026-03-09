import {setGlobalOptions} from "firebase-functions/v2";
import {onRequest} from "firebase-functions/v2/https";
import {onDocumentUpdated, onDocumentCreated} from "firebase-functions/v2/firestore";
// import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();
setGlobalOptions({maxInstances: 10});

// ==============================================================
// 1. แจ้งเตือนเมื่อมีเหตุการณ์ใหม่ (Create) แบบแยกข้อความ
// ==============================================================
export const notifyonnewincident = onDocumentCreated("incidents/{incidentId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const incidentData = snapshot.data();
  const reporterId = incidentData.userId; // รับค่า UID ของคนแจ้งเหตุ

  const usersSnapshot = await admin.firestore().collection("users").get();
  
  const reporterTokens: string[] = []; // Token ของคนแจ้งเหตุ
  const otherTokens: string[] = [];    // Token ของคนอื่นๆ ในระบบ
  const tokenToUserId: Record<string, string> = {};

  usersSnapshot.forEach((doc) => {
    const userData = doc.data();
    const userId = doc.id;
    
    if (userData.fcmTokens && Array.isArray(userData.fcmTokens)) {
      userData.fcmTokens.forEach((token: string) => {
        // แยก Token ตาม UID
        if (userId === reporterId) {
          reporterTokens.push(token);
        } else {
          otherTokens.push(token);
        }
        tokenToUserId[token] = userId;
      });
    }
  });

  const tokensToRemove: Promise<any>[] = [];

  // ฟังก์ชันย่อยสำหรับเช็กและลบ Token ที่ตายแล้ว
  const handleTokenCleanup = (response: admin.messaging.BatchResponse, usedTokens: string[]) => {
    response.responses.forEach((result, index) => {
      if (result.error && (result.error.code === "messaging/invalid-registration-token" || result.error.code === "messaging/registration-token-not-registered")) {
        const userId = tokenToUserId[usedTokens[index]];
        if (userId) {
          tokensToRemove.push(
            admin.firestore().collection("users").doc(userId).update({
              fcmTokens: admin.firestore.FieldValue.arrayRemove(usedTokens[index])
            })
          );
        }
      }
    });
  };

  // 1.1 ส่งแจ้งเตือนให้ "คนแจ้งเหตุ" (Reporter)
  if (reporterTokens.length > 0) {
    const reporterMessage: admin.messaging.MulticastMessage = {
      tokens: reporterTokens,
      notification: {
        title: "✅ ระบบได้รับแจ้งเหตุของคุณแล้ว!",
        body: `เหตุ ${incidentData.type || "ไม่ระบุ"} กำลังถูกส่งแจ้งเตือนไปยังคนในชุมชน`,
      },
      webpush: {
        notification: { icon: "https://hyperlocal-alert.web.app/LOGO_CAS.png" },
        fcmOptions: { link: "https://hyperlocal-alert.web.app/event" },
      },
    };
    const reporterResponse = await admin.messaging().sendEachForMulticast(reporterMessage);
    handleTokenCleanup(reporterResponse, reporterTokens);
  }

  // 1.2 ส่งแจ้งเตือนให้ "ผู้ใช้คนอื่นๆ" (Others)
  if (otherTokens.length > 0) {
    const othersMessage: admin.messaging.MulticastMessage = {
      tokens: otherTokens,
      notification: {
        title: "🚨 มีการแจ้งเหตุการณ์ใหม่ในพื้นที่!",
        body: `ประเภท: ${incidentData.type || "ไม่ระบุ"} - สถานที่: ${incidentData.location || "ไม่ระบุ"}`,
      },
      webpush: {
        notification: { icon: "https://hyperlocal-alert.web.app/LOGO_CAS.png" },
        fcmOptions: { link: "https://hyperlocal-alert.web.app/event" },
      },
    };
    const othersResponse = await admin.messaging().sendEachForMulticast(othersMessage);
    handleTokenCleanup(othersResponse, otherTokens);
  }

  // ลบ Token ที่พังออกจากฐานข้อมูลทีเดียว
  if (tokensToRemove.length > 0) {
    await Promise.all(tokensToRemove);
  }
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
      title: "✅ เหตุการณ์ของคุณอนุมัติแล้ว!",
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
// ==============================================================
// 3. 🔥 HTTPS Function: ส่ง Notification แบบ Manual (สำหรับ Admin)
// ==============================================================
export const sendNotification = onRequest(async (req, res) => {
  // ตรวจสอบ Authentication (ต้องเป็น Admin)
  const user = req.headers["authorization"];
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { userId, title, body, data } = req.body;
  
  if (!userId || !title || !body) {
    res.status(400).json({ error: "Missing required fields: userId, title, body" });
    return;
  }

  try {
    const userDoc = await admin.firestore().collection("users").doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userData = userDoc.data();
    const tokens: string[] = userData?.fcmTokens || [];

    if (tokens.length === 0) {
      res.status(400).json({ error: "User has no notification tokens" });
      return;
    }

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        sentAt: new Date().toISOString()
      },
      webpush: {
        notification: { icon: "https://hyperlocal-alert.web.app/LOGO_CAS.png" },
        fcmOptions: { link: "https://hyperlocal-alert.web.app/event" },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // บันทึกการส่ง
    await admin.firestore().collection("notifications").add({
      userId,
      title,
      body,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      successCount: response.successCount,
      failureCount: response.failureCount
    });

    // ลบ Token ที่พัง
    const tokensToRemove: Promise<any>[] = [];
    response.responses.forEach((result, index) => {
      if (result.error && (result.error.code === "messaging/invalid-registration-token" || result.error.code === "messaging/registration-token-not-registered")) {
        tokensToRemove.push(
          admin.firestore().collection("users").doc(userId).update({
            fcmTokens: admin.firestore.FieldValue.arrayRemove(tokens[index])
          })
        );
      }
    });
    await Promise.all(tokensToRemove);

    res.status(200).json({ 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount
    });
  } catch (err) {
    console.error("Error sending notification:", err);
    res.status(500).json({ error: String(err) });
  }
});

// ==============================================================
// 4. 🔥 HTTPS Function: ส่ง Notification ไปหลาย User (Broadcast)
// ==============================================================
export const broadcastNotification = onRequest(async (req, res) => {
  // ตรวจสอบ Authentication
  const user = req.headers["authorization"];
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { title, body, data, userIds } = req.body;
  
  if (!title || !body || !userIds || !Array.isArray(userIds)) {
    res.status(400).json({ error: "Missing required fields: title, body, userIds (array)" });
    return;
  }

  try {
    const allTokens: string[] = [];
    const tokenToUserId: Record<string, string> = {};

    // เก็บ tokens ทั้งหมดจาก users
    for (const userId of userIds) {
      const userDoc = await admin.firestore().collection("users").doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const tokens: string[] = userData?.fcmTokens || [];
        tokens.forEach(token => {
          allTokens.push(token);
          tokenToUserId[token] = userId;
        });
      }
    }

    if (allTokens.length === 0) {
      res.status(400).json({ error: "No notification tokens found for these users" });
      return;
    }

    const message: admin.messaging.MulticastMessage = {
      tokens: allTokens,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        sentAt: new Date().toISOString()
      },
      webpush: {
        notification: { icon: "https://hyperlocal-alert.web.app/LOGO_CAS.png" },
        fcmOptions: { link: "https://hyperlocal-alert.web.app/event" },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // บันทึกการส่ง
    await admin.firestore().collection("notifications").add({
      title,
      body,
      recipients: userIds,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      successCount: response.successCount,
      failureCount: response.failureCount
    });

    // ลบ Token ที่พัง
    const tokensToRemove: Promise<any>[] = [];
    response.responses.forEach((result, index) => {
      if (result.error && (result.error.code === "messaging/invalid-registration-token" || result.error.code === "messaging/registration-token-not-registered")) {
        const userId = tokenToUserId[allTokens[index]];
        if (userId) {
          tokensToRemove.push(
            admin.firestore().collection("users").doc(userId).update({
              fcmTokens: admin.firestore.FieldValue.arrayRemove(allTokens[index])
            })
          );
        }
      }
    });
    await Promise.all(tokensToRemove);

    res.status(200).json({ 
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    });
  } catch (err) {
    console.error("Error broadcasting notification:", err);
    res.status(500).json({ error: String(err) });
  }
});
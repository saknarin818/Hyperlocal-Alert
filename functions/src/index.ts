/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions/v2";
import {onRequest} from "firebase-functions/v2/https";
import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Set global options for functions
setGlobalOptions({maxInstances: 10});


/**
 * Triggered when an incident's status is updated.
 * If the new status is "เสร็จสิ้น", it sends a push notification to all subscribed users.
 */
export const notifyonincidentapproval = onDocumentUpdated("incidents/{incidentId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.log("No data associated with the event");
    return;
  }
  const newData = snapshot.after.data();
  const oldData = snapshot.before.data();

  // Check if the status was changed to "เสร็จสิ้น" and wasn't already "เสร็จสิ้น"
  if (newData.status !== "เสร็จสิ้น" || oldData.status === "เสร็จสิ้น") {
    logger.log("Condition not met. No notification sent.");
    return;
  }

  logger.log(
      `Incident ${event.params.incidentId} approved. Preparing notification.`,
  );

  // Get all FCM tokens from the 'fcmTokens' collection
  const tokensSnapshot = await admin.firestore().collection("fcmTokens").get();

  if (tokensSnapshot.empty) {
    logger.log("No FCM tokens found. Cannot send notifications.");
    return;
  }

  const tokens = tokensSnapshot.docs.map((doc) => doc.id);
  logger.log(`Sending notification to ${tokens.length} tokens.`);

  // Create the MulticastMessage directly
  const multicastMessage: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: " แจ้งเตือนเหตุการณ์ใหม่!",
      body: `ประเภท: ${newData.type || "ไม่ระบุ"} - ${
        String(newData.description || "").slice(0, 100)
      }...`,
    },
    webpush: {
      notification: {
        icon: "https://hyperlocal-alert.web.app/LOGO_CAS.png",
      },
      fcmOptions: {
        link: "https://hyperlocal-alert.web.app/event",
      },
    },
  };

  const response = await admin.messaging().sendEachForMulticast(multicastMessage);

  // Clean up invalid or expired tokens
  const tokensToRemove: Promise<any>[] = [];
  response.responses.forEach((result, index) => {
    const error = result.error;
    if (error) {
      logger.error(
          "Failure sending notification to",
          tokens[index],
          error,
      );
      // If the token is invalid, schedule it for deletion
      if (
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        tokensToRemove.push(
            admin.firestore().collection("fcmTokens").doc(tokens[index]).delete(),
        );
      }
    }
  });

  await Promise.all(tokensToRemove);
});

/**
 * Sends a test push notification to all subscribed users.
 * This is an HTTP-triggered function.
 */
export const sendtestnotification = onRequest(async (request, response) => {
  try {
    // Get all FCM tokens
    const tokensSnapshot = await admin.firestore().collection("fcmTokens").get();

    if (tokensSnapshot.empty) {
      logger.log("No FCM tokens found.");
      response.status(404).send("No FCM tokens found.");
      return;
    }

    const tokens = tokensSnapshot.docs.map((doc) => doc.id);
    logger.log(`Sending notification to ${tokens.length} tokens.`);

    // Create the MulticastMessage directly
    const multicastMessage: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: "Test Notification!",
        body: "This is a test notification from the server.",
      },
      webpush: {
        notification: {
          icon: "https://hyperlocal-alert.web.app/LOGO_CAS.png",
        },
        fcmOptions: {
          link: "https://hyperlocal-alert.web.app/",
        },
      },
    };

    const messagingResponse = await admin.messaging().sendEachForMulticast(multicastMessage);

    // Clean up invalid tokens
    const tokensToRemove: Promise<any>[] = [];
    messagingResponse.responses.forEach((result, index) => {
      const error = result.error;
      if (error) {
        logger.error("Failure sending notification to", tokens[index], error);
        // If the token is invalid, schedule it for deletion
        if (
          error.code === "messaging/invalid-registration-token" ||
          error.code === "messaging/registration-token-not-registered"
        ) {
          tokensToRemove.push(
              admin.firestore().collection("fcmTokens").doc(tokens[index]).delete(),
          );
        }
      }
    });

    await Promise.all(tokensToRemove);

    response.send(
        `Successfully sent message to ${messagingResponse.successCount} devices.`,
    );
  } catch (error) {
    logger.error("Error sending notification:", error);
    response.status(500).send("Error sending notification");
  }
});

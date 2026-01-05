/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Change, EventContext} from "firebase-functions";
import {DocumentSnapshot} from "firebase-admin/firestore";

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

/**
 * Triggered when an incident's status is updated.
 * If the new status is "เสร็จสิ้น", it sends a push notification to all subscribed users.
 */
export const notifyOnIncidentApproval = functions.firestore
    .document("incidents/{incidentId}")
    .onUpdate(async (change: Change<DocumentSnapshot>, context: EventContext) => {
      const newData = change.after.data();
      const oldData = change.before.data();

      // Check if the status was changed to "เสร็จสิ้น"
      // and wasn't already "เสร็จสิ้น"
      if (!newData || !oldData ||
        newData.status !== "เสร็จสิ้น" || oldData.status === "เสร็จสิ้น") {
        functions.logger.log(
            "Condition not met. No notification sent.",
        );
        return null;
      }

      functions.logger.log(
          `Incident ${context.params.incidentId} approved. ` +
        "Preparing notification.",
      );

      // 1. Prepare the notification payload
      const payload: admin.messaging.MessagingPayload = {
        notification: {
          title: "เหตุการณ์ได้รับการอนุมัติแล้ว!",
          body: `ประเภท: ${newData.type || "ไม่ระบุ"} - ${
            String(newData.description || "").slice(0, 100)
          }...`,
          icon: "https://hyperlocal-alert.web.app/logo192.png",
          click_action: "https://hyperlocal-alert.web.app/event",
        },
      };

      // 2. Get all FCM tokens from the 'fcmTokens' collection
      const tokensSnapshot =
      await admin.firestore().collection("fcmTokens").get();

      if (tokensSnapshot.empty) {
        functions.logger.log("No FCM tokens found. Cannot send notifications.");
        return null;
      }

      const tokens = tokensSnapshot.docs.map((doc) => doc.id);

      functions.logger.log(`Sending notification to ${tokens.length} tokens.`);

      // 3. Send notifications to all tokens using the new sendMulticast method
      const response = await admin.messaging().sendMulticast({
        tokens,
        notification: payload.notification,
      });

      // 4. Clean up invalid or expired tokens from Firestore
      const tokensToRemove: Promise<any>[] = [];
      // The response object now uses 'responses' instead of 'results'
      response.responses.forEach((result, index) => {
        const error = result.error;
        if (error) {
          functions.logger.error(
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
                admin.firestore()
                    .collection("fcmTokens").doc(tokens[index]).delete(),
            );
          }
        }
      });

      // Wait for all invalid tokens to be deleted
      return Promise.all(tokensToRemove);
    });

/**
 * Sends a test push notification to all subscribed users.
 * This is an HTTP-triggered function.
 */
export const sendTestNotification = onRequest(async (request, response) => {
  try {
    // 1. Prepare the notification payload
    const payload: admin.messaging.MessagingPayload = {
      notification: {
        title: "Test Notification!",
        body: "This is a test notification from the server.",
        icon: "https://hyperlocal-alert.web.app/logo192.png",
        click_action: "https://hyperlocal-alert.web.app/",
      },
    };

    // 2. Get all FCM tokens from the 'fcmTokens' collection
    const tokensSnapshot = await admin.firestore().collection("fcmTokens").get();

    if (tokensSnapshot.empty) {
      logger.log("No FCM tokens found. Cannot send notifications.");
      response.status(404).send("No FCM tokens found.");
      return;
    }

    const tokens = tokensSnapshot.docs.map((doc) => doc.id);

    logger.log(`Sending notification to ${tokens.length} tokens.`);

    // 3. Send notifications to all tokens
    const messagingResponse =
      await admin.messaging().sendMulticast({
        tokens,
        notification: payload.notification,
      });

    // 4. Clean up invalid or expired tokens from Firestore
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
              admin.firestore()
                  .collection("fcmTokens").doc(tokens[index]).delete(),
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

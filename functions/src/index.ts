import { logger } from "firebase-functions";
import { pubsub } from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

export const scheduledReminderCheck = pubsub
  .schedule("every day 08:00")
  .timeZone("Europe/Skopje")
  .onRun(async (context) => {
    logger.info("--- FUNCTION START ---");

    const runTime = new Date(context.timestamp);
    logger.info(`Function run time (Skopje): ${runTime.toISOString()}`);

    const REMINDER_OFFSETS = [1, 3, 7, 14];

    const queryForOffset = async (days: number) => {
      const targetDate = new Date(runTime);
      targetDate.setDate(runTime.getDate() + days);

      const start = new Date(targetDate);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(targetDate);
      end.setUTCHours(23, 59, 59, 999);

      logger.info(
        `Checking for subs due on ${start.toISOString()} (Remind: ${days} days before)`
      );

      return db
        .collectionGroup("subscriptions")
        .where("nextBillDate", ">=", start)
        .where("nextBillDate", "<=", end)
        .where("reminderDays", "==", days)
        .get();
    };

    let allSnapshots;
    try {
      allSnapshots = await Promise.all(
        REMINDER_OFFSETS.map((days) => queryForOffset(days))
      );
    } catch (error: any) {
      logger.error("!!! DATABASE QUERY FAILED (LIKELY MISSING INDEX) !!!");
      if (error && error.details) {
        logger.error("Magic Link to create index:", error.details);
      } else {
        logger.error(JSON.stringify(error));
      }
      return null;
    }

    const allDocs = allSnapshots.flatMap((snapshot) => snapshot.docs);

    if (allDocs.length === 0) {
      logger.info(
        "Query ran, but found 0 subscriptions matching any date/offset."
      );
      return null;
    }

    logger.info(
      `SUCCESS: Found ${allDocs.length} total subscriptions to remind.`
    );

    for (const subDoc of allDocs) {
      const subData = subDoc.data();
      const daysBefore = subData.reminderDays || 3;

      const symbol = "$";

      logger.info(
        `Processing subscription: ${subDoc.id} (${subData.serviceName})`
      );

      const userId = subDoc.ref.parent.parent?.id;
      if (!userId) {
        logger.warn(
          `Could not find userId for subscription ${subDoc.id}. Skipping.`
        );
        continue;
      }

      const tokensSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("tokens")
        .get();

      if (tokensSnapshot.empty) {
        logger.warn(`User ${userId} has 0 notification tokens. Skipping.`);
        continue;
      }

      const tokens = tokensSnapshot.docs.map(
        (tokenDoc) => tokenDoc.data().token
      );

      const bodyText = `Your ${
        subData.serviceName
      } subscription for ${symbol}${subData.cost.toFixed(
        2
      )} is due in ${daysBefore} days.`;

      try {
        await db
          .collection("users")
          .doc(userId)
          .collection("notifications")
          .add({
            title: "Upcoming Subscription Charge!",
            body: bodyText,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
          });
      } catch (error) {
        logger.error(`Error saving notification to Firestore:`, error);
      }

      const payload: admin.messaging.MulticastMessage = {
        notification: {
          title: "Upcoming Subscription Charge!",
          body: bodyText,
        },
        webpush: {
          notification: { icon: "/favicon.ico" },
        },
        tokens: tokens,
      };

      try {
        await messaging.sendEachForMulticast(payload);
        logger.info(`Sent push to user ${userId}.`);
      } catch (error) {
        logger.error(`Error sending push to user ${userId}:`, error);
      }
    }

    logger.info("--- FUNCTION END (COMPLETE) ---");
    return null;
  });

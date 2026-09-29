import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

/**
 * Health check endpoint for testing deployment and connectivity
 */
export const healthCheck = onRequest({ cors: true }, (req, res) => {
  logger.info("Health check ping received", { structuredData: true });
  res.status(200).json({
    status: "ok",
    service: "sport-functions",
    timestamp: new Date().toISOString()
  });
});

/**
 * Triggered whenever a workout activity is created in Firestore.
 * Shared backend event listener for both Web and Android app activities.
 */
export const onActivityCreated = onDocumentCreated(
  "users/{userId}/activities/{activityId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn("No data associated with the event");
      return;
    }

    const { userId, activityId } = event.params;
    const activityData = snapshot.data();

    logger.info(`New activity created: ${activityId} for user: ${userId}`, {
      userId,
      activityId,
      date: activityData.date,
      exercisesCount: Array.isArray(activityData.exercises) ? activityData.exercises.length : 0
    });

    try {
      // Example aggregation / tracking:
      // Update last active timestamp on user profile
      const userRef = db.doc(`users/${userId}`);
      await userRef.set(
        {
          lastActivityAt: activityData.date || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (error) {
      logger.error("Failed to update user profile on activity creation", error);
    }
  }
);

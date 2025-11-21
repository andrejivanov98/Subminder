// src/components/NotificationPrompt.tsx
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { getToken } from "firebase/messaging";
import {
  messaging,
  VAPID_KEY,
  db,
  doc,
  setDoc,
  serverTimestamp,
} from "../firebase";

interface NotificationPromptProps {
  userId: string;
}

export default function NotificationPrompt({
  userId,
}: NotificationPromptProps) {
  const [permission, setPermission] = useState(Notification.permission);

  // This function requests permission, gets the token, and saves it
  const requestPermissionAndGetToken = async () => {
    if ("Notification" in window) {
      try {
        const currentPermission = await Notification.requestPermission();
        setPermission(currentPermission);

        if (currentPermission === "granted") {
          console.log("Notification permission granted.");

          // Get the token
          const currentToken = await getToken(messaging, {
            vapidKey: VAPID_KEY,
          });

          if (currentToken) {
            console.log("FCM Token:", currentToken);
            // Save this token to Firestore
            await saveTokenToFirestore(userId, currentToken);
          } else {
            console.log(
              "No registration token available. Request permission to generate one."
            );
          }
        } else {
          console.log("Unable to get permission to notify.");
        }
      } catch (error) {
        console.error("An error occurred while retrieving token. ", error);
      }
    }
  };

  // Saves the token to a user's subcollection
  const saveTokenToFirestore = async (userId: string, token: string) => {
    try {
      // We use the token itself as the document ID to prevent duplicates
      const tokenRef = doc(db, "users", userId, "tokens", token);
      await setDoc(tokenRef, {
        token: token,
        createdAt: serverTimestamp(), // Know when it was added
      });
      console.log("Token saved to Firestore.");
    } catch (error) {
      console.error("Error saving token to Firestore: ", error);
    }
  };

  // This effect runs on load to check if permission is *already* granted
  // and syncs the token just in case.
  useEffect(() => {
    const syncToken = async () => {
      if (Notification.permission === "granted" && userId) {
        try {
          const currentToken = await getToken(messaging, {
            vapidKey: VAPID_KEY,
          });
          if (currentToken) {
            await saveTokenToFirestore(userId, currentToken);
          }
        } catch (error) {
          console.error("Error syncing token on load:", error);
        }
      }
    };
    syncToken();
  }, [userId]); // Runs when userId is available

  // If permission is already granted, don't show anything.
  // We'll just sync the token in the background (see useEffect).
  if (permission === "granted") {
    return null;
  }

  // If permission is denied, show a "please enable" message
  if (permission === "denied") {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-sm mb-6">
        <p className="font-bold">Notifications Blocked</p>
        <p className="text-sm">
          To get reminders, please enable notifications in your browser
          settings.
        </p>
      </div>
    );
  }

  // If permission is "default" (not yet asked), show the prompt button.
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex items-center justify-between">
      <div className="flex items-center">
        <div className="bg-indigo-100 p-2 rounded-full mr-3">
          <Bell className="text-indigo-600" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Get Reminders!</h3>
          <p className="text-sm text-gray-600">
            Enable push notifications to get alerts.
          </p>
        </div>
      </div>
      <button
        onClick={requestPermissionAndGetToken}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
      >
        Enable
      </button>
    </div>
  );
}

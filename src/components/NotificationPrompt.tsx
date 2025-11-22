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

  const requestPermissionAndGetToken = async () => {
    if ("Notification" in window) {
      try {
        const currentPermission = await Notification.requestPermission();
        setPermission(currentPermission);

        if (currentPermission === "granted") {
          console.log("Notification permission granted.");
          const currentToken = await getToken(messaging, {
            vapidKey: VAPID_KEY,
          });

          if (currentToken) {
            await saveTokenToFirestore(userId, currentToken);
          }
        }
      } catch (error) {
        console.error("An error occurred while retrieving token. ", error);
      }
    }
  };

  const saveTokenToFirestore = async (userId: string, token: string) => {
    try {
      const tokenRef = doc(db, "users", userId, "tokens", token);
      await setDoc(tokenRef, {
        token: token,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving token to Firestore: ", error);
    }
  };

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
  }, [userId]);

  if (permission === "granted") {
    return null;
  }

  if (permission === "denied") {
    return (
      <div className="bg-amber-900/20 border border-amber-900/50 text-amber-200 p-4 rounded-xl mb-6 flex items-start gap-3">
        <div className="mt-0.5">⚠️</div>
        <div>
          <p className="font-semibold text-sm">Notifications Blocked</p>
          <p className="text-xs opacity-80 mt-1">
            Please enable notifications in your browser settings to receive
            reminders.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-sm mb-6 flex items-center justify-between">
      <div className="flex items-center">
        <div className="bg-indigo-500/10 p-2 rounded-full mr-3">
          <Bell className="text-indigo-400" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-100 text-sm">Get Reminders</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Enable push notifications to get alerts.
          </p>
        </div>
      </div>
      <button
        onClick={requestPermissionAndGetToken}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-indigo-500 transition-colors"
      >
        Enable
      </button>
    </div>
  );
}

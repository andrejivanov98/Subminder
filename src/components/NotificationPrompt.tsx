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

  if (permission === "granted") return null;

  if (permission === "denied") {
    return (
      <div className="mb-6 bg-slate-900 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
        <div className="bg-red-500/10 p-2 rounded-full text-red-400">
          <Bell size={18} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-200">
            Notifications Disabled
          </p>
          <p className="text-xs text-slate-500">
            Enable in browser settings to get alerts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-blue-500/10 p-2 rounded-full text-blue-400">
          <Bell size={18} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-200">Get Notified</p>
          <p className="text-xs text-slate-500">Never miss a bill payment.</p>
        </div>
      </div>
      <button
        onClick={requestPermissionAndGetToken}
        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-colors"
      >
        Enable
      </button>
    </div>
  );
}

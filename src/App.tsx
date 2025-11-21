import { useState, useEffect, useMemo } from "react";
import {
  auth,
  db,
  onSnapshot,
  collection,
  query,
  messaging,
  addDoc,
  serverTimestamp,
} from "./firebase";
import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";
import { onMessage } from "firebase/messaging";
import { BarChart2 } from "lucide-react";

import Dashboard from "./components/Dashboard";
import Insights from "./components/Insights";
import NavBar from "./components/NavBar";
import NotificationCenter from "./components/NotificationCenter";
import Toast from "./components/Toast";
import type { Subscription, AppNotification } from "./types";

export type View = "dashboard" | "insights" | "notifications" | "tips";

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // --- DATA STATE ---
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // --- UI STATE ---
  const [toastNotification, setToastNotification] = useState<{
    title: string;
    body: string;
  } | null>(null);

  // --- AUTH EFFECT ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Error signing in anonymously:", error);
        });
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // --- FETCH DATA EFFECT ---
  useEffect(() => {
    if (!user) return;

    // 1. Subscriptions Listener
    const subUnsub = onSnapshot(
      query(collection(db, "users", user.uid, "subscriptions")),
      (snapshot) => {
        const list: Subscription[] = [];
        snapshot.forEach((doc) => {
          const d = doc.data();
          list.push({
            id: doc.id,
            serviceName: d.serviceName,
            cost: d.cost,
            cycle: d.cycle,
            nextBillDate: d.nextBillDate.toDate().toISOString().split("T")[0],
            category: d.category,
            managementUrl: d.managementUrl,
          } as Subscription);
        });
        setSubscriptions(list);
        setIsLoadingData(false);
      },
      (error) => console.error("Error fetching subs:", error)
    );

    // 2. Notifications Listener
    const notifUnsub = onSnapshot(
      query(collection(db, "users", user.uid, "notifications")),
      (snapshot) => {
        const list: AppNotification[] = [];
        snapshot.forEach((doc) => {
          const d = doc.data();
          list.push({
            id: doc.id,
            title: d.title,
            body: d.body,
            date: d.createdAt
              ? d.createdAt.toDate().toISOString()
              : new Date().toISOString(),
            read: d.read || false,
          });
        });
        setNotifications(list);
      }
    );

    return () => {
      subUnsub();
      notifUnsub();
    };
  }, [user]);

  // --- FOREGROUND LISTENER ---
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onMessage(messaging, async (payload) => {
      console.log("Foreground message received:", payload);
      if (payload.notification) {
        const { title, body } = payload.notification;

        // Show Toast
        setToastNotification({
          title: title || "New Message",
          body: body || "",
        });

        // Save to Firestore
        try {
          await addDoc(collection(db, "users", user.uid, "notifications"), {
            title: title,
            body: body,
            createdAt: serverTimestamp(),
            read: false,
          });
        } catch (e) {
          console.error("Error saving notification:", e);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Calculate unread count
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // --- LOADING SCREEN ---
  if (
    isLoadingAuth ||
    (isLoadingData && !subscriptions.length && !notifications.length)
  ) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <BarChart2 className="w-12 h-12 text-indigo-600 animate-pulse" />
        <p className="text-gray-600 font-medium mt-4">
          Loading Your SubMinder...
        </p>
        {isLoadingAuth && (
          <p className="text-sm text-gray-500">Authenticating...</p>
        )}
        {isLoadingData && !isLoadingAuth && (
          <p className="text-sm text-gray-500">Syncing data...</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gray-100">
      {/* Toast */}
      {toastNotification && (
        <Toast
          title={toastNotification.title}
          body={toastNotification.body}
          onClose={() => setToastNotification(null)}
        />
      )}

      <main className="pb-20">
        {view === "dashboard" && (
          <Dashboard
            userId={user?.uid}
            subscriptions={subscriptions}
            user={user} // <-- Passed the full user object
          />
        )}
        {view === "insights" && (
          <Insights userId={user?.uid} subscriptions={subscriptions} />
        )}
        {view === "notifications" && (
          <NotificationCenter
            userId={user!.uid}
            notifications={notifications}
            onClose={() => setView("dashboard")}
          />
        )}
      </main>

      <NavBar currentView={view} setView={setView} unreadCount={unreadCount} />
    </div>
  );
}

export default App;

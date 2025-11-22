// src/components/NotificationCenter.tsx
import { Bell, Check, Trash2 } from "lucide-react";
import type { AppNotification } from "../types";
import { db, doc, deleteDoc, updateDoc } from "../firebase";

interface NotificationCenterProps {
  userId: string;
  notifications: AppNotification[];
  onClose: () => void;
}

export default function NotificationCenter({
  userId,
  notifications,
  onClose,
}: NotificationCenterProps) {
  // Sort by date (newest first)
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleMarkAsRead = async (notification: AppNotification) => {
    if (notification.read) return;
    try {
      const notifRef = doc(
        db,
        "users",
        userId,
        "notifications",
        notification.id
      );
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const notifRef = doc(db, "users", userId, "notifications", id);
      await deleteDoc(notifRef);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Notifications
          </h1>
          {/* Added Subtitle */}
          <p className="text-slate-400 text-sm mt-1">
            Alerts for your upcoming payments.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-blue-400 font-medium text-sm hover:text-blue-300 transition-colors mt-1"
        >
          Close
        </button>
      </div>

      {sortedNotifications.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800">
          <div className="bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Bell className="text-slate-400" size={24} />
          </div>
          <p className="text-slate-400 font-medium">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
                notif.read
                  ? "bg-slate-900/50 border-slate-800 opacity-60"
                  : "bg-slate-900 border-slate-700 shadow-sm"
              }`}
              onClick={() => handleMarkAsRead(notif)}
            >
              {/* Unread Indicator Strip */}
              {!notif.read && (
                <div className="absolute left-0 top-4 bottom-4 w-1 bg-blue-500 rounded-r-full" />
              )}

              <div className="flex justify-between items-start pl-2">
                <div className="flex-1">
                  <h3
                    className={`text-sm text-white ${
                      notif.read ? "font-medium" : "font-bold"
                    }`}
                  >
                    {notif.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {notif.body}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-3">
                    {new Date(notif.date).toLocaleDateString()} •{" "}
                    {new Date(notif.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex flex-col space-y-2 ml-3">
                  {!notif.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif);
                      }}
                      className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif.id);
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

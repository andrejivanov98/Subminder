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
      <div className="flex items-center justify-between mb-8 mt-2">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <button
          onClick={onClose}
          className="text-indigo-400 hover:text-indigo-300 font-medium text-sm"
        >
          Back
        </button>
      </div>

      {sortedNotifications.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 border-dashed">
          <div className="bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="text-zinc-500" size={20} />
          </div>
          <p className="text-zinc-500 font-medium">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`relative p-4 rounded-xl border transition-all ${
                notif.read
                  ? "bg-zinc-900/30 border-zinc-800/50 opacity-60"
                  : "bg-zinc-900 border-zinc-700 shadow-sm"
              }`}
              onClick={() => handleMarkAsRead(notif)}
            >
              {/* Unread Indicator Dot */}
              {!notif.read && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full" />
              )}

              <div className="flex justify-between items-start pr-6">
                <div className="flex-1">
                  <h3
                    className={`text-sm text-zinc-100 ${
                      notif.read ? "font-medium" : "font-bold"
                    }`}
                  >
                    {notif.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {notif.body}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-3">
                    {new Date(notif.date).toLocaleDateString()} •{" "}
                    {new Date(notif.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800/50 justify-end">
                {!notif.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                  >
                    <Check size={12} /> Mark Read
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notif.id);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

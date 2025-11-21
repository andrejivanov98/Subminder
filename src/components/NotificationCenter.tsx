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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <button
          onClick={onClose}
          className="text-indigo-600 font-medium text-sm"
        >
          Close
        </button>
      </div>

      {sortedNotifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Bell className="text-indigo-400" size={24} />
          </div>
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white p-4 rounded-lg shadow-sm border-l-4 transition-all cursor-pointer ${
                notif.read ? "border-gray-200 opacity-75" : "border-indigo-500"
              }`}
              onClick={() => handleMarkAsRead(notif)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3
                    className={`font-semibold text-gray-900 ${
                      notif.read ? "font-medium" : "font-bold"
                    }`}
                  >
                    {notif.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{notif.body}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notif.date).toLocaleDateString()} at{" "}
                    {new Date(notif.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex flex-col space-y-2 ml-2">
                  {!notif.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif);
                      }}
                      className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-full"
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
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
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

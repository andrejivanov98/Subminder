// src/components/NavBar.tsx
import { Home, BarChart2, Bell } from "lucide-react";
import type { View } from "../App";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number; // Kept your Notification Center prop
}

// Sub-component for a single nav item
function NavItem({
  icon: Icon,
  label,
  isActive,
  onClick,
  badgeCount,
}: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-full pt-2 pb-1 ${
        isActive ? "text-indigo-600" : "text-gray-500"
      } transition-colors`}
    >
      <div className="relative">
        <Icon size={24} />
        {/* Kept your Notification Center logic */}
        {badgeCount !== undefined && badgeCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center border-2 border-white">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </div>
      <span className="text-xs font-medium mt-0.5">{label}</span>
    </button>
  );
}

interface NavBarProps {
  currentView: View;
  setView: (view: View) => void;
  unreadCount: number; // Kept your Notification Center prop
}

export default function NavBar({
  currentView,
  setView,
  unreadCount,
}: NavBarProps) {
  return (
    // --- THIS IS THE FIX ---
    // Applied pb-safe and min-h-[64px] for mobile safe area
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex shadow-inner z-50 pb-safe min-h-[64px]">
      <NavItem
        icon={Home}
        label="Dashboard"
        isActive={currentView === "dashboard"}
        onClick={() => setView("dashboard")}
      />
      <NavItem
        icon={BarChart2}
        label="Insights"
        isActive={currentView === "insights"}
        onClick={() => setView("insights")}
      />

      {/* Kept your Notification Center logic */}
      <NavItem
        icon={Bell}
        label="Notifications"
        isActive={currentView === "notifications"}
        onClick={() => setView("notifications")}
        badgeCount={unreadCount}
      />
    </nav>
  );
}

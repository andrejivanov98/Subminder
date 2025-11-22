// src/components/NavBar.tsx
import { Home, BarChart2, Bell } from "lucide-react";
import type { View } from "../App";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
}

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
      className={`relative flex flex-col items-center justify-center w-full pt-2 pb-1 transition-all duration-200 ${
        isActive ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      <div className="relative">
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        {badgeCount !== undefined && badgeCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center border-2 border-zinc-900">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </button>
  );
}

interface NavBarProps {
  currentView: View;
  setView: (view: View) => void;
  unreadCount: number;
}

export default function NavBar({
  currentView,
  setView,
  unreadCount,
}: NavBarProps) {
  return (
    // Dark, blurred background with a thin top border
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 flex shadow-lg z-50 pb-safe min-h-[64px]">
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

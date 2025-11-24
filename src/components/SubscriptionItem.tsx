import { AlertCircle } from "lucide-react";
import type { Subscription, SubscriptionCategory } from "../types";

const getDaysLeftInfo = (dateString: string) => {
  const now = new Date();
  const nextBillDate = new Date(dateString);
  now.setHours(0, 0, 0, 0);
  nextBillDate.setHours(0, 0, 0, 0);

  const diffTime = nextBillDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let statusColor = "text-slate-400";
  let statusText = `Due in ${daysLeft} days`;
  let urgencyBorder = "border-transparent";

  if (daysLeft < 0) {
    statusColor = "text-red-600";
    statusText = `Overdue by ${Math.abs(daysLeft)} days`;
    urgencyBorder = "border-red-500/50";
  } else if (daysLeft === 0) {
    statusColor = "text-red-600";
    statusText = "Due Today";
    urgencyBorder = "border-red-500";
  } else if (daysLeft <= 3) {
    statusColor = "text-orange-500";
    urgencyBorder = "border-orange-500/50";
  }

  return { daysLeft, statusColor, statusText, urgencyBorder };
};

const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  Entertainment: "bg-red-600",
  Work: "bg-blue-600",
  Health: "bg-green-500",
  Utility: "bg-orange-500",
  Other: "bg-slate-700",
};

interface SubscriptionItemProps {
  subscription: Subscription;
  userId: string;
  onEdit: (sub: Subscription) => void;
}

export default function SubscriptionItem({
  subscription,
  onEdit,
}: SubscriptionItemProps) {
  const { serviceName, cost, cycle, nextBillDate, category } = subscription;
  const { daysLeft, statusColor, statusText, urgencyBorder } =
    getDaysLeftInfo(nextBillDate);

  const symbol = "$";
  const colorClass = CATEGORY_COLORS[category] || "bg-slate-700";

  return (
    <div
      className={`group relative bg-slate-900 rounded-xl p-4 border ${
        urgencyBorder === "border-transparent"
          ? "border-slate-800"
          : urgencyBorder
      } hover:bg-slate-800/80 transition-all active:scale-[0.99] cursor-pointer`}
      onClick={() => onEdit(subscription)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-black/20`}
          >
            {serviceName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="font-semibold text-lg text-slate-100">
              {serviceName}
            </h3>
            <p
              className={`text-xs font-medium flex items-center ${statusColor}`}
            >
              {daysLeft <= 3 && daysLeft >= 0 && (
                <AlertCircle size={12} className="mr-1" />
              )}
              {statusText}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="font-bold text-lg tracking-tight text-white">
            {symbol}
            {cost.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 capitalize">{cycle}</div>
        </div>
      </div>
    </div>
  );
}

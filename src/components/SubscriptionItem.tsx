// src/components/SubscriptionItem.tsx
import { ExternalLink, Trash2, Pencil } from "lucide-react";
import type { Subscription, Currency } from "../types";
import { db, doc, deleteDoc } from "../firebase";

const getDaysLeftInfo = (dateString: string) => {
  const now = new Date();
  const nextBillDate = new Date(dateString);
  now.setHours(0, 0, 0, 0);
  nextBillDate.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil(
    (nextBillDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft < 0) return { text: "Overdue", color: "text-red-400" };
  if (daysLeft === 0) return { text: "Today", color: "text-red-400" };
  if (daysLeft <= 3)
    return { text: `in ${daysLeft} days`, color: "text-red-400" };
  if (daysLeft <= 7)
    return { text: `in ${daysLeft} days`, color: "text-yellow-500" };
  return { text: `in ${daysLeft} days`, color: "text-emerald-400" };
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  MKD: "den",
  GBP: "£",
};

interface SubscriptionItemProps {
  subscription: Subscription;
  userId: string;
  onEdit: (sub: Subscription) => void;
}

export default function SubscriptionItem({
  subscription,
  userId,
  onEdit,
}: SubscriptionItemProps) {
  const {
    serviceName,
    cost,
    currency,
    cycle,
    nextBillDate,
    managementUrl,
    id,
  } = subscription;
  const daysLeftInfo = getDaysLeftInfo(nextBillDate);

  const symbol = CURRENCY_SYMBOLS[currency] || "$";

  const cycleText: Record<Subscription["cycle"], string> = {
    monthly: "/mo",
    yearly: "/yr",
    weekly: "/wk",
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${serviceName}?`)) {
      return;
    }
    try {
      const docRef = doc(db, "users", userId, "subscriptions", id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting subscription:", error);
      alert("Failed to delete subscription.");
    }
  };

  return (
    <div
      className="flex items-center p-4 hover:bg-zinc-800/50 transition-colors cursor-pointer group"
      onClick={() => onEdit(subscription)}
    >
      {/* Icon Circle */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mr-4">
        <span className="text-lg font-bold text-indigo-400">
          {serviceName.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-grow min-w-0">
        <p className="text-sm font-semibold text-zinc-100 truncate">
          {serviceName}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5">
          {symbol}
          {cost.toFixed(2)}{" "}
          <span className="text-zinc-600">{cycleText[cycle]}</span>
        </p>
      </div>

      {/* Date Info (Desktop) */}
      <div className="text-right flex-shrink-0 ml-4 hidden sm:block">
        <p className="text-sm font-medium text-zinc-300">
          {new Date(nextBillDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
        <p className={`text-xs font-medium ${daysLeftInfo.color}`}>
          {daysLeftInfo.text}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-row ml-2 sm:ml-4 items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(subscription);
          }}
          className="text-zinc-500 hover:text-indigo-400 p-2 rounded-full hover:bg-zinc-800 transition-colors"
          aria-label="Edit Subscription"
        >
          <Pencil size={16} />
        </button>

        {managementUrl && (
          <a
            href={managementUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-indigo-400 p-2 rounded-full hover:bg-zinc-800 transition-colors hidden sm:block"
            onClick={(e) => e.stopPropagation()}
            aria-label="Manage Subscription"
          >
            <ExternalLink size={16} />
          </a>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="text-zinc-500 hover:text-red-400 p-2 rounded-full hover:bg-zinc-800 transition-colors"
          aria-label="Delete Subscription"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

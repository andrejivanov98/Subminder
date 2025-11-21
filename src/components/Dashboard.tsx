import { useState, useMemo } from "react";
import { Plus, Link as LinkIcon } from "lucide-react";
import type { Subscription, Currency } from "../types";
import SummaryCard from "./SummaryCard";
import SubscriptionList from "./SubscriptionList";
import AddSubscriptionModal from "./AddSubscriptionModal";
import NotificationPrompt from "./NotificationPrompt";

import { googleProvider } from "../firebase";
import { linkWithPopup, type User } from "firebase/auth";
import { FirebaseError } from "firebase/app";

const getTodayDate = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
};

// Map for symbols
const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  MKD: "den",
  GBP: "£",
};

interface DashboardProps {
  userId: string | undefined;
  subscriptions: Subscription[];
  user: User | null;
}

export default function Dashboard({
  userId,
  subscriptions,
  user,
}: DashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);

  const handleLinkAccount = async () => {
    if (!user) return;
    try {
      await linkWithPopup(user, googleProvider);
      alert("Successfully linked to Google! Your data is safe.");
    } catch (error) {
      console.error("Error linking account:", error);
      if (
        error instanceof FirebaseError &&
        error.code === "auth/credential-already-in-use"
      ) {
        alert(
          "This Google account is already used. Sign out and sign in with Google to switch."
        );
      } else {
        alert("Failed to link account.");
      }
    }
  };

  const handleEditClick = (sub: Subscription) => {
    setEditingSubscription(sub);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingSubscription(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubscription(null);
  };

  const { totalMonthlyDisplay, upcomingBill } = useMemo(() => {
    // --- 1. Calculate Totals Grouped by Currency ---
    const totalsByCurrency: Record<string, number> = {};

    subscriptions.forEach((sub) => {
      const curr = sub.currency || "USD"; // Default to USD
      if (!totalsByCurrency[curr]) totalsByCurrency[curr] = 0;

      if (sub.cycle === "monthly") totalsByCurrency[curr] += sub.cost;
      else if (sub.cycle === "yearly") totalsByCurrency[curr] += sub.cost / 12;
      else if (sub.cycle === "weekly") totalsByCurrency[curr] += sub.cost * 4;
    });

    // Format the display string: "$15.00 + €10.00"
    const totalString = Object.entries(totalsByCurrency)
      .map(([curr, amount]) => {
        const symbol = CURRENCY_SYMBOLS[curr as Currency] || "$";
        return `${symbol}${amount.toFixed(2)}`;
      })
      .join(" + ");

    // --- 2. Upcoming Bill ---
    let upcoming: Subscription | null = null;
    if (subscriptions.length > 0) {
      const today = new Date(getTodayDate());
      today.setHours(0, 0, 0, 0);

      const sortedSubs = [...subscriptions]
        .filter((s) => new Date(s.nextBillDate) >= today)
        .sort(
          (a, b) =>
            new Date(a.nextBillDate).getTime() -
            new Date(b.nextBillDate).getTime()
        );

      if (sortedSubs.length > 0) {
        upcoming = sortedSubs[0];
      } else {
        upcoming = [...subscriptions].sort(
          (a, b) =>
            new Date(b.nextBillDate).getTime() -
            new Date(a.nextBillDate).getTime()
        )[0];
      }
    }

    const daysLeft = upcoming
      ? Math.ceil(
          (new Date(upcoming.nextBillDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    const upcomingSymbol = upcoming
      ? CURRENCY_SYMBOLS[upcoming.currency] || "$"
      : "";

    return {
      totalMonthlyDisplay: totalString || "$0.00", // Default if empty
      upcomingBill: {
        name: upcoming?.serviceName || "N/A",
        days: upcoming ? (daysLeft < 0 ? "Overdue" : `${daysLeft} days`) : "-",
        costDisplay: upcoming
          ? `${upcomingSymbol}${upcoming.cost.toFixed(2)}`
          : "0.00",
      },
    };
  }, [subscriptions]);

  if (!userId) {
    return (
      <div className="p-4 max-w-2xl mx-auto text-center">
        <p className="text-gray-500">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          {user?.isAnonymous ? (
            <p className="text-gray-600 text-sm flex items-center gap-1">
              Guest Mode
              <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">
                {userId.substring(0, 4)}
              </span>
            </p>
          ) : (
            <p className="text-gray-600 text-sm">
              {user?.displayName
                ? `Welcome back, ${user.displayName}`
                : "Welcome back"}
            </p>
          )}
        </div>

        {user?.isAnonymous && (
          <button
            onClick={handleLinkAccount}
            className="flex items-center text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-2 rounded-full hover:bg-indigo-100 transition-colors"
          >
            <LinkIcon size={14} className="mr-1.5" />
            Link Google
          </button>
        )}
      </div>

      <NotificationPrompt userId={userId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <SummaryCard
          title="Total Monthly"
          value={totalMonthlyDisplay} // Use the formatted string
          subtitle="Estimate"
        />
        <SummaryCard
          title="Upcoming Bill"
          value={upcomingBill.costDisplay}
          subtitle={`(${upcomingBill.name} in ${upcomingBill.days})`}
        />
      </div>

      <SubscriptionList
        subscriptions={subscriptions}
        userId={userId}
        onEdit={handleEditClick}
      />

      <button
        onClick={handleAddClick}
        className="fixed bottom-20 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 z-40"
      >
        <Plus size={24} />
      </button>

      <AddSubscriptionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userId={userId}
        initialData={editingSubscription}
      />
    </div>
  );
}

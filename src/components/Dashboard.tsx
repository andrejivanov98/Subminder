// src/components/Dashboard.tsx
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
    const totalsByCurrency: Record<string, number> = {};

    subscriptions.forEach((sub) => {
      const curr = sub.currency || "USD";
      if (!totalsByCurrency[curr]) totalsByCurrency[curr] = 0;

      if (sub.cycle === "monthly") totalsByCurrency[curr] += sub.cost;
      else if (sub.cycle === "yearly") totalsByCurrency[curr] += sub.cost / 12;
      else if (sub.cycle === "weekly") totalsByCurrency[curr] += sub.cost * 4;
    });

    const totalString = Object.entries(totalsByCurrency)
      .map(([curr, amount]) => {
        const symbol = CURRENCY_SYMBOLS[curr as Currency] || "$";
        return `${symbol}${amount.toFixed(2)}`;
      })
      .join(" + ");

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
      totalMonthlyDisplay: totalString || "$0.00",
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
        <p className="text-zinc-500">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8 mt-2">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          {user?.isAnonymous ? (
            <p className="text-zinc-400 text-sm flex items-center gap-2 mt-1">
              Guest Mode
              <span className="bg-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded-full border border-zinc-700">
                {userId.substring(0, 4)}
              </span>
            </p>
          ) : (
            <p className="text-zinc-400 text-sm mt-1">
              {user?.displayName
                ? `Welcome back, ${user.displayName}`
                : "Welcome back"}
            </p>
          )}
        </div>

        {user?.isAnonymous && (
          <button
            onClick={handleLinkAccount}
            className="flex items-center text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full hover:bg-indigo-500/20 transition-colors"
          >
            <LinkIcon size={12} className="mr-1.5" />
            Link Google
          </button>
        )}
      </div>

      <NotificationPrompt userId={userId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <SummaryCard
          title="Total Monthly"
          value={totalMonthlyDisplay}
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
        className="fixed bottom-24 right-6 bg-indigo-600 text-white p-3.5 rounded-full shadow-xl shadow-indigo-900/30 hover:bg-indigo-500 hover:scale-105 transition-all duration-300 z-40"
      >
        <Plus size={28} />
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

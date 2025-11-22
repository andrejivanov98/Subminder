// src/components/SubscriptionList.tsx
import type { Subscription } from "../types";
import SubscriptionItem from "./SubscriptionItem";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  userId: string;
  onEdit: (sub: Subscription) => void;
}

export default function SubscriptionList({
  subscriptions,
  userId,
  onEdit,
}: SubscriptionListProps) {
  const sortedSubs = [...subscriptions].sort(
    (a, b) =>
      new Date(a.nextBillDate).getTime() - new Date(b.nextBillDate).getTime()
  );

  return (
    <div className="bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800/50 overflow-hidden">
      <h2 className="text-sm font-semibold text-zinc-100 p-4 border-b border-zinc-800">
        Your Subscriptions ({subscriptions.length})
      </h2>
      <div className="divide-y divide-zinc-800">
        {sortedSubs.length > 0 ? (
          sortedSubs.map((sub) => (
            <SubscriptionItem
              key={sub.id}
              subscription={sub}
              userId={userId}
              onEdit={onEdit}
            />
          ))
        ) : (
          <p className="p-8 text-center text-zinc-500 text-sm">
            No subscriptions yet. <br />
            Tap the + button to add one.
          </p>
        )}
      </div>
    </div>
  );
}

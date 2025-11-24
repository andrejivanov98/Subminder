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
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between px-2 mb-2">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Upcoming
        </h2>
      </div>

      {sortedSubs.length === 0 ? (
        <div className="text-center py-20 opacity-50">
          <p className="text-slate-400">No subscriptions yet.</p>
          <p className="text-sm text-slate-600">Tap + to add one.</p>
        </div>
      ) : (
        sortedSubs.map((sub) => (
          <SubscriptionItem
            key={sub.id}
            subscription={sub}
            userId={userId}
            onEdit={onEdit}
          />
        ))
      )}
    </div>
  );
}

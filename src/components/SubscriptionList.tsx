import type { Subscription } from '../types';
import SubscriptionItem from './SubscriptionItem';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  userId: string;
  onEdit: (sub: Subscription) => void; // NEW PROP
}

export default function SubscriptionList({ subscriptions, userId, onEdit }: SubscriptionListProps) {
  const sortedSubs = [...subscriptions].sort(
    (a, b) => new Date(a.nextBillDate).getTime() - new Date(b.nextBillDate).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 p-4 border-b border-gray-200">
        Your Subscriptions ({subscriptions.length})
      </h2>
      <div className="divide-y divide-gray-200">
        {sortedSubs.length > 0 ? (
          sortedSubs.map((sub) => (
            <SubscriptionItem 
              key={sub.id} 
              subscription={sub} 
              userId={userId} 
              onEdit={onEdit} // Pass down
            />
          ))
        ) : (
          <p className="p-4 text-center text-gray-500">
            No subscriptions yet. Add your first one!
          </p>
        )}
      </div>
    </div>
  );
}
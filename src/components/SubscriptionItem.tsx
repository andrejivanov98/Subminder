import { ExternalLink, Trash2, Pencil } from 'lucide-react'; 
import type { Subscription, Currency } from '../types';
import { db, doc, deleteDoc } from '../firebase';

const getDaysLeftInfo = (dateString: string) => {
  const now = new Date();
  const nextBillDate = new Date(dateString);
  now.setHours(0, 0, 0, 0);
  nextBillDate.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil(
    (nextBillDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft < 0) return { text: 'Overdue', color: 'text-red-600' };
  if (daysLeft === 0) return { text: 'Today', color: 'text-red-600' };
  if (daysLeft <= 3) return { text: `in ${daysLeft} days`, color: 'text-red-500' };
  if (daysLeft <= 7) return { text: `in ${daysLeft} days`, color: 'text-yellow-600' };
  return { text: `in ${daysLeft} days`, color: 'text-green-600' };
};

// --- NEW: Currency Map ---
const CURRENCY_SYMBOLS: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    MKD: 'den',
    GBP: '£'
};

interface SubscriptionItemProps {
  subscription: Subscription;
  userId: string;
  onEdit: (sub: Subscription) => void;
}

export default function SubscriptionItem({ subscription, userId, onEdit }: SubscriptionItemProps) {
  const { serviceName, cost, currency, cycle, nextBillDate, managementUrl, id } = subscription;
  const daysLeftInfo = getDaysLeftInfo(nextBillDate);

  // Default to USD if currency is missing (legacy data)
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  const cycleText: Record<Subscription['cycle'], string> = {
    monthly: '/mo',
    yearly: '/yr',
    weekly: '/wk',
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${serviceName}?`)) {
      return;
    }
    try {
      const docRef = doc(db, 'users', userId, 'subscriptions', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting subscription:", error);
      alert("Failed to delete subscription.");
    }
  };

  return (
    <div 
      className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onEdit(subscription)}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
        <span className="text-lg font-medium text-indigo-600">
          {serviceName.charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex-grow min-w-0">
        <p className="text-md font-semibold text-gray-900 truncate">{serviceName}</p>
        <p className="text-sm text-gray-600">
          {/* UPDATED PRICE DISPLAY */}
          {symbol}{cost.toFixed(2)} <span className="text-gray-400">{cycleText[cycle]}</span>
        </p>
      </div>

      <div className="text-right flex-shrink-0 ml-4 hidden sm:block">
        <p className="text-md font-semibold text-gray-900">
          {new Date(nextBillDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <p className={`text-sm font-medium ${daysLeftInfo.color}`}>
          {daysLeftInfo.text}
        </p>
      </div>

      <div className="flex flex-row ml-2 sm:ml-4 items-center">
        <button
            onClick={(e) => { e.stopPropagation(); onEdit(subscription); }}
            className="text-gray-400 hover:text-indigo-600 p-2"
            aria-label="Edit Subscription"
        >
            <Pencil size={18} />
        </button>

        {managementUrl && (
          <a
            href={managementUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-indigo-600 p-2 hidden sm:block"
            onClick={(e) => e.stopPropagation()}
            aria-label="Manage Subscription"
          >
            <ExternalLink size={18} />
          </a>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          className="text-gray-400 hover:text-red-600 p-2"
          aria-label="Delete Subscription"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
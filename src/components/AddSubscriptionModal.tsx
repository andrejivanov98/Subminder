// src/components/AddSubscriptionModal.tsx
import { useState, useEffect, type FormEvent } from "react";
import { X } from "lucide-react";
import type {
  SubscriptionFormData,
  SubscriptionCycle,
  SubscriptionCategory,
  Subscription,
  Currency,
} from "../types";
import { db, collection, addDoc, doc, updateDoc, Timestamp } from "../firebase";

const getTodayDate = () => new Date().toISOString().split("T")[0];

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialData?: Subscription | null;
}

const CATEGORIES: SubscriptionCategory[] = [
  "Entertainment",
  "Work",
  "Health",
  "Utility",
  "Other",
];
const CYCLES: SubscriptionCycle[] = ["monthly", "yearly", "weekly"];
const CURRENCIES: Currency[] = ["USD", "EUR", "MKD", "GBP"];

export default function AddSubscriptionModal({
  isOpen,
  onClose,
  userId,
  initialData,
}: AddSubscriptionModalProps) {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    serviceName: "",
    cost: 0,
    currency: "EUR",
    nextBillDate: getTodayDate(),
    cycle: "monthly",
    category: "Entertainment",
    managementUrl: "",
    reminderDays: 3,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          serviceName: initialData.serviceName,
          cost: initialData.cost,
          currency: initialData.currency || "EUR",
          nextBillDate: initialData.nextBillDate,
          cycle: initialData.cycle,
          category: initialData.category,
          managementUrl: initialData.managementUrl || "",
          reminderDays: initialData.reminderDays || 3,
        });
      } else {
        setFormData({
          serviceName: "",
          cost: 0,
          currency: "EUR",
          nextBillDate: getTodayDate(),
          cycle: "monthly",
          category: "Entertainment",
          managementUrl: "",
          reminderDays: 3,
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.serviceName || formData.cost <= 0 || !formData.nextBillDate) {
      alert("Please fill out all required fields with valid values.");
      return;
    }

    setIsSubmitting(true);

    try {
      const dateString = formData.nextBillDate;
      const parts = dateString.split("-").map((p) => parseInt(p, 10));
      const utcDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));

      const dataToSave = {
        ...formData,
        nextBillDate: Timestamp.fromDate(utcDate),
      };

      if (initialData) {
        const subRef = doc(
          db,
          "users",
          userId,
          "subscriptions",
          initialData.id
        );
        await updateDoc(subRef, dataToSave);
      } else {
        const subsCollection = collection(db, "users", userId, "subscriptions");
        await addDoc(subsCollection, dataToSave);
      }

      onClose();
    } catch (error) {
      console.error("Error saving subscription:", error);
      alert("Failed to save subscription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "cost" || name === "reminderDays" ? parseFloat(value) : value,
    }));
  };

  // Reusable input classes
  const inputClass =
    "mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
  const labelClass =
    "block text-xs font-medium text-zinc-400 uppercase tracking-wide";

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex justify-between items-center p-5 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">
              {initialData ? "Edit Subscription" : "Add Subscription"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
            <div>
              <label className={labelClass}>Service Name</label>
              <input
                type="text"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g., Netflix"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Cost</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="cost"
                  value={formData.cost || ""}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="9.99"
                  required
                />
              </div>
              <div className="col-span-1">
                <label className={labelClass}>Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Cycle</label>
                <select
                  name="cycle"
                  value={formData.cycle}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {CYCLES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Remind Me</label>
                <select
                  name="reminderDays"
                  value={formData.reminderDays}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="1">1 day before</option>
                  <option value="3">3 days before</option>
                  <option value="7">1 week before</option>
                  <option value="14">2 weeks before</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Next Bill Date</label>
              <input
                type="date"
                name="nextBillDate"
                value={formData.nextBillDate}
                onChange={handleChange}
                className={`${inputClass} [color-scheme:dark]`}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Management URL (Optional)</label>
              <input
                type="url"
                name="managementUrl"
                value={formData.managementUrl}
                onChange={handleChange}
                className={inputClass}
                placeholder="https://netflix.com/account"
              />
            </div>
          </div>

          <div className="flex justify-end p-5 bg-zinc-900 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 bg-transparent border border-zinc-700 rounded-lg text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:bg-indigo-500/50 transition-all shadow-lg shadow-indigo-900/20"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? initialData
                  ? "Updating..."
                  : "Saving..."
                : initialData
                ? "Update"
                : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

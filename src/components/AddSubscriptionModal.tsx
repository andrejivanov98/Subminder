import { useState, useEffect, type FormEvent } from "react";
import { X } from "lucide-react";
import type {
  SubscriptionFormData,
  SubscriptionCycle,
  SubscriptionCategory,
  Subscription,
  Currency, // Import Currency
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
const CURRENCIES: Currency[] = ["USD", "EUR", "MKD", "GBP"]; // Available options

export default function AddSubscriptionModal({
  isOpen,
  onClose,
  userId,
  initialData,
}: AddSubscriptionModalProps) {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    serviceName: "",
    cost: 0,
    currency: "EUR", // Default currency
    nextBillDate: getTodayDate(),
    cycle: "monthly",
    category: "Entertainment",
    managementUrl: "",
    reminderDays: 3,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- EFFECT: Pre-fill form if editing ---
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit Mode: Populate fields
        setFormData({
          serviceName: initialData.serviceName,
          cost: initialData.cost,
          currency: initialData.currency || "EUR", // Handle legacy data
          nextBillDate: initialData.nextBillDate,
          cycle: initialData.cycle,
          category: initialData.category,
          managementUrl: initialData.managementUrl || "",
          reminderDays: initialData.reminderDays || 3,
        });
      } else {
        // Add Mode: Reset to default
        setFormData({
          serviceName: "",
          cost: 0,
          currency: "EUR", // Default
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

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.serviceName || formData.cost <= 0 || !formData.nextBillDate) {
      alert("Please fill out all required fields with valid values.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Timezone Fix
      const dateString = formData.nextBillDate;
      const parts = dateString.split("-").map((p) => parseInt(p, 10));
      const utcDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));

      const dataToSave = {
        ...formData,
        nextBillDate: Timestamp.fromDate(utcDate),
        // reminderDays and currency are already in ...formData
      };

      if (initialData) {
        // --- UPDATE EXISTING ---
        const subRef = doc(
          db,
          "users",
          userId,
          "subscriptions",
          initialData.id
        );
        await updateDoc(subRef, dataToSave);
        console.log("Subscription updated!");
      } else {
        // --- CREATE NEW ---
        const subsCollection = collection(db, "users", userId, "subscriptions");
        await addDoc(subsCollection, dataToSave);
        console.log("Subscription added!");
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
      // Parse numbers for cost AND reminderDays
      [name]:
        name === "cost" || name === "reminderDays" ? parseFloat(value) : value,
    }));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">
              {initialData ? "Edit Subscription" : "Add Subscription"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Name
              </label>
              <input
                type="text"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="e.g., Netflix"
                required
              />
            </div>

            {/* --- UPDATED COST SECTION WITH CURRENCY --- */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="cost"
                  value={formData.cost || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  placeholder="9.99"
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
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
                <label className="block text-sm font-medium text-gray-700">
                  Cycle
                </label>
                <select
                  name="cycle"
                  value={formData.cycle}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                >
                  {CYCLES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Remind Me
                </label>
                <select
                  name="reminderDays"
                  value={formData.reminderDays}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="1">1 day before</option>
                  <option value="3">3 days before</option>
                  <option value="7">1 week before</option>
                  <option value="14">2 weeks before</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Next Bill Date
              </label>
              <input
                type="date"
                name="nextBillDate"
                value={formData.nextBillDate}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Management URL (Optional)
              </label>
              <input
                type="url"
                name="managementUrl"
                value={formData.managementUrl}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="https://netflix.com/account"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-4 bg-gray-50 border-t rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? initialData
                  ? "Updating..."
                  : "Saving..."
                : initialData
                ? "Update Subscription"
                : "Save Subscription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

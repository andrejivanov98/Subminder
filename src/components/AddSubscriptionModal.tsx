import { useState, useEffect, type FormEvent } from "react";
import { X, ChevronDown } from "lucide-react";
import type {
  SubscriptionFormData,
  SubscriptionCycle,
  SubscriptionCategory,
  Subscription,
} from "../types";
import {
  db,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "../firebase";
import AlertModal from "./AlertModal";

const getTodayDate = () => new Date().toISOString().split("T")[0];

// Helper to calculate date based on cycle
const calculateNextDate = (cycle: SubscriptionCycle) => {
  const date = new Date();
  if (cycle === "weekly") {
    date.setDate(date.getDate() + 7);
  } else if (cycle === "monthly") {
    date.setMonth(date.getMonth() + 1);
  } else if (cycle === "yearly") {
    date.setFullYear(date.getFullYear() + 1);
  }
  return date.toISOString().split("T")[0];
};

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

// Order: Weekly -> Monthly -> Yearly
const CYCLES: SubscriptionCycle[] = ["weekly", "monthly", "yearly"];

export default function AddSubscriptionModal({
  isOpen,
  onClose,
  userId,
  initialData,
}: AddSubscriptionModalProps) {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    serviceName: "",
    cost: 0,
    currency: "USD",
    nextBillDate: getTodayDate(),
    cycle: "monthly",
    category: "Entertainment",
    managementUrl: "",
    reminderDays: 3,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFree, setIsFree] = useState(false);

  const [confirmAction, setConfirmAction] = useState<
    "delete" | "extend" | null
  >(null);

  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: "", message: "" });

  const showAlert = (title: string, message: string) => {
    setAlertState({ isOpen: true, title, message });
  };

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    if (isOpen) {
      setConfirmAction(null);
      if (initialData) {
        setFormData({
          serviceName: initialData.serviceName,
          cost: initialData.cost,
          currency: "USD",
          nextBillDate: initialData.nextBillDate,
          cycle: initialData.cycle,
          category: initialData.category,
          managementUrl: initialData.managementUrl || "",
          reminderDays: initialData.reminderDays ?? 3,
        });
        setIsFree(initialData.cost === 0);
      } else {
        setFormData({
          serviceName: "",
          cost: 0,
          currency: "USD",
          nextBillDate: calculateNextDate("monthly"),
          cycle: "monthly",
          category: "Entertainment",
          managementUrl: "",
          reminderDays: 3,
        });
        setIsFree(false);
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isFree) {
      setFormData((prev) => ({ ...prev, cost: 0 }));
    }
  }, [isFree]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !formData.serviceName ||
      (!isFree && formData.cost <= 0) ||
      !formData.nextBillDate
    ) {
      showAlert(
        "Invalid Fields",
        "Please fill out all required fields. Cost must be greater than 0 unless 'Free / Trial' is selected."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const dateString = formData.nextBillDate;
      const parts = dateString.split("-").map((p) => parseInt(p, 10));
      const utcDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));

      const dataToSave = {
        ...formData,
        cost: isFree ? 0 : formData.cost,
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
      showAlert("Error", "Failed to save subscription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updates: Record<string, string | number> = { [name]: value };

      if (name === "cost" || name === "reminderDays") {
        updates[name] = parseFloat(value);
      }

      if (name === "cycle") {
        const newCycle = value as SubscriptionCycle;
        if (CYCLES.includes(newCycle)) {
          updates.nextBillDate = calculateNextDate(newCycle);
        }
      }

      return { ...prev, ...updates } as SubscriptionFormData;
    });
  };

  const handleDelete = async () => {
    if (!initialData) return;
    setIsSubmitting(true);
    try {
      const docRef = doc(db, "users", userId, "subscriptions", initialData.id);
      await deleteDoc(docRef);
      onClose();
    } catch (error) {
      console.error("Error deleting subscription:", error);
      showAlert("Error", "Failed to delete subscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtend = async () => {
    if (!initialData) return;
    setIsSubmitting(true);

    try {
      const currentNextBill = new Date(initialData.nextBillDate);
      const newNextBill = new Date(currentNextBill);

      if (initialData.cycle === "monthly") {
        newNextBill.setMonth(newNextBill.getMonth() + 1);
      } else if (initialData.cycle === "yearly") {
        newNextBill.setFullYear(newNextBill.getFullYear() + 1);
      } else if (initialData.cycle === "weekly") {
        newNextBill.setDate(newNextBill.getDate() + 7);
      }

      const subRef = doc(db, "users", userId, "subscriptions", initialData.id);
      await updateDoc(subRef, {
        nextBillDate: Timestamp.fromDate(newNextBill),
      });

      onClose();
    } catch (error) {
      console.error("Error extending subscription:", error);
      showAlert("Error", "Failed to extend subscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass =
    "block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider";
  const inputClass =
    "w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600 transition-all";
  // Special class for selects to hide default arrow and add padding
  const selectClass = `${inputClass} appearance-none pr-10 cursor-pointer`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <AlertModal
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />

      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85dvh] overflow-hidden">
        {confirmAction && (
          <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <h3 className="text-xl font-bold text-white mb-2">
              {confirmAction === "delete"
                ? "Delete Subscription?"
                : "Extend Subscription?"}
            </h3>
            <p className="text-slate-400 mb-8 text-sm">
              {confirmAction === "delete"
                ? `Are you sure you want to delete ${formData.serviceName}? This action cannot be undone.`
                : `Are you sure you want to extend ${
                    formData.serviceName
                  }? This will advance the billing date by one ${formData.cycle.replace(
                    "ly",
                    ""
                  )}.`}
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={
                  confirmAction === "delete" ? handleDelete : handleExtend
                }
                className={`flex-1 py-3 rounded-xl text-white font-bold transition-colors shadow-lg ${
                  confirmAction === "delete"
                    ? "bg-red-600 hover:bg-red-500 shadow-red-900/20"
                    : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Processing..."
                  : confirmAction === "delete"
                  ? "Delete"
                  : "Extend"}
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center p-5 border-b border-slate-800 shrink-0">
          <h2 className="text-lg font-bold text-white">
            {initialData ? "Edit Subscription" : "Add Subscription"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          <form id="subForm" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Service Name</label>
              <input
                type="text"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Netflix"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={labelClass}>Cost</label>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setIsFree(!isFree)}
                >
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isFree ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    Free / Trial
                  </span>
                  <div
                    className={`w-9 h-5 rounded-full p-1 transition-colors ${
                      isFree ? "bg-emerald-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${
                        isFree ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="relative">
                <span
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                    isFree ? "text-slate-600" : "text-slate-500"
                  }`}
                >
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="cost"
                  value={formData.cost || ""}
                  onChange={handleChange}
                  disabled={isFree}
                  className={`${inputClass} pl-8 ${
                    isFree ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  placeholder="0.00"
                  required={!isFree}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Cycle</label>
                <div className="relative">
                  <select
                    name="cycle"
                    value={formData.cycle}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    {CYCLES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    size={16}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Remind Me</label>
                <div className="relative">
                  <select
                    name="reminderDays"
                    value={formData.reminderDays}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="1">1 day before</option>
                    <option value="3">3 days before</option>
                    <option value="7">1 week before</option>
                    <option value="14">2 weeks before</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    size={16}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Next Bill Date</label>
              {/* accent-blue-600 helps theme the native date picker controls on supported browsers */}
              <input
                type="date"
                name="nextBillDate"
                value={formData.nextBillDate}
                onChange={handleChange}
                className={`${inputClass} [color-scheme:dark] accent-blue-600`}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={selectClass}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  size={16}
                />
              </div>
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
          </form>
        </div>

        <div className="p-5 border-t border-slate-800 bg-slate-900 shrink-0 z-10 flex flex-col gap-3">
          <button
            form="subForm"
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
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

          {initialData && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction("extend")}
                className="py-3 bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 hover:bg-emerald-600/20 font-semibold rounded-xl transition-all active:scale-[0.98] text-sm"
                disabled={isSubmitting}
              >
                Extend
              </button>
              <button
                type="button"
                onClick={() => setConfirmAction("delete")}
                className="py-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-semibold rounded-xl transition-all active:scale-[0.98] text-sm"
                disabled={isSubmitting}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

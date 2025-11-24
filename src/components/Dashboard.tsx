import { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus,
  Wallet,
  CheckCircle2,
  User as UserIcon,
  LogIn,
  LogOut,
  ChevronDown,
  X,
} from "lucide-react";
import type { Subscription } from "../types";
import SubscriptionList from "./SubscriptionList";
import AddSubscriptionModal from "./AddSubscriptionModal";
import NotificationPrompt from "./NotificationPrompt";
import Logo from "./Logo";
import AlertModal from "./AlertModal";
import ConfirmModal from "./ConfirmModal";

import { googleProvider, auth } from "../firebase";
import {
  linkWithPopup,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";

const getTodayDate = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
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

  // UI States
  const [isLinkConfirmOpen, setIsLinkConfirmOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Alert & Confirm Modal States
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showAlert = (title: string, message: string) => {
    setAlertState({ isOpen: true, title, message });
  };

  const handleUserIconClick = () => {
    if (user?.isAnonymous) {
      // If guest, go straight to link flow
      setIsLinkConfirmOpen(true);
    } else {
      // If registered, toggle menu
      setIsUserMenuOpen(!isUserMenuOpen);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const confirmLinkAccount = async () => {
    if (!user) return;

    try {
      // 1. Try to LINK the current guest session to Google
      await linkWithPopup(user, googleProvider);
      setIsLinkConfirmOpen(false);
      showAlert(
        "Account Linked",
        "Success! Your subscriptions are now saved to your Google account."
      );
    } catch (error) {
      console.error("Auth Action Error:", error);
      setIsLinkConfirmOpen(false);

      // 2. If Link fails because account exists, offer to LOGIN
      if (
        error instanceof FirebaseError &&
        error.code === "auth/credential-already-in-use"
      ) {
        setConfirmState({
          isOpen: true,
          title: "Account Already Exists",
          message:
            "This Google account is already registered. Do you want to log in with it instead? \n\n(Note: Current guest data will be replaced by your saved account data).",
          onConfirm: async () => {
            setConfirmState((prev) => ({ ...prev, isOpen: false }));
            try {
              // Switch to the existing user
              await signInWithPopup(auth, googleProvider);
            } catch (loginError) {
              console.error("Login Error:", loginError);
              showAlert(
                "Login Failed",
                "Could not log in to your Google account."
              );
            }
          },
        });
      } else {
        showAlert(
          "Link Failed",
          "Failed to connect to Google. Please try again."
        );
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
    let total = 0;

    subscriptions.forEach((sub) => {
      if (sub.cycle === "monthly") total += sub.cost;
      else if (sub.cycle === "yearly") total += sub.cost / 12;
      else if (sub.cycle === "weekly") total += sub.cost * 4;
    });

    const totalString = `$${total.toFixed(2)}`;

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

    const daysDisplay = upcoming
      ? daysLeft < 0
        ? "Overdue"
        : `${daysLeft} days`
      : "-";

    return {
      totalMonthlyDisplay: totalString,
      upcomingBill: {
        name: upcoming?.serviceName || "N/A",
        days: daysDisplay,
        costDisplay: upcoming ? `$${upcoming.cost.toFixed(2)}` : "0.00",
      },
    };
  }, [subscriptions]);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 pt-safe px-6 pb-4">
        <div className="flex justify-between items-center mb-6 mt-2">
          <div className="flex flex-col">
            <div className="mb-2">
              <Logo className="h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              My Subscriptions
            </h1>
          </div>

          {/* User Profile Section */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={handleUserIconClick}
              className={`relative p-1 rounded-full transition-all flex items-center gap-1 group ${
                user?.isAnonymous
                  ? "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  : "hover:opacity-80"
              }`}
              aria-label="User Account"
              title={
                user?.isAnonymous
                  ? "Guest Account"
                  : `Signed in as ${user?.displayName}`
              }
            >
              {user?.photoURL ? (
                // REGISTERED
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border-2 border-slate-800 object-cover"
                />
              ) : (
                // GUEST
                <div className="p-1.5">
                  <UserIcon size={22} />
                  {user?.isAnonymous && (
                    <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-amber-500 border-2 border-slate-950 rounded-full"></span>
                  )}
                </div>
              )}

              {!user?.isAnonymous && (
                <ChevronDown
                  size={14}
                  className={`text-slate-400 mr-1 transition-transform duration-200 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && !user?.isAnonymous && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 z-50">
                <div className="p-4 border-b border-slate-800 bg-slate-800/30">
                  <p className="text-white font-bold text-sm truncate">
                    {user?.displayName || "User"}
                  </p>
                  <p className="text-slate-400 text-xs truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Guest Mode Banner */}
        {user?.isAnonymous && (
          <div
            onClick={() => setIsLinkConfirmOpen(true)}
            className="mb-6 flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 cursor-pointer hover:bg-indigo-500/20 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-full text-white shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform">
                <LogIn size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-200">
                  Guest Account
                </p>
                <p className="text-[10px] text-indigo-300">
                  Tap to link Google & save data
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-lg shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-blue-100 text-sm font-medium mb-1">
              <Wallet size={16} />
              <span>Total Monthly Spend</span>
            </div>
            <div className="text-4xl font-bold text-white tracking-tight">
              {totalMonthlyDisplay}
            </div>
            <div className="mt-4 flex justify-between items-end">
              <div className="flex items-center text-xs text-blue-200 bg-white/10 w-fit px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                <CheckCircle2 size={12} className="mr-1" />
                {subscriptions.length} Active
              </div>

              {upcomingBill.name !== "N/A" && (
                <div className="text-right">
                  <p className="text-xs text-blue-200">
                    Next: {upcomingBill.name}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {upcomingBill.costDisplay}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 mt-4">
        <NotificationPrompt userId={userId} />

        <SubscriptionList
          subscriptions={subscriptions}
          userId={userId}
          onEdit={handleEditClick}
        />
      </div>

      {/* FAB */}
      <div className="fixed bottom-24 right-6 z-40">
        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-500 text-white w-14 h-14 rounded-full shadow-xl shadow-blue-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* Modals */}
      <AddSubscriptionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userId={userId}
        initialData={editingSubscription}
      />

      <AlertModal
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Log In"
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Link Account Modal */}
      {isLinkConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setIsLinkConfirmOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-600/10 p-3 rounded-full mb-4">
                <LogIn size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Link Google Account
              </h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Don't lose your data! Link your Google account to access your
                subscriptions from any device and ensure your data is backed up.
              </p>

              <button
                onClick={confirmLinkAccount}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-900/20 mb-3"
              >
                Link with Google
              </button>
              <button
                onClick={() => setIsLinkConfirmOpen(false)}
                className="w-full py-3 bg-transparent text-slate-400 hover:text-white font-medium transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

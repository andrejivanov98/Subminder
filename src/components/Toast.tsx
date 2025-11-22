// src/components/Toast.tsx
import { Bell, X } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  title: string;
  body: string;
  onClose: () => void;
}

export default function Toast({ title, body, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-[60] w-full max-w-sm bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl shadow-2xl p-4 animate-in slide-in-from-top-2">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <Bell className="h-5 w-5 text-indigo-500" />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs text-zinc-400">{body}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="bg-transparent rounded-md inline-flex text-zinc-500 hover:text-white focus:outline-none"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

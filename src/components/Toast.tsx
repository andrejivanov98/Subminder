import { Bell, X } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  title: string;
  body: string;
  onClose: () => void;
}

export default function Toast({ title, body, onClose }: ToastProps) {
  // Automatically close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm bg-white rounded-lg shadow-lg border-l-4 border-indigo-600 p-4 animate-in slide-in-from-right">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <Bell className="h-6 w-6 text-indigo-600" />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="mt-1 text-sm text-gray-500">{body}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

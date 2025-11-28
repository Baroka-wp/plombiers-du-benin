"use client";

import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-6 h-6 text-green-500" />,
    error: <XCircle className="w-6 h-6 text-red-500" />,
    info: <AlertCircle className="w-6 h-6 text-blue-500" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  const textColors = {
    success: "text-green-900",
    error: "text-red-900",
    info: "text-blue-900",
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
      <div className={`${bgColors[type]} border rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[300px] max-w-md`}>
        {icons[type]}
        <p className={`${textColors[type]} flex-1 font-medium text-sm`}>{message}</p>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}


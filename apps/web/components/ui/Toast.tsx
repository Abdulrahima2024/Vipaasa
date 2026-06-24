"use client";

import React, { useEffect, useState } from "react";
import { X, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useToastStore } from "../../store/useToastStore";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-[420px] z-[99999] flex flex-col gap-3 pointer-events-none font-sans">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClass = "";
        let bgClass = "";
        let textClass = "";
        let iconColor = "";

        if (toast.type === "success") {
          Icon = CheckCircle2;
          bgClass = "bg-[#F3FAF0]";
          borderClass = "border-[#E1F0DA]";
          textClass = "text-[#113C27]";
          iconColor = "text-[#2D6A4F]";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          bgClass = "bg-[#FFF9EE]";
          borderClass = "border-[#FCE4B6]";
          textClass = "text-[#8A5B00]";
          iconColor = "text-[#F5A623]";
        } else if (toast.type === "error") {
          Icon = X;
          bgClass = "bg-[#FFF5F5]";
          borderClass = "border-[#FED7D7]";
          textClass = "text-[#9B2C2C]";
          iconColor = "text-[#E53E3E]";
        } else {
          Icon = Info;
          bgClass = "bg-[#F7FAFC]";
          borderClass = "border-[#E2E8F0]";
          textClass = "text-[#2D3748]";
          iconColor = "text-[#3182CE]";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border shadow-xl shadow-slate-900/5 transition-all duration-300 animate-local-slide-in-right ${bgClass} ${borderClass} ${textClass}`}
            role="alert"
          >
            <div className="flex-shrink-0 mt-0.5">
              <Icon className={`w-5 h-5 ${iconColor} stroke-[2.5]`} />
            </div>
            
            <div className="flex-1 text-sm font-semibold leading-relaxed">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-2 p-1 rounded-xl hover:bg-black/5 transition-colors text-current opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

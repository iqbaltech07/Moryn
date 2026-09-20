"use client";

import React from "react";
import { Info, AlertTriangle, CheckCircle2, AlertOctagon, Sparkles } from "lucide-react";

export type CalloutType = "info" | "warning" | "success" | "error" | "tip";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export const Callout: React.FC<CalloutProps> = ({ type = "info", title, children }) => {
  const config = {
    info: {
      icon: Info,
      border: "border-blue-200",
      bg: "bg-blue-50/70",
      text: "text-blue-600",
      titleColor: "text-blue-900",
      defaultTitle: "Note",
    },
    warning: {
      icon: AlertTriangle,
      border: "border-amber-200",
      bg: "bg-amber-50/70",
      text: "text-amber-600",
      titleColor: "text-amber-900",
      defaultTitle: "Warning",
    },
    success: {
      icon: CheckCircle2,
      border: "border-emerald-200",
      bg: "bg-emerald-50/70",
      text: "text-emerald-600",
      titleColor: "text-emerald-900",
      defaultTitle: "Success",
    },
    error: {
      icon: AlertOctagon,
      border: "border-rose-200",
      bg: "bg-rose-50/70",
      text: "text-rose-600",
      titleColor: "text-rose-900",
      defaultTitle: "Important",
    },
    tip: {
      icon: Sparkles,
      border: "border-orange-200",
      bg: "bg-orange-50/70",
      text: "text-[#e15b39]",
      titleColor: "text-orange-950",
      defaultTitle: "Tip",
    },
  }[type] || {
    icon: Info,
    border: "border-blue-200",
    bg: "bg-blue-50/70",
    text: "text-blue-600",
    titleColor: "text-blue-900",
    defaultTitle: "Note",
  };

  const IconComponent = config.icon;

  return (
    <div className={`my-3.5 rounded-lg border ${config.border} ${config.bg} p-3.5 shadow-xs`}>
      <div className="flex items-center gap-2 mb-1.5 font-bold text-xs uppercase tracking-wider">
        <IconComponent className={`w-4 h-4 ${config.text}`} />
        <span className={config.titleColor}>{title || config.defaultTitle}</span>
      </div>
      <div className="text-xs sm:text-[13px] text-zinc-800 leading-relaxed space-y-1.5">
        {children}
      </div>
    </div>
  );
};

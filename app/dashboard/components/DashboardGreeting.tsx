"use client";

import { useState } from "react";

interface DashboardGreetingProps {
  userName?: string | null;
}

export default function DashboardGreeting({ userName }: DashboardGreetingProps) {
  const [salutation] = useState(() => {
    if (typeof window === "undefined") return "Good morning";
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    return "Good evening";
  });

  const displayName = userName ? userName.trim().split(" ")[0] : "Iqbal";

  return (
    <div className="mt-2 mb-8">
      <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-neutral-900 tracking-[-0.03em] leading-tight">
        {salutation}, {displayName}.
      </h1>
      <p className="text-base text-neutral-500 font-normal mt-1.5 leading-relaxed">
        What are you building today?
      </p>
    </div>
  );
}

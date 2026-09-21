"use client";

import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n";

interface DashboardGreetingProps {
  userName?: string | null;
}

export default function DashboardGreeting({ userName }: DashboardGreetingProps) {
  const { t } = useTranslation();

  const salutation = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t.dashboard.greetingMorning;
    if (hour >= 12 && hour < 18) return t.dashboard.greetingAfternoon;
    return t.dashboard.greetingEvening;
  }, [t]);

  const displayName = userName ? userName.trim().split(" ")[0] : "Iqbal";

  return (
    <div className="mt-2 mb-8">
      <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-neutral-900 tracking-[-0.03em] leading-tight">
        {salutation}, {displayName}.
      </h1>
      <p className="text-base text-neutral-500 font-normal mt-1.5 leading-relaxed">
        {t.dashboard.greetingSub}
      </p>
    </div>
  );
}

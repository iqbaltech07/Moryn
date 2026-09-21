"use client";

import React from "react";

export interface MetricCardsProps {
  title?: string;
  subtitle?: string;
  metrics?: Array<{
    label: string;
    amount: number;
    change: string;
  }>;
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(2).replace(/\.00$/, "")} M`;
  }
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(2).replace(/\.00$/, "")} Jt`;
  }
  if (amount >= 100000) {
    return `Rp ${Math.round(amount / 1000)} Rb`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

/**
 * MetricCards - Streamlined Metric KPI Cards (Anti-Slop Compliant)
 */
export function MetricCards({
  title = "System Financial Metrics",
  subtitle = "Streamlined, human-designed interface with zero slop",
  metrics = [
    { label: "Total Revenue", amount: 1450000000, change: "+12.4%" },
    { label: "Active Subscriptions", amount: 28500000, change: "+5.1%" },
    { label: "Pending Transfers", amount: 450000, change: "-2.0%" },
  ],
}: MetricCardsProps) {
  return (
    <div className="w-full bg-[#090A0C] text-[#F3F4F6] p-6 space-y-6 font-sans rounded-xl border border-[#222634]">
      <header className="space-y-1 max-w-prose">
        <h3 className="text-xl font-bold tracking-tight text-[#F3F4F6]">{title}</h3>
        <p className="text-xs text-[#9CA3AF]">{subtitle}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#121318] hover:bg-[#181A22] transition-colors p-4 rounded-md space-y-2 border border-[#222634]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-medium text-[#6B7280]">
                {item.label}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] font-mono">
                {item.change}
              </span>
            </div>
            <p className="text-xl font-bold font-mono tracking-tight text-[#F3F4F6]">
              {formatCompactCurrency(item.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MetricCards;

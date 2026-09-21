"use client";

import React from "react";

export interface DataRow {
  id: string;
  name: string;
  category: string;
  amount: number;
  status: "active" | "pending" | "failed";
  updatedAt: string;
}

export interface DataTableProps {
  title?: string;
  data?: DataRow[];
}

/**
 * DataTable - Utilitarian Data Table (Anti-Slop Compliant)
 */
export function DataTable({
  title = "Transaction Audit Log",
  data = [
    { id: "TX-9041", name: "Enterprise API Subscription", category: "Billing", amount: 14500000, status: "active", updatedAt: "2026-08-12" },
    { id: "TX-9042", name: "Upstash Redis Pool Cache", category: "Infrastructure", amount: 3200000, status: "active", updatedAt: "2026-08-11" },
    { id: "TX-9043", name: "AI SDK Token Consumption", category: "Compute", amount: 850000, status: "pending", updatedAt: "2026-08-10" },
  ],
}: DataTableProps) {
  return (
    <div className="w-full bg-[#090A0C] text-[#F3F4F6] p-6 space-y-4 font-sans rounded-xl border border-[#222634]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold tracking-tight text-[#F3F4F6]">{title}</h3>
        <span className="text-xs font-mono text-[#6B7280]">Total: {data.length} records</span>
      </div>

      <div className="w-full overflow-x-auto rounded-md border border-[#222634]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#121318] text-[#9CA3AF] uppercase tracking-wider font-mono border-b border-[#222634]">
            <tr>
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">Name</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222634]/60 bg-[#090A0C]">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-[#121318] transition-colors">
                <td className="py-2.5 px-3 font-mono text-[#9CA3AF]">{row.id}</td>
                <td className="py-2.5 px-3 font-medium text-[#F3F4F6]">{row.name}</td>
                <td className="py-2.5 px-3 text-[#9CA3AF]">{row.category}</td>
                <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#F3F4F6]">
                  Rp {(row.amount / 1000000).toFixed(2)} Jt
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono capitalize ${
                      row.status === "active"
                        ? "bg-[#10B981]/10 text-[#10B981]"
                        : "bg-[#F59E0B]/10 text-[#F59E0B]"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-[#6B7280]">{row.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;

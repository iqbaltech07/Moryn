"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTable = DataTable;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * DataTable - Utilitarian Data Table (Anti-Slop Compliant)
 */
function DataTable({ title = "Transaction Audit Log", data = [
    { id: "TX-9041", name: "Enterprise API Subscription", category: "Billing", amount: 14500000, status: "active", updatedAt: "2026-08-12" },
    { id: "TX-9042", name: "Upstash Redis Pool Cache", category: "Infrastructure", amount: 3200000, status: "active", updatedAt: "2026-08-11" },
    { id: "TX-9043", name: "AI SDK Token Consumption", category: "Compute", amount: 850000, status: "pending", updatedAt: "2026-08-10" },
], }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "w-full bg-[#090A0C] text-[#F3F4F6] p-6 space-y-4 font-sans rounded-xl border border-[#222634]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-base font-bold tracking-tight text-[#F3F4F6]", children: title }), (0, jsx_runtime_1.jsxs)("span", { className: "text-xs font-mono text-[#6B7280]", children: ["Total: ", data.length, " records"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "w-full overflow-x-auto rounded-md border border-[#222634]", children: (0, jsx_runtime_1.jsxs)("table", { className: "w-full text-left text-xs", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-[#121318] text-[#9CA3AF] uppercase tracking-wider font-mono border-b border-[#222634]", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { className: "py-2.5 px-3", children: "ID" }), (0, jsx_runtime_1.jsx)("th", { className: "py-2.5 px-3", children: "Name" }), (0, jsx_runtime_1.jsx)("th", { className: "py-2.5 px-3", children: "Category" }), (0, jsx_runtime_1.jsx)("th", { className: "py-2.5 px-3 text-right", children: "Amount" }), (0, jsx_runtime_1.jsx)("th", { className: "py-2.5 px-3 text-center", children: "Status" }), (0, jsx_runtime_1.jsx)("th", { className: "py-2.5 px-3", children: "Updated" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "divide-y divide-[#222634]/60 bg-[#090A0C]", children: data.map((row) => ((0, jsx_runtime_1.jsxs)("tr", { className: "hover:bg-[#121318] transition-colors", children: [(0, jsx_runtime_1.jsx)("td", { className: "py-2.5 px-3 font-mono text-[#9CA3AF]", children: row.id }), (0, jsx_runtime_1.jsx)("td", { className: "py-2.5 px-3 font-medium text-[#F3F4F6]", children: row.name }), (0, jsx_runtime_1.jsx)("td", { className: "py-2.5 px-3 text-[#9CA3AF]", children: row.category }), (0, jsx_runtime_1.jsxs)("td", { className: "py-2.5 px-3 text-right font-mono font-semibold text-[#F3F4F6]", children: ["Rp ", (row.amount / 1000000).toFixed(2), " Jt"] }), (0, jsx_runtime_1.jsx)("td", { className: "py-2.5 px-3 text-center", children: (0, jsx_runtime_1.jsx)("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono capitalize ${row.status === "active"
                                                ? "bg-[#10B981]/10 text-[#10B981]"
                                                : "bg-[#F59E0B]/10 text-[#F59E0B]"}`, children: row.status }) }), (0, jsx_runtime_1.jsx)("td", { className: "py-2.5 px-3 font-mono text-[#6B7280]", children: row.updatedAt })] }, row.id))) })] }) })] }));
}
exports.default = DataTable;

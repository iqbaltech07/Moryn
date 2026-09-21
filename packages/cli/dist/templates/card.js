"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCompactCurrency = formatCompactCurrency;
exports.MetricCards = MetricCards;
const jsx_runtime_1 = require("react/jsx-runtime");
function formatCompactCurrency(amount) {
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
function MetricCards({ title = "System Financial Metrics", subtitle = "Streamlined, human-designed interface with zero slop", metrics = [
    { label: "Total Revenue", amount: 1450000000, change: "+12.4%" },
    { label: "Active Subscriptions", amount: 28500000, change: "+5.1%" },
    { label: "Pending Transfers", amount: 450000, change: "-2.0%" },
], }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "w-full bg-[#090A0C] text-[#F3F4F6] p-6 space-y-6 font-sans rounded-xl border border-[#222634]", children: [(0, jsx_runtime_1.jsxs)("header", { className: "space-y-1 max-w-prose", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-bold tracking-tight text-[#F3F4F6]", children: title }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-[#9CA3AF]", children: subtitle })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: metrics.map((item, idx) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-[#121318] hover:bg-[#181A22] transition-colors p-4 rounded-md space-y-2 border border-[#222634]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[10px] uppercase tracking-wider font-medium text-[#6B7280]", children: item.label }), (0, jsx_runtime_1.jsx)("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] font-mono", children: item.change })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xl font-bold font-mono tracking-tight text-[#F3F4F6]", children: formatCompactCurrency(item.amount) })] }, idx))) })] }));
}
exports.default = MetricCards;

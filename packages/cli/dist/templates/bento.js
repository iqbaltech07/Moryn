"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BentoGrid = BentoGrid;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * BentoGrid - Asymmetric Feature Grid (Anti-Slop Compliant)
 */
function BentoGrid({ title = "Architectural Pillars" }) {
    return ((0, jsx_runtime_1.jsxs)("section", { className: "w-full bg-[#090A0C] text-[#F3F4F6] p-6 space-y-6 font-sans rounded-xl border border-[#222634]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-1 max-w-prose", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold tracking-tight text-[#F3F4F6]", children: title }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-[#9CA3AF]", children: "Designed for high-performance AI agent workflows." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "md:col-span-2 bg-[#121318] p-5 rounded-md space-y-3 border border-[#222634]", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[10px] font-mono uppercase tracking-wider text-[#6366F1]", children: "Pillar 01" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-base font-bold tracking-tight text-[#F3F4F6]", children: "3-Layer Context Architecture" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-[#9CA3AF] leading-relaxed", children: "Eliminates context truncation and cognitive overload by keeping static blueprints pinned at 15\u201325 KB while streaming dynamic schemas via MCP protocol." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-[#121318] p-5 rounded-md space-y-3 border border-[#222634]", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[10px] font-mono uppercase tracking-wider text-[#10B981]", children: "Pillar 02" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-base font-bold tracking-tight text-[#F3F4F6]", children: "AST Linter Engine" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-[#9CA3AF] leading-relaxed", children: "Static AST code analyzer that rejects gradient headline slop and over-nested cards." })] })] })] }));
}
exports.default = BentoGrid;

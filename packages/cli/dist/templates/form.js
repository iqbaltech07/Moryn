"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigForm = ConfigForm;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
/**
 * ConfigForm - Accessible Input Form (Anti-Slop Compliant)
 */
function ConfigForm({ title = "Project Configuration", onSubmit, }) {
    const [formData, setFormData] = (0, react_1.useState)({ appName: "Moryn Engine", environment: "production" });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit)
            onSubmit(formData);
    };
    return ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "w-full max-w-md mx-auto bg-[#121318] border border-[#222634] p-6 rounded-md space-y-4 font-sans text-left", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-bold tracking-tight text-[#F3F4F6]", children: title }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1.5", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]", children: "Application Name" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: formData.appName, onChange: (e) => setFormData({ ...formData, appName: e.currentTarget.value }), placeholder: "e.g. Moryn Engine", className: "w-full px-3 py-2 bg-[#090A0C] border border-[#222634] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#6366F1] transition-colors", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1.5", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]", children: "Target Environment" }), (0, jsx_runtime_1.jsxs)("select", { value: formData.environment, onChange: (e) => setFormData({ ...formData, environment: e.currentTarget.value }), className: "w-full px-3 py-2 bg-[#090A0C] border border-[#222634] rounded-md text-xs text-[#F3F4F6] focus:outline-none focus:border-[#6366F1] transition-colors", children: [(0, jsx_runtime_1.jsx)("option", { value: "production", children: "Production Edge" }), (0, jsx_runtime_1.jsx)("option", { value: "staging", children: "Staging Sandbox" }), (0, jsx_runtime_1.jsx)("option", { value: "development", children: "Local Development" })] })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "w-full py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium text-xs rounded-md transition-all", children: "Save Configuration" })] }));
}
exports.default = ConfigForm;

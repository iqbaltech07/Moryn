"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmModal = ConfirmModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
/**
 * ConfirmModal - Elevated Dialog Modal (Anti-Slop Compliant)
 */
function ConfirmModal({ isOpen: defaultOpen = true, title = "Confirm System Action", onClose, onConfirm, }) {
    const [open, setOpen] = (0, react_1.useState)(defaultOpen);
    const handleClose = () => {
        setOpen(false);
        if (onClose)
            onClose();
    };
    const handleConfirm = () => {
        setOpen(false);
        if (onConfirm)
            onConfirm();
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "w-full flex items-center justify-center p-4", children: open ? ((0, jsx_runtime_1.jsxs)("div", { className: "w-full max-w-sm bg-[#181A22] border border-[#222634] p-5 rounded-md shadow-2xl space-y-4 font-sans text-left", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between border-b border-[#222634] pb-3", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-sm font-bold tracking-tight text-[#F3F4F6]", children: title }), (0, jsx_runtime_1.jsx)("button", { onClick: handleClose, className: "text-[#6B7280] hover:text-[#F3F4F6] text-xs", children: "\u2715" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-[#9CA3AF] leading-relaxed", children: "Are you sure you want to proceed with this operation? This will synchronize all active Kanban tasks to the production database." }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-end gap-2 pt-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleClose, className: "px-3 py-1.5 bg-[#121318] hover:bg-[#090A0C] text-[#9CA3AF] text-xs rounded-md border border-[#222634]", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleConfirm, className: "px-3 py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium rounded-md", children: "Confirm Sync" })] })] })) : ((0, jsx_runtime_1.jsx)("button", { onClick: () => setOpen(true), className: "px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium rounded-md", children: "Re-open Dialog Modal Preview" })) }));
}
exports.default = ConfirmModal;

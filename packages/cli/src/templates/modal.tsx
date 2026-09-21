"use client";

import React, { useState } from "react";

export interface ConfirmModalProps {
  isOpen?: boolean;
  title?: string;
  onClose?: () => void;
  onConfirm?: () => void;
}

/**
 * ConfirmModal - Elevated Dialog Modal (Anti-Slop Compliant)
 */
export function ConfirmModal({
  isOpen: defaultOpen = true,
  title = "Confirm System Action",
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  const [open, setOpen] = useState(defaultOpen);

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const handleConfirm = () => {
    setOpen(false);
    if (onConfirm) onConfirm();
  };

  return (
    <div className="w-full flex items-center justify-center p-4">
      {open ? (
        <div className="w-full max-w-sm bg-[#181A22] border border-[#222634] p-5 rounded-md shadow-2xl space-y-4 font-sans text-left">
          <div className="flex items-center justify-between border-b border-[#222634] pb-3">
            <h4 className="text-sm font-bold tracking-tight text-[#F3F4F6]">{title}</h4>
            <button onClick={handleClose} className="text-[#6B7280] hover:text-[#F3F4F6] text-xs">✕</button>
          </div>

          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            Are you sure you want to proceed with this operation? This will synchronize all active Kanban tasks to the production database.
          </p>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleClose}
              className="px-3 py-1.5 bg-[#121318] hover:bg-[#090A0C] text-[#9CA3AF] text-xs rounded-md border border-[#222634]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-3 py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium rounded-md"
            >
              Confirm Sync
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium rounded-md"
        >
          Re-open Dialog Modal Preview
        </button>
      )}
    </div>
  );
}

export default ConfirmModal;

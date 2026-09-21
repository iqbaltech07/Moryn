"use client";

import React from "react";

interface InlineCodeProps {
  children?: React.ReactNode;
  className?: string;
}

export const InlineCode: React.FC<InlineCodeProps> = ({ children, className = "" }) => {
  return (
    <code
      className={`px-1.5 py-0.5 mx-0.5 text-[12px] font-mono rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200 tracking-tight inline-block select-all ${className}`}
    >
      {children}
    </code>
  );
};

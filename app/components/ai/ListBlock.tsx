"use client";

import React from "react";
import { CheckSquare, Square } from "lucide-react";

interface ListBlockProps {
  ordered?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const ListBlock: React.FC<ListBlockProps> = ({
  ordered = false,
  children,
  className = "",
}) => {
  if (ordered) {
    return (
      <ol className={`my-2.5 pl-5 list-decimal space-y-1.5 text-xs sm:text-sm text-zinc-800 ${className}`}>
        {children}
      </ol>
    );
  }
  return (
    <ul className={`my-2.5 pl-5 list-disc space-y-1.5 text-xs sm:text-sm text-zinc-800 ${className}`}>
      {children}
    </ul>
  );
};

export const ListItemBlock: React.FC<{ children?: React.ReactNode; checked?: boolean | null }> = ({
  children,
  checked = null,
}) => {
  if (checked !== null) {
    return (
      <li className="flex items-start gap-2 list-none -ml-4 my-1 text-xs sm:text-sm text-zinc-800">
        {checked ? (
          <CheckSquare className="w-4 h-4 text-[#e15b39] shrink-0 mt-0.5" />
        ) : (
          <Square className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
        )}
        <span className={checked ? "line-through text-zinc-400" : ""}>{children}</span>
      </li>
    );
  }

  return <li className="leading-relaxed text-zinc-800">{children}</li>;
};

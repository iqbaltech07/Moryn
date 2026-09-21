"use client";

import React from "react";
import { Link2 } from "lucide-react";

interface HeadingBlockProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children?: React.ReactNode;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ level, children }) => {
  const textContent = React.Children.toArray(children).join("");
  const id = textContent
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

  const styles = {
    1: "text-lg sm:text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-1.5 mt-5 mb-2.5 tracking-tight",
    2: "text-base sm:text-lg font-bold text-zinc-900 mt-4 mb-2 tracking-tight",
    3: "text-sm sm:text-base font-bold text-zinc-900 mt-3.5 mb-1.5",
    4: "text-xs sm:text-sm font-semibold text-zinc-900 mt-3 mb-1",
    5: "text-xs font-semibold text-zinc-800 mt-2 mb-1",
    6: "text-[11px] font-semibold text-zinc-700 mt-2 mb-1 uppercase tracking-wider",
  }[level];

  const content = (
    <>
      <span>{children}</span>
      {id && (
        <a
          href={`#${id}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-600"
          aria-label="Link to heading"
        >
          <Link2 className="w-3.5 h-3.5" />
        </a>
      )}
    </>
  );

  const className = `group flex items-center gap-2 ${styles}`;

  switch (level) {
    case 1:
      return <h1 id={id} className={className}>{content}</h1>;
    case 2:
      return <h2 id={id} className={className}>{content}</h2>;
    case 3:
      return <h3 id={id} className={className}>{content}</h3>;
    case 4:
      return <h4 id={id} className={className}>{content}</h4>;
    case 5:
      return <h5 id={id} className={className}>{content}</h5>;
    case 6:
      return <h6 id={id} className={className}>{content}</h6>;
    default:
      return <h2 id={id} className={className}>{content}</h2>;
  }
};

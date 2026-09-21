"use client";

import React from "react";

interface TableBlockProps {
  children?: React.ReactNode;
}

export const TableBlock: React.FC<TableBlockProps> = ({ children }) => {
  return (
    <div className="my-4 w-full overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-xs">
      <table className="w-full text-left text-xs sm:text-sm text-zinc-800 border-collapse">
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <thead className="bg-zinc-50 text-zinc-900 uppercase text-[11px] font-semibold tracking-wider border-b border-zinc-200 sticky top-0 backdrop-blur-md">
    {children}
  </thead>
);

export const TableBody: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-zinc-200 bg-white">
    {children}
  </tbody>
);

export const TableRow: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <tr className="hover:bg-zinc-50 transition-colors duration-150">
    {children}
  </tr>
);

export const TableCell: React.FC<{ children?: React.ReactNode; isHeader?: boolean }> = ({
  children,
  isHeader = false,
}) => {
  if (isHeader) {
    return <th className="px-4 py-2.5 font-bold text-zinc-900 whitespace-nowrap">{children}</th>;
  }
  return <td className="px-4 py-2 leading-relaxed text-zinc-800">{children}</td>;
};

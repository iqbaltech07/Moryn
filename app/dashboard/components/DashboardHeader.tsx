"use client";

import { Search, Menu } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

interface DashboardHeaderProps {
  userName?: string | null;
  userImage?: string | null;
  onOpenMobile?: () => void;
  onSearch?: (query: string) => void;
  onNewProject?: () => void;
}

export default function DashboardHeader({
  userName,
  userImage,
  onOpenMobile,
  onSearch,
  onNewProject,
}: DashboardHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { t } = useTranslation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const initial = userName ? userName.trim().charAt(0).toUpperCase() : "M";

  return (
    <header className="h-16 border-b border-transparent flex items-center justify-between px-6 lg:px-14">
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Expandable search on mobile/desktop if active */}
        {searchOpen && (
          <div className="relative animate-in fade-in zoom-in-95 duration-150">
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder={t.dashboard.searchProjects}
              autoFocus
              onBlur={() => {
                if (!searchValue) setSearchOpen(false);
              }}
              className="h-9 w-48 sm:w-64 pl-9 pr-3 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition"
            />
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
          </div>
        )}
      </div>

      {/* Right: Search, Notifications, Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {!searchOpen && (
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-white/80 transition-colors"
            aria-label="Search"
          >
            <Search size={18} strokeWidth={2} />
          </button>
        )}


        <button
          onClick={onNewProject}
          className="ml-1 inline-flex h-9 items-center rounded-lg bg-[#1D211F] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#343936] cursor-pointer"
        >
          {t.nav.newProject}
        </button>
      </div>
    </header>
  );
}

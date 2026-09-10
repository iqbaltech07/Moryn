"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Bell, Menu } from "lucide-react";
import { useState } from "react";

interface DashboardHeaderProps {
  userName?: string | null;
  userImage?: string | null;
  onOpenMobile?: () => void;
  onSearch?: (query: string) => void;
}

export default function DashboardHeader({
  userName,
  userImage,
  onOpenMobile,
  onSearch,
}: DashboardHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

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
              placeholder="Search projects..."
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
          className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-white/80 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={2} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E05A38]" />
        </button>

        {/* Profile Avatar link */}
        <Link
          href="/dashboard/settings?tab=account"
          className="ml-1 p-0.5 rounded-full hover:ring-2 hover:ring-neutral-900/10 transition"
          aria-label="Account Settings & Profile"
        >
          {userImage ? (
            <Image
              src={userImage}
              alt={userName || "Profile"}
              width={32}
              height={32}
              unoptimized
              className="w-8 h-8 rounded-full border border-neutral-200 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-700">
              {initial}
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}

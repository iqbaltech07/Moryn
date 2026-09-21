"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Menu, X, Sparkles, LayoutGrid } from "lucide-react";
import { useSession, signOut } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Changelog", href: "/changelog" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Leaderboard", href: "/#leaderboard" },
  { label: "Pricing", href: "/#pricing" },
];

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-[#fcfbf8]/90 backdrop-blur-md border-b border-[#141817]/8 shadow-[0_4px_20px_rgba(20,24,23,0.03)]"
        : "bg-[#fcfbf8]/70 backdrop-blur-sm border-b border-transparent"
        }`}
    >
      <nav className="max-w-[1240px] mx-auto px-6 md:px-8 h-18 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          id="nav-logo"
          className="flex items-center gap-2 group transition-transform duration-200 active:scale-98"
        >
          <Image
            src="/logo/Moryn-Light-Mode.webp"
            alt="Moryn"
            width={800}
            height={200}
            className="h-8 md:h-9 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden md:flex items-center gap-7 list-none m-0 p-0">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-[14px] font-medium text-[#4d5552] hover:text-[#141817] transition-colors tracking-[-0.01em]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Auth / Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {!isPending && !session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[14px] font-medium text-[#4d5552] hover:text-[#141817] px-3 py-2 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/dashboard"
                id="nav-cta-get-started"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#e85d3f] hover:bg-[#d84d2f] active:bg-[#c93e21] text-white text-[13.5px] font-semibold tracking-[-0.01em] shadow-[0_2px_8px_rgba(232,93,63,0.25)] hover:shadow-[0_4px_16px_rgba(232,93,63,0.32)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
              >
                Get Started
              </Link>
            </div>
          ) : session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#18181B] hover:bg-neutral-800 text-white text-[13px] font-medium tracking-[-0.01em] shadow-sm transition-all"
              >
                <LayoutGrid size={14} className="opacity-90" />
                <span>Dashboard</span>
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#141817]/10 transition"
                  aria-label="User menu"
                  aria-expanded={dropdownOpen}
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border border-[#141817]/10 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#f5f2ea] border border-[#141817]/10 flex items-center justify-center text-[#e85d3f] font-bold text-xs">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-[#141817]/8 shadow-[0_12px_36px_rgba(20,24,23,0.08)] overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-[#141817]/6 bg-[#fcfbf8]">
                        <p className="text-xs font-semibold text-[#141817] truncate m-0">
                          {session.user.name}
                        </p>
                        <p className="text-[11px] text-[#737b78] truncate mt-0.5 mb-0">
                          {session.user.email}
                        </p>
                      </div>

                      <div className="p-1.5">
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#4d5552] hover:bg-[#f5f2ea] hover:text-[#141817] transition"
                        >
                          <LayoutGrid size={14} />
                          Dashboard Workspace
                        </Link>
                        <Link
                          href="/dashboard/settings?tab=account"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#4d5552] hover:bg-[#f5f2ea] hover:text-[#141817] transition"
                        >
                          <User size={14} />
                          Account & Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="w-24 h-8 rounded-full bg-[#f5f2ea] animate-pulse" />
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-[#141817] hover:bg-[#f5f2ea] transition"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#fcfbf8] border-b border-[#141817]/8 px-6 py-5 shadow-lg overflow-hidden"
          >
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-[#4d5552] hover:text-[#141817]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-3 border-t border-[#141817]/6 flex flex-col gap-2">
                {!session ? (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 text-sm font-medium text-[#141817] rounded-xl hover:bg-[#f5f2ea]"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#e85d3f] rounded-full shadow-sm"
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#e85d3f] rounded-full shadow-sm"
                    >
                      Create PRD
                    </Link>
                    <Link
                      href="/dashboard/settings?tab=account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2 text-xs text-[#737b78] hover:text-[#141817]"
                    >
                      Account & Settings
                    </Link>
                  </>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

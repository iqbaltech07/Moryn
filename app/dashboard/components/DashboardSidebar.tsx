"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Folder, Layers, Settings, HelpCircle, LogOut, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { signOut } from "@/lib/auth/auth-client";
import { useTranslation } from "@/lib/i18n";

interface DashboardSidebarProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function DashboardSidebar({
  currentTab,
  onTabChange,
  mobileOpen = false,
  onCloseMobile,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const { t } = useTranslation();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch {
      setLoggingOut(false);
    }
  };

  const navItems = [
    {
      id: "overview",
      label: t.nav.overview,
      icon: LayoutGrid,
      href: "/dashboard",
      active: currentTab ? currentTab === "overview" : pathname === "/dashboard",
    },
    {
      id: "projects",
      label: t.nav.projects,
      icon: Folder,
      href: "/dashboard/projects",
      active: currentTab ? currentTab === "projects" : pathname.startsWith("/dashboard/projects"),
    },
    // {
    //   id: "templates",
    //   label: t.nav.templates,
    //   icon: Layers,
    //   href: "/#features",
    //   active: currentTab ? currentTab === "templates" : pathname.startsWith("/dashboard/templates"),
    // },
    {
      id: "settings",
      label: t.nav.settings,
      icon: Settings,
      href: "/dashboard/settings",
      active: currentTab ? currentTab === "settings" : pathname.startsWith("/dashboard/settings"),
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-neutral-200/80 flex flex-col justify-between p-6 transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group text-decoration-none"
            >
              {/* Moryn 1:1 Logo (Frameless) */}
              <div className="w-9 h-9 relative shrink-0 flex items-center justify-center">
                <Image
                  src="/logo/Moryn-1-1-Light-Transparent.webp"
                  alt="Moryn Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                  draggable={false}
                  priority
                />
              </div>

              {/* Brand Logo */}
              <Image
                src="/logo/Moryn-Light-Mode.webp"
                alt="Moryn"
                width={165}
                height={50}
                className="h-[40px] w-auto object-contain"
                draggable={false}
                priority
              />
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    if (onTabChange) onTabChange(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 ${item.active
                    ? "bg-neutral-900 text-white shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70"
                    }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={item.active ? 2.2 : 1.8}
                    className={item.active ? "text-white" : "text-neutral-500"}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Help */}
        <div className="pt-4 border-t border-neutral-100 space-y-1">
          <Link
            href="/#how-it-works"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
          >
            <HelpCircle size={18} strokeWidth={1.8} className="text-neutral-400" />
            <span>Help</span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            {loggingOut ? (
              <Loader2 size={18} className="animate-spin shrink-0" />
            ) : (
              <LogOut size={18} className="shrink-0" />
            )}
            <span>{t.nav.signOut}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

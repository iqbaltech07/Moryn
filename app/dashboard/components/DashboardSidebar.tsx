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
    {
      id: "templates",
      label: "Templates",
      icon: Layers,
      href: "/#features",
      active: currentTab ? currentTab === "templates" : pathname.startsWith("/dashboard/templates"),
    },
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-neutral-200/80 flex flex-col justify-between p-6 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group text-decoration-none"
            >
              {/* Moryn 1:1 Logo */}
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-neutral-200/80 shadow-2xs group-hover:border-neutral-300 transition-colors relative shrink-0">
                <Image
                  src="/logo/Moryn-1-1-Light.jpeg"
                  alt="Moryn Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>

              <div>
                <h1 className="text-[17px] font-bold text-neutral-900 leading-none tracking-tight">
                  Moryn
                </h1>
                <p className="text-[12px] text-neutral-400 font-medium mt-1 mb-0 leading-none">
                  Premium Workspace
                </p>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav List */}
          <nav className="mt-9 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.active;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    if (onTabChange) onTabChange(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 ${
                    isActive
                      ? "text-[#E05A38] bg-[#FAF3F0] font-semibold"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={isActive ? "text-[#E05A38]" : "text-neutral-500"}
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
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

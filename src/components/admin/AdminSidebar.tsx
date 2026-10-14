"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Activity,
  CheckSquare,
  CreditCard,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Palette,
  Power,
  Radio,
  Shield,
  ShieldCheck,
  Edit3,
  Tag,
  Users,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pendingVerificationsCount?: number;
  totalClientsCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  isExternal?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function AdminSidebar({
  isOpen,
  onClose,
  pendingVerificationsCount = 0,
  totalClientsCount,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";
  const [themesCount, setThemesCount] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/themes")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json?.success && Array.isArray(json?.data)) {
          setThemesCount(json.data.length);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const isTabActive = (tabId: string, href: string) => {
    if (href === "/admin/verifikasi-manual") {
      return pathname.startsWith("/admin/verifikasi-manual");
    }
    if (pathname === "/admin" || pathname === "/admin/") {
      return currentTab === tabId;
    }
    return false;
  };

  const handleLogout = async () => {
    onClose();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/login";
  };

  const SECTIONS: NavSection[] = [
    {
      title: "DASHBOARD",
      items: [
        {
          id: "overview",
          label: "Dashboard & Penjualan",
          href: "/admin?tab=overview",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "DATA & KLIEN",
      items: [
        {
          id: "clients",
          label: "Klien & Undangan",
          href: "/admin?tab=clients",
          icon: Users,
          badge: totalClientsCount !== undefined ? totalClientsCount : undefined,
        },
        {
          id: "verification",
          label: "Verifikasi Manual",
          href: "/admin/verifikasi-manual",
          icon: CheckSquare,
          badge: pendingVerificationsCount > 0 ? pendingVerificationsCount : undefined,
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
        },
        {
          id: "themes",
          label: "Katalog Desain",
          href: "/admin?tab=themes",
          icon: Palette,
          badge: `${themesCount} Tema`,
        },
      ],
    },
    {
      title: "KONTEN & HARGA",
      items: [
        {
          id: "cms",
          label: "Konten Web & Showcase",
          href: "/admin?tab=cms",
          icon: FileText,
        },
        {
          id: "pricing",
          label: "Paket Harga & Preview",
          href: "/admin?tab=pricing",
          icon: Tag,
        },
        {
          id: "features",
          label: "Saklar Fitur",
          href: "/admin?tab=features",
          icon: Radio,
        },
        {
          id: "gateway",
          label: "Gateway & QRIS",
          href: "/admin?tab=gateway",
          icon: CreditCard,
        },
      ],
    },
    {
      title: "SISTEM & SERVER",
      items: [
        {
          id: "maintenance",
          label: "Mode Pemeliharaan",
          href: "/admin?tab=maintenance",
          icon: Power,
        },
        {
          id: "system",
          label: "Alat & Kesehatan Sistem",
          href: "/admin?tab=system",
          icon: Activity,
        },
        {
          id: "roles",
          label: "Pengaturan Hak Akses",
          href: "/admin?tab=roles",
          icon: ShieldCheck,
        },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop for Mobile Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white text-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#E2E8F0] shadow-xs md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Header & Navigation Links */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo & Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#E2E8F0] shrink-0 bg-white">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-base tracking-tight text-slate-900 leading-tight">
                  Invity <span className="text-[10px] font-normal text-slate-500">by Fasaro</span>
                </span>
                <span className="text-[#F97316] font-sans text-[10px] font-bold uppercase tracking-wider">
                  Master Admin
                </span>
              </div>
            </Link>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:hidden cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* System Status Pill */}
          <div className="p-3 mx-3 mt-3 rounded-lg bg-slate-50 border border-[#E2E8F0] flex items-center gap-2.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-800 block truncate">
                Mode Kontrol Penuh
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                Sistem &amp; Database Online
              </span>
            </div>
          </div>

          {/* Scrollable Navigation Sections */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs">
            {SECTIONS.map((sec) => (
              <div key={sec.title} className="space-y-1">
                <div className="px-2.5 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  {sec.title}
                </div>

                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const active = isTabActive(item.id, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      scroll={false}
                      onClick={() => onClose()}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                        active
                          ? "bg-orange-50 text-[#F97316] font-bold border border-orange-200/80 shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active ? "text-[#F97316]" : "text-slate-400"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 border ${
                            item.badgeColor ||
                            (active
                              ? "bg-orange-100/70 text-[#F97316] border-orange-200"
                              : "bg-slate-100 text-slate-500 border-slate-200")
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions: Studio, Web, Logout */}
        <div className="p-3 border-t border-[#E2E8F0] space-y-1 bg-white shrink-0">
          <div className="px-2.5 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
            PINTASAN CEPAT
          </div>

          <Link
            href="/dashboard"
            onClick={() => onClose()}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-[#F97316] shrink-0" />
            <span>Buka Studio Undangan</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            onClick={() => onClose()}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Lihat Web Publik</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
}

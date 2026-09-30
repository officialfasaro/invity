"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  Globe,
  LogOut,
  Menu,
  Palette,
  Shield,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";

interface SessionUser {
  email: string;
  name?: string | null;
  role: string;
}

interface AdminShellProps {
  children: React.ReactNode;
  sessionUser: SessionUser;
}

const TAB_LABELS: Record<string, string> = {
  overview: "Dashboard & Analisa Penjualan",
  clients: "Klien & Undangan",
  themes: "Katalog Desain",
  cms: "Konten Web & Showcase",
  pricing: "Paket Harga & Live Preview",
  maintenance: "Mode Pemeliharaan",
  features: "Saklar Fitur",
  gateway: "Gateway & QRIS Toko",
  system: "Alat & Kesehatan Sistem",
  roles: "Pengaturan Hak Akses Pengguna",
};

export default function AdminShell({ children, sessionUser }: AdminShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isVerificationPage = pathname.startsWith("/admin/verifikasi-manual");
  const currentTab = searchParams.get("tab") || "overview";
  const activeLabel = isVerificationPage
    ? "Verifikasi Pembayaran Manual"
    : TAB_LABELS[currentTab] || "Dashboard";

  return (
    <div className="min-h-screen bg-[#F3F6FB] text-slate-800 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. Left Vertical Sidebar (Desktop Sticky + Mobile Drawer) */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. Main Wrapper with Left Padding for Desktop Sidebar */}
      <div className="md:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Sticky Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden cursor-pointer"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Indicator */}
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Link
                href="/admin"
                className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline-block"
              >
                Super Admin
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
              <span className="font-bold text-slate-900 bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200/60">
                {activeLabel}
              </span>
            </div>
          </div>

          {/* Right: Studio Shortcut, Admin Pill & Logout */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs"
              title="Buka Studio Pembuatan Undangan"
            >
              <Palette className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Studio Klien</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs transition-colors"
              title="Lihat Halaman Depan Website"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Website</span>
            </Link>

            {/* Admin User Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-[#E2E8F0] text-xs">
              <Shield className="w-3.5 h-3.5 text-[#F97316]" />
              <span className="text-slate-700 font-medium max-w-[130px] sm:max-w-[180px] truncate">
                {sessionUser.email}
              </span>
            </div>

            {/* Logout Button */}
            <Link
              href="/login"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-medium transition-colors shadow-xs"
              title="Keluar dari Panel Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Bottom Footer */}
        <footer className="border-t border-[#E2E8F0] bg-white py-4 px-6 text-center text-xs text-slate-500">
          <p>
            Panel Manajemen Platform Fasaro &copy; {new Date().getFullYear()}. Hak Cipta Dilindungi.
          </p>
        </footer>
      </div>
    </div>
  );
}

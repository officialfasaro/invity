"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  Heart,
  LogOut,
  MoreVertical,
  RefreshCw,
  Shield,
  Sparkles,
} from "lucide-react";

interface MobileTopBarProps {
  title: string;
  slug: string;
  tier: string | null;
  isPaid?: boolean;
  isAdmin?: boolean;
  userEmail?: string;
  activeUntil?: string | null;
  isLoading: boolean;
  onOpenPreview: () => void;
  onLogout: () => void;
  onUpgradeClick?: () => void;
  onSelectPlanClick?: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  title,
  slug,
  tier,
  isPaid = false,
  isAdmin = false,
  userEmail,
  activeUntil,
  isLoading,
  onOpenPreview,
  onLogout,
  onUpgradeClick,
  onSelectPlanClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/invitation/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/"
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-[#F97316] text-white shadow-xs hover:bg-[#EA580C] transition-colors"
            title="Ke Beranda Fasaro"
          >
            <Heart className="w-4 h-4 fill-white" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                {title || "Undangan Saya"}
              </h1>
              {isLoading && (
                <RefreshCw className="w-3.5 h-3.5 text-[#F97316] animate-spin shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-mono truncate max-w-[120px] sm:max-w-xs">
                fasaro.id/{slug}
              </span>
              {!tier || tier === "UNSELECTED" ? (
                <button
                  type="button"
                  onClick={onSelectPlanClick || onUpgradeClick}
                  className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold text-[10px] border bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Belum Pilih Paket
                </button>
              ) : !isPaid ? (
                <button
                  type="button"
                  onClick={onUpgradeClick}
                  className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold text-[10px] border bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Paket {tier} (Belum Aktif)
                </button>
              ) : (
                <span className="shrink-0 inline-block px-1.5 py-0.5 rounded font-semibold text-[10px] border bg-emerald-50 text-emerald-700 border-emerald-200">
                  Paket {tier}
                </span>
              )}
              {isPaid && activeUntil && (
                <span className="hidden sm:inline text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-[#E2E8F0] font-medium">
                  Aktif s/d{" "}
                  {new Date(activeUntil).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: DESKTOP (>= md) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Master Admin Button */}
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-orange-300 bg-orange-50 hover:bg-orange-100 text-[#F97316] text-xs font-semibold min-h-[38px] transition-colors shadow-2xs"
              title="Panel Master Admin (admin@admin.com)"
            >
              <Shield className="w-4 h-4 text-[#F97316]" />
              <span>Master Admin</span>
            </Link>
          )}

          {/* Upgrade / Bayar Button */}
          {!tier ? (
            <button
              type="button"
              onClick={onSelectPlanClick || onUpgradeClick}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold min-h-[38px] transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Pilih Paket</span>
            </button>
          ) : !isPaid ? (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold min-h-[38px] transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Bayar &amp; Aktifkan</span>
            </button>
          ) : tier !== "ULTIMATE" && onUpgradeClick ? (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-semibold min-h-[38px] transition-all shadow-xs cursor-pointer"
              title="Upgrade ke Paket Lebih Lengkap"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Upgrade Paket</span>
            </button>
          ) : null}

          {/* Quick Preview Button */}
          <button
            type="button"
            onClick={onOpenPreview}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 text-xs font-semibold min-h-[38px] transition-colors"
            title="Lihat simulasi undangan ponsel"
          >
            <Eye className="w-4 h-4 text-[#F97316]" />
            <span>Preview HP</span>
          </button>

          {/* Salin Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold min-h-[38px] transition-colors shadow-2xs cursor-pointer"
            title="Salin link undangan umum"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Salin Link</span>
              </>
            )}
          </button>

          {/* Open Public Web Button */}
          <a
            href={`/invitation/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold min-h-[38px] transition-colors shadow-xs"
            title="Buka website undangan langsung"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Buka Web</span>
          </a>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Right Actions: MOBILE (< md) — Clean, uncluttered, 2-button layout */}
        <div className="flex md:hidden items-center gap-2 shrink-0" ref={menuRef}>
          {/* 1. Primary Action Button */}
          <a
            href={`/invitation/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold min-h-[36px] transition-colors shadow-xs"
            title="Buka website undangan"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Web</span>
          </a>

          {/* 2. Sleek Overflow Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Menu Opsi"
              className={`p-2 rounded-lg border transition-all min-h-[36px] min-w-[36px] flex items-center justify-center ${
                isMenuOpen
                  ? "border-[#F97316] bg-orange-50 text-[#F97316]"
                  : "border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Floating Card */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* User email info if available */}
                {userEmail && (
                  <div className="px-3.5 py-2 border-b border-[#E2E8F0] mb-1">
                    <p className="text-[10px] text-slate-400 font-medium">Akun Terhubung</p>
                    <p className="text-xs font-medium text-slate-700 truncate">{userEmail}</p>
                  </div>
                )}

                {/* Salin Link */}
                <button
                  type="button"
                  onClick={() => {
                    handleCopyLink();
                    setTimeout(() => setIsMenuOpen(false), 800);
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-emerald-600 font-semibold">Tautan Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#F97316] shrink-0" />
                      <span>Salin Link Undangan</span>
                    </>
                  )}
                </button>

                {/* Preview HP */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenPreview();
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[#F97316] shrink-0" />
                  <span>Preview Simulasi HP</span>
                </button>

                {/* Master Admin Link (if admin) */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-[#F97316] bg-orange-50/70 hover:bg-orange-100/70 flex items-center gap-2.5 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-[#F97316] shrink-0" />
                    <span>Panel Master Admin</span>
                  </Link>
                )}

                {/* Upgrade or Pay button */}
                {!tier ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (onSelectPlanClick) onSelectPlanClick();
                      else if (onUpgradeClick) onUpgradeClick();
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#F97316] shrink-0" />
                    <span>Pilih Paket Undangan</span>
                  </button>
                ) : !isPaid ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (onUpgradeClick) onUpgradeClick();
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#F97316] shrink-0" />
                    <span>Bayar &amp; Aktifkan Paket</span>
                  </button>
                ) : tier !== "ULTIMATE" && onUpgradeClick ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onUpgradeClick();
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#F97316] shrink-0" />
                    <span>Upgrade Paket</span>
                  </button>
                ) : null}

                <div className="border-t border-[#E2E8F0] my-1" />

                {/* Logout */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MobileTopBar;

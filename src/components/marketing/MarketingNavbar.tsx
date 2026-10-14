"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LogIn,
  Menu,
  X,
} from "lucide-react";
import GoogleTranslateWidget from "../shared/GoogleTranslateWidget";
import NotificationBell from "../shared/NotificationBell";
import BrandLogo from "../shared/BrandLogo";

export const MarketingNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTestimonials, setHasTestimonials] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: string;
    hasActivePackage?: boolean;
    latestTransaction?: { orderId: string; paymentStatus: string } | null;
  } | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    fetch("/api/public/testimonials")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.success && Array.isArray(j.data) && j.data.length >= 5) {
          setHasTestimonials(true);
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Tema Undangan", href: "/themes" },
    { label: "Fitur", href: "/#fitur" },
    { label: "Harga", href: "/#harga" },
    ...(hasTestimonials ? [{ label: "Testimoni", href: "/#testimoni" }] : []),
    { label: "FAQ", href: "/#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <BrandLogo />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-[#F97316] transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Button & Language Switcher */}
        <div className="hidden md:flex items-center gap-3">
          <GoogleTranslateWidget />

          {currentUser ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              {currentUser.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
                >
                  <span>Portal Admin</span>
                </Link>
              ) : currentUser.hasActivePackage ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs transition-colors"
                >
                  <span>Buka Dashboard</span>
                </Link>
              ) : currentUser.latestTransaction &&
                ["WAITING_VERIFICATION", "PENDING"].includes(
                  currentUser.latestTransaction.paymentStatus
                ) ? (
                <Link
                  href={`/payment-status?orderId=${currentUser.latestTransaction.orderId}`}
                  className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
                >
                  <span>Status Pembayaran</span>
                </Link>
              ) : (
                <Link
                  href="/order"
                  className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs transition-colors"
                >
                  <span>Pilih Paket</span>
                </Link>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          {currentUser && <NotificationBell />}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Buka Menu"
            className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-[#E2E8F0] bg-white px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#F97316]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-slate-500 font-medium">Bahasa:</span>
              <GoogleTranslateWidget />
            </div>
            {currentUser ? (
              currentUser.hasActivePackage ? (
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 w-full text-center py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs"
                >
                  <span>Buka Dashboard</span>
                </Link>
              ) : currentUser.latestTransaction &&
                ["WAITING_VERIFICATION", "PENDING"].includes(
                  currentUser.latestTransaction.paymentStatus
                ) ? (
                <Link
                  href={`/payment-status?orderId=${currentUser.latestTransaction.orderId}`}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 w-full text-center py-2.5 px-4 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                >
                  <span>Status Pembayaran</span>
                </Link>
              ) : (
                <Link
                  href="/order"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 w-full text-center py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs"
                >
                  <span>Pilih Paket</span>
                </Link>
              )
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 w-full text-center py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default MarketingNavbar;

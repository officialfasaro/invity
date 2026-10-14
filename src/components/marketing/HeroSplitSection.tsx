"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Heart,
  Music2,
  Palette,
  Users,
} from "lucide-react";

interface HeroSplitSectionProps {
  settings?: Record<string, string> | null;
  isRegistrationOpen?: boolean;
}

export const HeroSplitSection: React.FC<HeroSplitSectionProps> = ({
  settings,
  isRegistrationOpen = true,
}) => {
  const isSinglePromo = settings?.single_promo_mode !== "false";
  const realPriceNum = isSinglePromo
    ? parseInt(settings?.promo_plan_price || "79000", 10) || 79000
    : parseInt(settings?.price_starter || "39000", 10) || 39000;
  const formattedRealPrice =
    realPriceNum >= 1000
      ? `${Math.round(realPriceNum / 1000)}rb`
      : realPriceNum.toLocaleString("id-ID");

  const heroPromoText = React.useMemo(() => {
    if (settings?.site_hero_promo && !settings.site_hero_promo.includes("39rb")) {
      return settings.site_hero_promo;
    }
    return `Mulai Rp ${formattedRealPrice} Promo Spesial`;
  }, [settings?.site_hero_promo, formattedRealPrice]);

  return (
    <section
      id="home"
      className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-hidden"
    >
      {/* 1. Ambient Warm Glow / Mesh Radial Gradients (Anti-slop warm palette: soft orange & amber) */}
      <div className="absolute top-1/4 -left-20 w-80 sm:w-96 h-80 sm:h-96 bg-orange-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-20 w-80 sm:w-96 h-80 sm:h-96 bg-amber-100/35 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-orange-50/50 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* 2. Delicate Botanical Decorative Line-Art (Pernikahan Floral Aksen) */}
      <div className="absolute top-6 right-8 lg:right-16 pointer-events-none opacity-20 hidden md:block -z-10">
        <svg width="140" height="140" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M50 10C50 35 25 50 10 50C35 50 50 75 50 90C50 65 75 50 90 50C65 50 50 25 50 10Z"
            stroke="#EA580C"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M30 30C40 45 45 60 48 70M70 30C60 45 55 60 52 70"
            stroke="#D97706"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <circle cx="50" cy="50" r="4" fill="#F97316" />
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* ======================================================== */}
        {/* SISI KIRI: Headline, Deskripsi, Tombol CTA & Social Proof */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Optional CMS Badge (Hanya tampil jika diset manual di CMS dan bukan teks jumlah counter) */}
          {Boolean(
            settings?.site_hero_badge?.trim() &&
              !settings.site_hero_badge.includes("250.000") &&
              !settings.site_hero_badge.toLowerCase().includes("pasangan")
          ) && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none border border-[#E2E8F0] bg-white text-[#F97316] text-xs font-semibold shadow-xs">
              <Users className="w-3.5 h-3.5 text-[#F97316]" />
              <span>{settings?.site_hero_badge}</span>
            </div>
          )}

          {/* Headline yang Lebih Padat & Scan-Friendly */}
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-[1.18]">
            {settings?.site_hero_title || (
              <>
                Buat Website Undangan Pernikahan Digital Elegan{" "}
                <span className="text-[#F97316]">dalam Hitungan Menit</span>
              </>
            )}
          </h1>

          {/* Deskripsi Singkat */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
            {settings?.site_hero_subtitle ||
              "Platform all-in-one: ganti tema 1-klik tanpa data hilang, amplop digital terintegrasi (QRIS/Bank), buku tamu RSVP realtime, hingga audio player autoplay super cepat."}
          </p>

          {/* Tombol CTA Dual Button */}
          <div className="flex flex-wrap items-center justify-start gap-3.5 pt-1">
            <Link
              href="/login?from=/dashboard"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs transition-colors"
            >
              <span>{isRegistrationOpen ? "Buat Undangan Sekarang" : "Masuk ke Akun Saya"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#tema"
              className="inline-flex items-center gap-2 py-3 px-5 rounded-xl text-xs font-semibold border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-800 transition-colors shadow-xs"
            >
              <Palette className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Lihat Desain Tema</span>
            </a>
          </div>

          {/* Checklist Trust Factors & Social Proof */}
          <div className="pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center gap-y-2.5 gap-x-5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{heroPromoText}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Buka Cepat &lt; 500ms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Ganti Tema Bebas Kapan Saja</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SISI KANAN: Visual Mockup Smartphone & Floating Badges   */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 relative flex items-center justify-center pt-4 lg:pt-0">
          {/* Subtle Wax Seal & Envelope Background Shadow Decoration */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-orange-200/50 bg-gradient-to-br from-amber-50 to-orange-100/30 -z-10 flex items-center justify-center pointer-events-none opacity-70">
            <div className="w-20 h-20 border-2 border-dashed border-[#F97316]/30 flex items-center justify-center text-[10px] font-serif font-bold text-[#F97316]/60 uppercase tracking-widest text-center">
              Wax Seal
            </div>
          </div>

          {/* Mockup Container with Perspective Layering */}
          <div className="relative w-full max-w-[420px] sm:max-w-[460px] h-[480px] sm:h-[530px] flex items-center justify-center">
            {/* 1. Mockup Belakang (Layered Section Champagne Botanical / Miring 6 deg) */}
            <div className="absolute right-4 sm:right-6 top-6 sm:top-8 w-[230px] sm:w-[250px] aspect-[9/18] rounded-[36px] bg-[#3B2D1B] p-2.5 shadow-lg border border-amber-800/30 rotate-6 scale-95 transition-transform duration-300 hover:rotate-3 opacity-90 hidden xs:block">
              <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-[#241A0E]">
                <Image
                  src="/templates/botanical/bride.jpg"
                  alt="Tema 1 - Mempelai"
                  fill
                  sizes="250px"
                  className="object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241A0E] via-transparent to-black/30" />
                <div className="absolute top-4 left-3 right-3 text-center">
                  <span className="text-[9px] uppercase tracking-widest text-amber-200 font-serif">
                    Akad &amp; Resepsi
                  </span>
                  <p className="text-xs font-serif font-bold text-white mt-0.5">Faisal &amp; Putri</p>
                </div>
                {/* Botanical Theme Badge */}
                <div className="absolute bottom-4 left-3 right-3 text-center">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none bg-[#3B2D1B]/90 border border-amber-400/30 text-[9px] text-amber-100 font-medium">
                    <span className="w-1.5 h-1.5 bg-amber-400" />
                    <span>Tema 1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Mockup Depan Utama (Champagne Botanical Floral Theme) */}
            <div className="relative z-10 w-[250px] sm:w-[275px] aspect-[9/18.5] rounded-[40px] bg-slate-900 p-2.5 shadow-2xl border-2 border-slate-700/60 -rotate-2 hover:rotate-0 transition-transform duration-300">
              {/* Smartphone Frame Outer Shell */}
              <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-[#FAF7F2] flex flex-col justify-between text-slate-800">
                {/* Speaker Notch / Dynamic Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-30" />

                {/* Inner Screen Header */}
                <div className="pt-7 pb-2 px-3 text-center border-b border-[#E8E1D5] bg-[#FAF7F2]">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-[#725B38] font-semibold">
                    The Wedding Of
                  </p>
                  <h3 className="text-sm font-serif font-bold text-slate-900 mt-0.5 flex items-center justify-center gap-1">
                    <span>Faisal</span>
                    <Heart className="w-2.5 h-2.5 text-[#F97316] fill-[#F97316]" />
                    <span>Putri</span>
                  </h3>
                  <p className="text-[9px] text-[#725B38] font-medium mt-0.5">
                    Sabtu, 24 Oktober 2026
                  </p>
                </div>

                {/* Couple Image with Arched Aesthetic Frame */}
                <div className="relative flex-1 mx-3 my-2 rounded-2xl overflow-hidden border border-[#E8E1D5] shadow-xs bg-slate-100 min-h-[170px]">
                  <Image
                    src="/templates/botanical/cover.jpg"
                    alt="Preview Undangan Faisal & Putri"
                    fill
                    sizes="270px"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-center text-white">
                    <span className="text-[9px] font-medium drop-shadow-xs">
                      Balai Nan Gadang, Padang
                    </span>
                  </div>
                </div>

                {/* Live Countdown & Interactive Button inside Phone */}
                <div className="p-3 pt-0 space-y-2 text-center">
                  <div className="grid grid-cols-3 gap-1 bg-[#F0ECE1] p-1.5 rounded-lg text-slate-800">
                    <div>
                      <p className="text-[11px] font-bold text-[#F97316]">12</p>
                      <p className="text-[7px] text-slate-500 uppercase">Hari</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#F97316]">08</p>
                      <p className="text-[7px] text-slate-500 uppercase">Jam</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#F97316]">45</p>
                      <p className="text-[7px] text-slate-500 uppercase">Mnt</p>
                    </div>
                  </div>

                  <div className="py-1.5 px-3 rounded-lg bg-[#F97316] text-white text-[10px] font-semibold shadow-xs flex items-center justify-center gap-1">
                    <span>Buka Undangan</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 3. FLOATING BADGES (Kartu Melayang Interaktif)           */}
            {/* ======================================================== */}

            {/* Badge 1: RSVP Hadir (Top Left) */}
            <div className="absolute -top-2 -left-2 sm:-left-6 z-20 bg-white/95 backdrop-blur-xs border border-[#E2E8F0] shadow-md rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 animate-fadeIn">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-bold text-slate-900">RSVP Realtime</p>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">120 Tamu Telah Konfirmasi</p>
              </div>
            </div>

            {/* Badge 2: Amplop Digital QRIS / Bank (Middle Right) */}
            <div className="absolute top-1/2 -right-2 sm:-right-8 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-xs border border-[#E2E8F0] shadow-md rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316] shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">Amplop Digital</p>
                <p className="text-[11px] text-slate-500 font-medium">QRIS &amp; Transfer Bank</p>
              </div>
            </div>

            {/* Badge 3: Lagu Latar Background Music (Bottom Left) */}
            <div className="absolute -bottom-3 -left-1 sm:-left-4 z-20 bg-white/95 backdrop-blur-xs border border-[#E2E8F0] shadow-md rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Music2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-[#F97316] tracking-wider block">
                  Autoplay Audio
                </span>
                <p className="text-xs font-bold text-slate-900">Romantic Acoustic</p>
              </div>
              <div className="flex items-end gap-0.5 h-3.5 ml-0.5">
                <span className="w-1 bg-[#F97316] rounded-full h-2 animate-pulse" />
                <span className="w-1 bg-[#F97316] rounded-full h-3.5 animate-pulse delay-75" />
                <span className="w-1 bg-[#F97316] rounded-full h-2.5 animate-pulse delay-150" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSplitSection;

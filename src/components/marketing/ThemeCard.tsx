"use client";

import React from "react";
import Image from "next/image";
import { ExternalLink, Tag, Mail } from "lucide-react";
import { ThemeMeta } from "@/types/wedding";

interface ThemeCardProps {
  theme: ThemeMeta;
  isPopular?: boolean;
  isNew?: boolean;
}

interface ThemePreviewConfig {
  coupleLine1: string;
  coupleLine2: string;
  coupleFull: string;
  date: string;
  coverBg: string;
  coverBorder: string;
  coverTitleColor: string;
  coverScriptColor: string;
  coverToColor: string;
  coverGuestColor: string;
  coverButtonClass: string;
  heroOverlay: string;
  heroScriptColor: string;
}

const PREVIEW_CONFIGS: Record<string, ThemePreviewConfig> = {
  "wedding-3d": {
    coupleLine1: "Raka &",
    coupleLine2: "Ayu",
    coupleFull: "Raka & Ayu",
    date: "Sabtu, 12 Desember 2026",
    coverBg: "bg-[#0b1329]",
    coverBorder: "border-[#e2c98b]/40",
    coverTitleColor: "text-[#e2c98b]",
    coverScriptColor: "text-[#f7e7c4]",
    coverToColor: "text-slate-300/80",
    coverGuestColor: "text-[#f7e7c4]",
    coverButtonClass: "border border-[#e2c98b] text-[#e2c98b] bg-[#0b1329]/90",
    heroOverlay: "from-[#0b1329]/95 via-[#0b1329]/65 to-[#0b1329]/25",
    heroScriptColor: "text-[#f7e7c4]",
  },
  "raka-ayu": {
    coupleLine1: "Raka &",
    coupleLine2: "Ayu",
    coupleFull: "Raka & Ayu",
    date: "Sabtu, 12 Desember 2026",
    coverBg: "bg-[#18332f]",
    coverBorder: "border-[#b08a4a]/50",
    coverTitleColor: "text-[#d4b276]",
    coverScriptColor: "text-[#f1dcae]",
    coverToColor: "text-[#faf6f0]/75",
    coverGuestColor: "text-[#faf6f0]",
    coverButtonClass: "border border-[#b08a4a] text-[#f1dcae] bg-[#18332f]",
    heroOverlay: "from-[#18332f]/95 via-[#18332f]/60 to-[#18332f]/30",
    heroScriptColor: "text-[#f1dcae]",
  },
  "editorial": {
    coupleLine1: "Putri &",
    coupleLine2: "Andika",
    coupleFull: "Putri & Andika",
    date: "Sabtu, 24 Oktober 2026",
    coverBg: "bg-[#F7F4EE]",
    coverBorder: "border-[#cfc5b6]",
    coverTitleColor: "text-[#6e685f]",
    coverScriptColor: "text-[#2e2b27]",
    coverToColor: "text-[#7a746b]",
    coverGuestColor: "text-[#2e2b27]",
    coverButtonClass: "border border-[#a89078] text-[#2e2b27] bg-[#F7F4EE]",
    heroOverlay: "from-[#26211c]/95 via-[#26211c]/55 to-black/25",
    heroScriptColor: "text-[#f7f2ea]",
  },
  "gothic": {
    coupleLine1: "Putri &",
    coupleLine2: "Andika",
    coupleFull: "Putri & Andika",
    date: "Sabtu, 28 Desember 2027",
    coverBg: "bg-[#0d0d0d]",
    coverBorder: "border-[#403838]",
    coverTitleColor: "text-[#c2bcba]",
    coverScriptColor: "text-[#f3efed]",
    coverToColor: "text-[#99918f]",
    coverGuestColor: "text-[#f3efed]",
    coverButtonClass: "border border-[#801414] text-white bg-[#6b0f0f]",
    heroOverlay: "from-[#0d0d0d]/95 via-[#0d0d0d]/70 to-[#590e0e]/35",
    heroScriptColor: "text-[#f3efed]",
  },
  "botanical": {
    coupleLine1: "Versa &",
    coupleLine2: "Mekar",
    coupleFull: "Versa & Mekar",
    date: "Sabtu, 12 Desember 2026",
    coverBg: "bg-[#FAF7F0]",
    coverBorder: "border-[#cfbeaa]",
    coverTitleColor: "text-[#7d6849]",
    coverScriptColor: "text-[#4d3d25]",
    coverToColor: "text-[#8c7757]",
    coverGuestColor: "text-[#4d3d25]",
    coverButtonClass: "border border-[#8c7757] text-[#4d3d25] bg-[#FAF7F0]",
    heroOverlay: "from-[#2b251d]/90 via-[#2b251d]/55 to-transparent",
    heroScriptColor: "text-[#fcf8f2]",
  },
};

const DEFAULT_CONFIG: ThemePreviewConfig = {
  coupleLine1: "Raka &",
  coupleLine2: "Ayu",
  coupleFull: "Raka & Ayu",
  date: "Sabtu, 12 Desember 2026",
  coverBg: "bg-[#18332f]",
  coverBorder: "border-[#b08a4a]/50",
  coverTitleColor: "text-[#d4b276]",
  coverScriptColor: "text-[#f1dcae]",
  coverToColor: "text-[#faf6f0]/75",
  coverGuestColor: "text-[#faf6f0]",
  coverButtonClass: "border border-[#b08a4a] text-[#f1dcae] bg-[#18332f]",
  heroOverlay: "from-[#18332f]/95 via-[#18332f]/60 to-[#18332f]/30",
  heroScriptColor: "text-[#f1dcae]",
};

export const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  isPopular: propPopular,
  isNew: propNew,
}) => {
  const isPro = theme.tier === "PRO";
  const isPopular = propPopular !== undefined ? propPopular : theme.isPopular;
  const isNew = propNew !== undefined ? propNew : theme.isNew;
  const config = PREVIEW_CONFIGS[theme.id] || DEFAULT_CONFIG;

  return (
    <div className="group rounded-2xl bg-white border border-[#E2E8F0] p-3 sm:p-4 shadow-xs hover:shadow-md hover:border-[#F97316]/50 transition-all duration-300 flex flex-col justify-between text-left">
      {/* 1. Mockup Image Container (Left: Buka Undangan, Right: Awal Setelah Buka Undangan) */}
      <div className="space-y-3">
        <div
          className={`relative w-full aspect-[4/4.6] rounded-xl overflow-hidden bg-gradient-to-tr ${
            theme.mockupBg || "from-slate-800 to-slate-900"
          } p-2 sm:p-3 flex items-center justify-center gap-2 sm:gap-2.5 shadow-inner select-none`}
        >
          {/* Subtle Ambient Studio Vignette */}
          <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-black/50 pointer-events-none" />

          {/* =============================================================== */}
          {/* SMARTPHONE 1 (KIRI): Tampilan Layar Cover Buka Undangan         */}
          {/* =============================================================== */}
          <div
            className={`relative w-[72%] sm:w-[48%] h-[96%] rounded-[14px] sm:rounded-[18px] border-[2px] sm:border-[2.5px] border-slate-700/80 ${config.coverBg} overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] sm:-rotate-1 transform sm:group-hover:-rotate-2 group-hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between p-1.5 sm:p-2 text-center select-none`}
          >
            {/* Top Phone Speaker Bar */}
            <div className="w-4 h-0.5 rounded-full bg-white/20 mx-auto z-10 shrink-0" />

            {/* Inner Border Frame (Sesuai referensi buka undangan) */}
            <div
              className={`absolute inset-1.5 sm:inset-2 rounded-lg border ${config.coverBorder} pointer-events-none opacity-85`}
            />

            {/* Cover Content Center */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-0.5 sm:space-y-1 px-1">
              {/* THE WEDDING OF */}
              <span
                className={`block text-[4.5px] sm:text-[6px] uppercase tracking-[0.25em] ${config.coverTitleColor} font-medium leading-none mb-0.5`}
              >
                THE WEDDING OF
              </span>

              {/* Nama Pengantin (Font Cursive Pinyon Script) */}
              <div
                className={`font-script-pinyon text-[13px] sm:text-[16px] leading-[1.05] ${config.coverScriptColor} drop-shadow-xs my-0.5`}
              >
                <span className="block">{config.coupleLine1}</span>
                <span className="block">{config.coupleLine2}</span>
              </div>

              {/* Divider Line Emas */}
              <div className="w-5 sm:w-7 h-[0.5px] bg-[#d4b06a]/70 my-0.5" />

              {/* Kepada Yth */}
              <div className="space-y-0.5">
                <span
                  className={`block text-[4px] sm:text-[5px] uppercase tracking-wider ${config.coverToColor} leading-none`}
                >
                  Kepada Yth. Bapak/Ibu/Saudara/i:
                </span>
                <span
                  className={`block font-serif text-[7px] sm:text-[9px] font-bold ${config.coverGuestColor} leading-tight`}
                >
                  Tamu Undangan
                </span>
              </div>

              {/* Tombol "BUKA UNDANGAN" */}
              <div
                className={`mt-1 sm:mt-1.5 inline-flex items-center gap-0.5 sm:gap-1 px-2 py-0.5 sm:py-1 rounded-xs text-[5px] sm:text-[6.5px] font-semibold tracking-wider uppercase shadow-2xs ${config.coverButtonClass}`}
              >
                <Mail className="w-1.5 h-1.5 sm:w-2 sm:h-2" />
                <span>BUKA UNDANGAN</span>
              </div>
            </div>

            {/* Bottom Speaker / Bar Indicator */}
            <div className="w-5 h-0.5 rounded-full bg-white/20 mx-auto z-10 shrink-0" />
          </div>

          {/* =============================================================== */}
          {/* SMARTPHONE 2 (KANAN): Preview Singkat (Hanya Tampil di Desktop) */}
          {/* =============================================================== */}
          <div className="hidden sm:flex relative w-[48%] h-[96%] rounded-[14px] sm:rounded-[18px] border-[2px] sm:border-[2.5px] border-slate-700/80 bg-slate-950 overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] rotate-1 transform group-hover:rotate-2 group-hover:scale-[1.02] transition-transform duration-300 flex-col justify-between p-1.5 sm:p-2 text-center select-none">
            {/* Background Prewedding Photo */}
            <Image
              src={theme.thumbnail}
              alt={`Tampilan Layar Setelah Buka Undangan ${theme.code}`}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 18vw"
              className="object-cover"
              loading="lazy"
            />

            {/* Theme Gradient Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-t ${config.heroOverlay} pointer-events-none`}
            />

            {/* Falling Rose Petal Accents */}
            <div className="absolute top-[10%] left-[12%] w-1.5 h-2 bg-[#ead7d0]/60 rounded-tr-full rounded-bl-full rotate-12 pointer-events-none" />
            <div className="absolute top-[22%] right-[14%] w-1.5 h-2 bg-[#ead7d0]/50 rounded-tr-full rounded-bl-full 45deg pointer-events-none" />
            <div className="absolute top-[40%] left-[18%] w-1 h-1.5 bg-[#ead7d0]/40 rounded-tr-full rounded-bl-full -rotate-12 pointer-events-none" />
            <div className="absolute bottom-[28%] right-[20%] w-1.5 h-2 bg-[#ead7d0]/55 rounded-tr-full rounded-bl-full rotate-30 pointer-events-none" />

            {/* Top Phone Speaker Bar */}
            <div className="relative w-4 h-0.5 rounded-full bg-white/30 mx-auto z-10 shrink-0" />

            {/* Hero Section Content (Seksi 1 Tepat Setelah Buka Undangan) */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-0.5 sm:space-y-1 text-white px-1">
              <span className="block text-[4.5px] sm:text-[6px] uppercase tracking-[0.25em] text-white/85 font-medium leading-none mb-0.5">
                KAMI MENIKAH
              </span>

              {/* Nama Pengantin (Font Cursive Pinyon Script) */}
              <div
                className={`font-script-pinyon text-[13px] sm:text-[16px] leading-[1.05] ${config.heroScriptColor} drop-shadow-md my-0.5`}
              >
                <span className="block">{config.coupleLine1}</span>
                <span className="block">{config.coupleLine2}</span>
              </div>

              {/* Divider Line Emas */}
              <div className="w-5 sm:w-7 h-[0.5px] bg-[#d4b06a]/70 my-0.5" />

              {/* Tanggal Pernikahan */}
              <span className="block font-serif text-[5.5px] sm:text-[7px] text-white/95 leading-none">
                {config.date}
              </span>
            </div>

            {/* Bottom Indicator & Spinning Vinyl Record Player */}
            <div className="relative z-10 flex items-center justify-between w-full px-1">
              {/* Spacer */}
              <div className="w-3" />

              {/* Vertical Scroll Line Indicator */}
              <div className="w-[1px] h-3 sm:h-4 bg-amber-200/50" />

              {/* Piringan Hitam Audio Disc Berputar */}
              <div
                className="relative w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full border border-amber-300/80 bg-black/85 flex items-center justify-center shadow-lg animate-spin [animation-duration:8s]"
                title="Pemutar musik piringan hitam latar otomatis"
              >
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-amber-300/40 flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-amber-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Status Badges on Top-Left: "Terlaris" / "Terbaru" */}
          <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 z-10 flex items-center gap-1">
            {isPopular && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
                Terlaris
              </span>
            )}
            {isNew && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-600 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
                Terbaru
              </span>
            )}
          </div>

          {/* Floating Category Tag on Bottom-Left */}
          <div className="absolute bottom-2 sm:bottom-2.5 left-2 sm:left-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-slate-800 text-[9px] sm:text-[10px] font-semibold border border-slate-200/90 shadow-xs">
              <Tag className="w-2.5 h-2.5 text-[#F97316]" />
              <span>{theme.category}</span>
            </span>
          </div>

          {/* Status Badge on Top-Right: PRO atau GENERAL */}
          <div className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-10">
            {isPro ? (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-[#F97316] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
                PRO
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
                GENERAL
              </span>
            )}
          </div>
        </div>

        {/* 2. Theme Title */}
        <div className="pt-0.5">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#F97316] transition-colors">
            {theme.code}
          </h3>
        </div>
      </div>

      {/* 3. Action Button: ONLY "Lihat Contoh" */}
      <div className="pt-3 mt-3 border-t border-[#E2E8F0]">
        <a
          href={theme.previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-full border-2 border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs group/btn cursor-pointer"
          title={`Lihat contoh demo tema ${theme.code}`}
        >
          <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
          <span>Lihat Contoh</span>
        </a>
      </div>
    </div>
  );
};

export default ThemeCard;

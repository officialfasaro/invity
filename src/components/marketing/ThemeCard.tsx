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
  studioBg: string;
  coupleNames: string;
  date: string;
}

const PREVIEW_CONFIGS: Record<string, ThemePreviewConfig> = {
  "wedding-3d": {
    studioBg: "radial-gradient(ellipse at 50% 35%, #1e293b 0%, #0f172a 65%, #020617 100%)",
    coupleNames: "Raka & Ayu",
    date: "Sabtu, 12 Des 2026",
  },
  "raka-ayu": {
    studioBg: "radial-gradient(ellipse at 50% 35%, #1c3630 0%, #0f2420 65%, #051412 100%)",
    coupleNames: "Raka & Ayu",
    date: "Sabtu, 12 Des 2026",
  },
  "editorial": {
    studioBg: "radial-gradient(ellipse at 50% 35%, #3e362f 0%, #2b2520 65%, #181411 100%)",
    coupleNames: "Putri & Andika",
    date: "Sabtu, 24 Okt 2026",
  },
  "gothic": {
    studioBg: "radial-gradient(ellipse at 50% 35%, #2b171c 0%, #170d10 65%, #080305 100%)",
    coupleNames: "Putri & Andika",
    date: "Sabtu, 28 Des 2027",
  },
  "botanical": {
    studioBg: "radial-gradient(ellipse at 50% 35%, #26382a 0%, #18261b 65%, #0a130c 100%)",
    coupleNames: "Versa & Mekar",
    date: "Sabtu, 12 Des 2026",
  },
};

const DEFAULT_CONFIG: ThemePreviewConfig = {
  studioBg: "radial-gradient(ellipse at 50% 35%, #1e293b 0%, #0f172a 65%, #020617 100%)",
  coupleNames: "Pengantin",
  date: "Sabtu, 12 Des 2026",
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
      {/* 1. Mockup Image Container (Dual Phone Showcase: Cover & Inside Page) */}
      <div className="space-y-3">
        <div
          className="relative w-full aspect-[4/4.8] rounded-xl overflow-hidden p-2 sm:p-3 flex items-center justify-center select-none shadow-inner"
          style={{ background: config.studioBg }}
        >
          {/* Subtle Ambient Studio Vignette */}
          <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-black/50 pointer-events-none" />

          {/* =============================================================== */}
          {/* SMARTPHONE 1 (BELAKANG / KANAN): Preview Layar Isi Undangan     */}
          {/* =============================================================== */}
          <div className="absolute right-2 sm:right-3 bottom-2.5 sm:bottom-3 w-[47%] h-[87%] rounded-[14px] sm:rounded-[18px] border-[2px] border-slate-700/80 bg-slate-900 overflow-hidden shadow-2xl rotate-3 sm:rotate-6 group-hover:rotate-8 group-hover:translate-x-1 transition-transform duration-300 flex flex-col justify-between">
            {/* Background Content Photo */}
            <Image
              src={theme.secondaryThumbnail || theme.thumbnail}
              alt={`Layar Isi ${theme.name}`}
              fill
              sizes="(max-width: 640px) 40vw, 20vw"
              className="object-cover"
              loading="lazy"
            />

            {/* Subtle Dark Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />

            {/* Speaker / Notch Bar */}
            <div className="relative w-4 h-0.5 rounded-full bg-white/30 mx-auto mt-1 z-10 shrink-0" />

            {/* Content overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto px-1 text-center">
              <span className="block text-[6.5px] sm:text-[7.5px] uppercase tracking-[0.2em] text-white/80 font-medium">
                KAMI MENIKAH
              </span>
              <span className="block text-[7px] sm:text-[8px] font-serif text-amber-200/90 font-medium mt-0.5">
                {config.date}
              </span>
            </div>

            {/* Bottom Disc Audio Indicator */}
            <div className="relative z-10 flex items-center justify-end w-full p-1.5">
              <div
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-amber-300/80 bg-black/85 flex items-center justify-center shadow-md animate-spin [animation-duration:8s]"
                title="Pemutar audio otomatis"
              >
                <div className="w-1.5 h-1.5 rounded-full border border-amber-300/40 flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-amber-400" />
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* SMARTPHONE 2 (DEPAN / KIRI): Preview Layar Cover Buka Undangan   */}
          {/* =============================================================== */}
          <div className="relative z-10 w-[55%] h-[92%] -ml-3 sm:-ml-4 mt-auto mb-1 rounded-[14px] sm:rounded-[18px] border-[2px] sm:border-[2.5px] border-slate-600/90 bg-slate-900 overflow-hidden shadow-[0_15px_30px_-5px_rgba(0,0,0,0.7)] -rotate-2 group-hover:-rotate-1 group-hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between p-1.5 sm:p-2 text-center">
            {/* Cover Photo */}
            <Image
              src={theme.thumbnail}
              alt={`Cover Undangan ${theme.name}`}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover"
              priority={theme.id === "wedding-3d"}
            />

            {/* Cinematic Vignette Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/45 pointer-events-none" />

            {/* Speaker / Notch Bar */}
            <div className="relative w-4 h-0.5 rounded-full bg-white/40 mx-auto z-10 shrink-0" />

            {/* Center Typography (Clean, zero overflow, fully legible) */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-0.5 px-1">
              <span className="block text-[7px] sm:text-[8px] uppercase tracking-[0.2em] text-amber-200/95 font-medium leading-none">
                THE WEDDING OF
              </span>

              <div className="font-serif text-[11px] sm:text-[13px] font-bold text-white drop-shadow-md leading-tight my-0.5">
                {config.coupleNames}
              </div>

              <div className="w-6 sm:w-8 h-[0.5px] bg-amber-300/70 my-0.5" />

              {/* Realistic Mini "BUKA UNDANGAN" Button Pill */}
              <div className="mt-1 inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/95 text-slate-900 text-[8px] sm:text-[9.5px] font-bold shadow-md tracking-wide">
                <Mail className="w-2.5 h-2.5 text-[#F97316]" />
                <span>Buka Undangan</span>
              </div>
            </div>

            {/* Bottom speaker bar indicator */}
            <div className="relative w-4 h-0.5 rounded-full bg-white/30 mx-auto z-10 shrink-0" />
          </div>

          {/* Status Badges on Top-Left: "Terlaris" / "Terbaru" */}
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1">
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

          {/* Status Badge on Top-Right: PRO atau GENERAL */}
          <div className="absolute top-2.5 right-2.5 z-20">
            {isPro ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F97316] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
                PRO
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
                GENERAL
              </span>
            )}
          </div>

          {/* Floating Category Tag on Bottom-Left */}
          <div className="absolute bottom-2.5 left-2.5 z-20">
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-slate-800 text-[9px] sm:text-[10px] font-semibold border border-slate-200/90 shadow-xs">
              <Tag className="w-2.5 h-2.5 text-[#F97316]" />
              <span>{theme.category}</span>
            </span>
          </div>
        </div>

        {/* 2. Theme Meta Information */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold text-[#F97316] tracking-wider uppercase">
              {theme.code}
            </span>
            {theme.usageCount && (
              <span className="text-[11px] text-slate-400 font-medium">
                {theme.usageCount.toLocaleString("id-ID")} pasangan
              </span>
            )}
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#F97316] transition-colors leading-snug line-clamp-1">
            {theme.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {theme.description}
          </p>
        </div>
      </div>

      {/* 3. Action Button: "Lihat Contoh" */}
      <div className="pt-3 mt-3 border-t border-[#E2E8F0]">
        <a
          href={theme.previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-xl border border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs group/btn cursor-pointer"
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

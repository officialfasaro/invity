"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ExternalLink, Eye, Palette } from "lucide-react";
import { THEME_LIST } from "@/types/wedding";

const CATEGORIES = [
  "Semua",
  "Minimalist",
  "Floral/Rustic",
  "Syar'i/Adat",
  "Luxury Dark Gold",
  "Modern Chic",
] as const;

export const ThemeCatalogSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("Semua");

  const filteredThemes = THEME_LIST.filter((theme) => {
    if (activeCategory === "Semua") return true;
    return theme.category === activeCategory;
  });

  return (
    <section id="tema" className="w-full space-y-10 py-16 scroll-mt-20">
      <div className="text-center space-y-2.5 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[#F97316] text-xs font-semibold">
          <Palette className="w-3.5 h-3.5" />
          <span>Koleksi Desain Tema</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Pilihan Desain Tema Undangan Digital
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Setiap tema dirancang dengan pengalaman visual terbaik di ponsel pintar para tamu undangan Anda.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === cat
                ? "bg-[#F97316] text-white shadow-xs"
                : "bg-white border border-[#E2E8F0] text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Theme Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filteredThemes.map((theme) => (
          <div
            key={theme.id}
            className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-xs transition-all flex flex-col justify-between space-y-4"
          >
            {/* Visual Cover Preview with Wedding Image */}
            <div className="relative h-52 w-full rounded-xl overflow-hidden bg-slate-100 border border-[#E2E8F0] group/img">
              {theme.thumbnail ? (
                <Image
                  src={theme.thumbnail}
                  alt={`Preview Desain ${theme.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-tr ${theme.bgPreview}`} />
              )}
              {/* Bottom gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent pointer-events-none" />

              {/* Floating Category Badge */}
              <div className="absolute top-3 left-3">
                <span className="text-[10px] uppercase tracking-wider text-white font-semibold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs border border-white/20">
                  {theme.category}
                </span>
              </div>

              {/* Theme Name at bottom of cover image */}
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-bold text-base drop-shadow-md tracking-tight leading-snug">
                  {theme.name}
                </p>
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-1 text-left">
              <h3 className="font-bold text-sm text-slate-900">{theme.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{theme.description}</p>
            </div>

            {/* Action Button: Single Preview Button */}
            <div className="pt-2 border-t border-[#E2E8F0]">
              <a
                href={`/invitation/demo-${theme.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
                title="Buka pratinjau tema di tab baru"
              >
                <Eye className="w-3.5 h-3.5 shrink-0" />
                <span>Preview</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ThemeCatalogSection;

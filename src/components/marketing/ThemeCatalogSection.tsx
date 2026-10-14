"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Palette } from "lucide-react";
import { THEME_LIST, ThemeMeta, validateNewestThemeIds, getPopularThemeIds } from "@/types/wedding";
import ThemeCard from "./ThemeCard";

export const ThemeCatalogSection: React.FC = () => {
  const [themeStats, setThemeStats] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    fetch("/api/public/theme-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.data) {
          setThemeStats(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Gabungkan baseline data dengan data real Hari H
  const baseThemes: ThemeMeta[] = React.useMemo(() => {
    return THEME_LIST.map((t) => {
      const serverUsage = themeStats[t.id];
      return {
        ...t,
        usageCount: serverUsage !== undefined ? serverUsage : t.usageCount,
      };
    });
  }, [themeStats]);

  // Validasi 5 tema paling terakhir berdasarkan tanggal rilis (createdAt)
  const newestThemeIds = React.useMemo(() => validateNewestThemeIds(baseThemes, 5), [baseThemes]);

  // Hitung tema Terlaris secara dinamis berdasarkan penggunaan Hari H
  const popularThemeIds = React.useMemo(() => getPopularThemeIds(baseThemes, baseThemes), [baseThemes]);

  // Otomatis menampilkan tema terlaris (popularThemeIds) dan terbaru (newestThemeIds)
  const featuredThemes: ThemeMeta[] = React.useMemo(() => {
    return baseThemes.filter((t) => popularThemeIds.has(t.id) || newestThemeIds.has(t.id));
  }, [baseThemes, popularThemeIds, newestThemeIds]);

  return (
    <section id="tema" className="w-full space-y-8 py-16 scroll-mt-20">
      {/* 1. Header Section */}
      <div className="text-center space-y-2.5 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-orange-50 border border-orange-100 text-[#F97316] text-xs font-semibold">
          <Palette className="w-3.5 h-3.5" />
          <span>Katalog Tema Pilihan</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Pilihan Desain Tema Terlaris &amp; Terbaru
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Desain elegan dengan tata letak visual memukau untuk ponsel pintar. Temukan tema yang paling cocok untuk hari bahagia Anda.
        </p>
      </div>

      {/* 2. Grid of Theme Cards: 4 columns on desktop, 3 on tablet, 2 on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 max-w-7xl mx-auto">
        {featuredThemes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isPopular={popularThemeIds.has(theme.id)}
            isNew={newestThemeIds.has(theme.id)}
          />
        ))}
      </div>

      {/* 4. Bottom Link to Dedicated Themes Page */}
      <div className="pt-4 text-center">
        <Link
          href="/themes"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow-md hover:scale-[1.01]"
        >
          <span>Jelajahi Seluruh Koleksi Tema ({THEME_LIST.length} Desain)</span>
          <ArrowRight className="w-4 h-4 text-[#F97316]" />
        </Link>
      </div>
    </section>
  );
};

export default ThemeCatalogSection;

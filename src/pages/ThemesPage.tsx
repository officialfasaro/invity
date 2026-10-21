"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowRight,
  Rocket,
} from "lucide-react";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import ThemeCard from "@/components/marketing/ThemeCard";
import {
  THEME_LIST,
  ThemeId,
  ThemeMeta,
  validateNewestThemeIds,
  getPopularThemeIds,
} from "@/types/wedding";

interface SanityThemeApiItem {
  id: string;
  themeKey?: string;
  name?: string;
  category?: string;
  thumbnail?: string;
  previewUrl?: string | null;
  isPremium?: boolean;
  features?: string[];
}

type TierFilter = "ALL" | "PRO" | "GENERAL";
type SortOption = "POPULAR" | "NEWEST";

const CATEGORIES = [
  "Semua Kategori",
  "3D Interaktif",
  "Royal & Adat",
  "Modern Editorial",
  "Chiaroscuro & Adat",
  "Floral Botanical",
] as const;

export const ThemesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua Kategori");
  const [selectedTier, setSelectedTier] = useState<TierFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("POPULAR");
  const [themeStats, setThemeStats] = useState<Record<string, number>>({});
  const [sanityThemes, setSanityThemes] = useState<ThemeMeta[]>(THEME_LIST);

  // Sinkronisasi data katalog tema dari Sanity CMS & statistik penggunaan Hari H
  useEffect(() => {
    fetch("/api/public/themes")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
          const merged: ThemeMeta[] = (json.data as SanityThemeApiItem[]).map((st) => {
            const fallback = THEME_LIST.find((f) => f.id === st.themeKey || f.id === st.id);
            const targetId = (st.themeKey || st.id) as ThemeId;
            return {
              id: targetId,
              code: st.themeKey || st.id,
              name: st.name || fallback?.name || st.themeKey || "Tema Baru",
              category: st.category || fallback?.category || "Minimalist",
              description: fallback?.description || `Tema elegan dengan desain eksklusif ${st.name || ""}`,
              thumbnail: st.thumbnail || fallback?.thumbnail || "",
              previewUrl: st.previewUrl || fallback?.previewUrl || `/invitation/demo-${st.themeKey || st.id}`,
              tier: st.isPremium ? "PRO" : "GENERAL",
              bgPreview: fallback?.bgPreview || "from-slate-800 to-slate-900",
              features: st.features || fallback?.features || [],
              usageCount: fallback?.usageCount || 0,
              fontHeading: fallback?.fontHeading || "font-serif",
              fontBody: fallback?.fontBody || "font-sans",
              accentColor: fallback?.accentColor || "#F97316",
              createdAt: fallback?.createdAt || "2026-10-01",
            };
          });
          setSanityThemes(merged);
        }
      })
      .catch(() => {});

    fetch("/api/public/theme-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && json?.data) {
          setThemeStats(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Gabungkan baseline data dengan data real Hari H
  const baseThemes: ThemeMeta[] = useMemo(() => {
    return sanityThemes.map((t) => {
      const serverUsage = themeStats[t.id];
      return {
        ...t,
        usageCount: serverUsage !== undefined ? serverUsage : t.usageCount,
      };
    });
  }, [sanityThemes, themeStats]);

  // Validasi 5 tema paling terakhir berdasarkan tanggal rilis (createdAt)
  const newestThemeIds = useMemo(() => validateNewestThemeIds(baseThemes, 5), [baseThemes]);

  // Filtering & Sorting
  const filteredThemes: ThemeMeta[] = useMemo(() => {
    let result = [...baseThemes];

    // 1. Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.code.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (selectedCategory !== "Semua Kategori") {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // 3. Tier Filter (Pro vs General)
    if (selectedTier === "PRO") {
      result = result.filter((t) => t.tier === "PRO");
    } else if (selectedTier === "GENERAL") {
      result = result.filter((t) => t.tier === "GENERAL" || (t.tier as string) === "FREE");
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === "POPULAR") {
        return (b.usageCount || 0) - (a.usageCount || 0);
      }
      if (sortBy === "NEWEST") {
        const timeA = new Date(a.createdAt || "2026-01-01").getTime();
        const timeB = new Date(b.createdAt || "2026-01-01").getTime();
        return timeB - timeA;
      }
      return 0;
    });

    return result;
  }, [baseThemes, searchQuery, selectedCategory, selectedTier, sortBy]);

  // Hitung tema Terlaris:
  // Jika sedang menggunakan filter, dihitung dari keseluruhan tema yang sedang ditampilkan menggunakan filter tersebut.
  // Jika tidak berfilter, dihitung dari total keseluruhan tema.
  const popularThemeIds = useMemo(() => {
    return getPopularThemeIds(filteredThemes, baseThemes);
  }, [filteredThemes, baseThemes]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "Semua Kategori" ||
    selectedTier !== "ALL";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Semua Kategori");
    setSelectedTier("ALL");
    setSortBy("POPULAR");
  };

  return (
    <div className="min-h-screen bg-[#F3F6FB] flex flex-col text-slate-800 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* 1. Header Navigation */}
      <MarketingNavbar />

      {/* 2. Search & Filter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-6 sm:pt-8 pb-4 space-y-4">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs space-y-4">
          {/* Row 1: Search Input & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tema, gaya, atau fitur (cth: Tema 01, 3D, Royal, Floral)..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#E2E8F0] bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 text-xs sm:text-sm text-slate-900 transition-all outline-hidden placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  aria-label="Hapus kata kunci"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tier Buttons: ALL / PRO / FREE */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedTier("ALL")}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedTier === "ALL"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier("PRO")}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  selectedTier === "PRO"
                    ? "bg-[#F97316] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Pro</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier("GENERAL")}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  selectedTier === "GENERAL"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>General</span>
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 hidden md:inline">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Urutkan tema"
                className="py-2.5 px-3 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:border-[#F97316] outline-hidden cursor-pointer"
              >
                <option value="POPULAR">Terlaris</option>
                <option value="NEWEST">Terbaru</option>
              </select>
            </div>
          </div>

          {/* Row 2: Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto thin-scrollbar-x pt-1 pb-2.5">
            <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Kategori:</span>
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Counter & Active Filter Badge */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <span>
              Menampilkan <strong>{filteredThemes.length}</strong> dari {THEME_LIST.length} tema
            </span>
            {selectedTier === "PRO" && (
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#F97316] font-semibold text-[10px]">
                Filter: Tema Pro
              </span>
            )}
            {selectedTier === "GENERAL" && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                Filter: Tema General
              </span>
            )}
            {selectedCategory !== "Semua Kategori" && (
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold text-[10px]">
                {selectedCategory}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[#F97316] hover:underline font-semibold cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </section>

      {/* 4. Theme Grid: 4 Columns on Desktop, 3 on Tablet, 2 on Mobile */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full pb-16 flex-1">
        {filteredThemes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {filteredThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isPopular={popularThemeIds.has(theme.id)}
                isNew={newestThemeIds.has(theme.id)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center bg-white rounded-2xl border border-[#E2E8F0] max-w-md mx-auto space-y-3 mt-8">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-[#F97316] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Tidak Ada Tema yang Sesuai
            </h3>
            <p className="text-xs text-slate-500">
              Tidak ditemukan tema dengan kata kunci &ldquo;{searchQuery}&rdquo; atau filter yang dipilih. Coba gunakan kata kunci lain.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white transition-colors cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </section>

      {/* 5. Bottom Conversion Banner */}
      <section className="border-t border-[#E2E8F0] bg-white py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-xs uppercase tracking-wider font-semibold text-orange-100 flex items-center justify-center sm:justify-start gap-1">
              <Rocket className="w-3.5 h-3.5" />
              <span>Mulai Buat Undangan</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Sudah Menemukan Tema Pilihan Anda?
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
              Pilih paket Anda sekarang dan buat undangan pernikahan digital elegan hanya dalam hitungan menit.
            </p>
          </div>

          <Link
            href="/login?from=/dashboard"
            className="py-3 px-6 rounded-full bg-white text-[#F97316] hover:bg-orange-50 font-bold text-xs sm:text-sm transition-all shadow-sm shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <span>Buat Undangan Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#F8FAFC] py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Invity by Fasaro. Seluruh Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <Link href="/" className="hover:text-[#F97316]">Beranda</Link>
            <Link href="/themes" className="hover:text-[#F97316]">Tema Undangan</Link>
            <Link href="/login" className="hover:text-[#F97316]">Masuk ke Akun</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ThemesPage;

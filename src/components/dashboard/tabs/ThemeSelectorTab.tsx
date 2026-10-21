"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import {
  Check,
  Eye,
  Palette,
} from "lucide-react";
import { THEME_LIST, ThemeId, ThemeMeta } from "@/types/wedding";

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

interface ThemeSelectorTabProps {
  currentThemeId: ThemeId;
  slug?: string;
  tier?: string | null;
  onSelectTheme: (id: ThemeId) => void;
  onUpgradeClick?: () => void;
}

export const ThemeSelectorTab: React.FC<ThemeSelectorTabProps> = ({
  currentThemeId,
  slug,
  tier,
  onSelectTheme,
}) => {
  const [themes, setThemes] = useState<ThemeMeta[]>(THEME_LIST);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<"POPULAR" | "NEWEST" | "NAME">("POPULAR");

  // Ambil data template resmi terkini dari Sanity CMS
  useEffect(() => {
    fetch("/api/public/themes")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
          const apiThemes = json.data as SanityThemeApiItem[];
          const merged: ThemeMeta[] = apiThemes.map((st) => {
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
              usageCount: fallback?.usageCount || 25,
              fontHeading: fallback?.fontHeading || "font-serif",
              fontBody: fallback?.fontBody || "font-sans",
              accentColor: fallback?.accentColor || "#F97316",
              createdAt: fallback?.createdAt || "2026-10-01",
            };
          });
          setThemes(merged);
        }
      })
      .catch(() => {});
  }, []);

  // Kategori dinamis
  const categories = useMemo(() => {
    const set = new Set<string>();
    themes.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return ["Semua", ...Array.from(set)];
  }, [themes]);

  // Filter & Urutkan tema
  const filteredThemes = useMemo(() => {
    let list = themes;
    if (selectedCategory !== "Semua") {
      list = list.filter((t) => (t.category || "Minimalist") === selectedCategory);
    }

    return [...list].sort((a, b) => {
      if (sortBy === "POPULAR") {
        return (b.usageCount || 0) - (a.usageCount || 0);
      }
      if (sortBy === "NEWEST") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [themes, selectedCategory, sortBy]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Pilihan Desain Tema Undangan
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Ganti tema kapan saja secara instan. Seluruh data mempelai yang sudah Anda isi otomatis diterapkan ke tema yang dipilih.
        </p>
      </div>

      {/* Starter Tier Info Banner */}
      {(tier === "STARTER" || tier === "FREE") && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#F97316] shrink-0" />
            <span>
              Anda saat ini aktif menggunakan tema{" "}
              <strong>
                {themes.find((t) => t.id === currentThemeId)?.name || "Botanical Tema 01"}
              </strong>
              .
            </span>
          </div>
        </div>
      )}

      {/* Filter & Sorting Card (Sesuai Referensi Pengguna) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 sm:p-4 shadow-xs space-y-3">
        {/* Dropdown Urutkan */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-themes" className="text-xs text-slate-500 font-medium">
            Urutkan
          </label>
          <select
            id="sort-themes"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "POPULAR" | "NEWEST" | "NAME")}
            className="text-xs font-semibold border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-[#F97316] shadow-2xs cursor-pointer"
          >
            <option value="POPULAR">Terpopuler</option>
            <option value="NEWEST">Terbaru</option>
            <option value="NAME">Nama A-Z</option>
          </select>
        </div>

        {/* Filter Pills with Count Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2.5 thin-scrollbar-x">
          {categories.map((cat) => {
            const count =
              cat === "Semua"
                ? themes.length
                : themes.filter((t) => (t.category || "Minimalist") === cat).length;
            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-orange-50 text-[#F97316] border border-orange-200 shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-transparent"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-none ${
                    isActive
                      ? "bg-[#F97316] text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Theme Cards: 2 Kolom di Mobile Sesuai Referensi Pengguna */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredThemes.map((theme) => {
          const isSelected = currentThemeId === theme.id;
          const previewUrl = slug
            ? isSelected
              ? `/invitation/${slug}`
              : `/invitation/${slug}?theme=${theme.id}`
            : `/invitation/demo-${theme.id}`;

          return (
            <div
              key={theme.id}
              className={`bg-white rounded-xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                isSelected
                  ? "border-2 border-[#F97316] ring-2 ring-orange-100"
                  : "border-[#E2E8F0] hover:border-slate-300"
              }`}
            >
              {/* Visual Preview Box with Wedding Image */}
              <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                {theme.thumbnail ? (
                  <Image
                    src={theme.thumbnail}
                    alt={`Preview Tema ${theme.name}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-tr ${theme.bgPreview}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                {/* Top-Left: Golden Seal / Monogram Emblem (Sesuai Referensi) */}
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-amber-50/95 border border-amber-300/80 text-amber-800 flex items-center justify-center text-[10px] font-bold font-serif shadow-xs">
                  F
                </div>

                {/* Top-Right: Active / Selected Badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span className="hidden sm:inline">Aktif</span>
                  </div>
                )}
              </div>

              {/* Card Details Area */}
              <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-2.5">
                <div className="space-y-1">
                  {/* Category Badge */}
                  <span className="inline-block text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded leading-none">
                    {theme.category || "Gold"}
                  </span>

                  {/* Theme Name */}
                  <h3
                    className="font-bold text-xs sm:text-sm text-slate-900 truncate leading-tight"
                    title={theme.name}
                  >
                    {theme.name}
                  </h3>
                </div>

                {/* Action Buttons Stack (Preview & Pilih / Digunakan) */}
                <div className="space-y-1.5 pt-1">
                  {/* Button 1: Preview (Warna Abu-Abu Sesuai Permintaan) */}
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 sm:py-2 px-2 rounded-lg text-xs font-semibold bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs text-center"
                    title="Buka pratinjau tema"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </a>

                  {/* Button 2: Pilih / Digunakan */}
                  {isSelected ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-1.5 sm:py-2 px-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white flex items-center justify-center gap-1.5 shadow-2xs cursor-default text-center"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Digunakan</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectTheme(theme.id)}
                      className="w-full py-1.5 sm:py-2 px-2 rounded-lg text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs text-center"
                    >
                      <span>Pilih</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredThemes.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white border border-[#E2E8F0] rounded-xl text-slate-400 text-xs">
            Tidak ada tema dalam kategori ini.
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeSelectorTab;

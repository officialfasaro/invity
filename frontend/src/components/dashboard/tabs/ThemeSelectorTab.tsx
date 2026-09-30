"use client";

import React from "react";
import Image from "next/image";
import {
  Check,
  ExternalLink,
  Eye,
  Lock,
  Sparkles,
} from "lucide-react";
import { THEME_LIST, ThemeId } from "@/types/wedding";

interface ThemeSelectorTabProps {
  currentThemeId: ThemeId;
  slug?: string;
  tier?: string | null;
  onSelectTheme: (id: ThemeId) => void;
  onOpenPreview: () => void;
  onUpgradeClick?: () => void;
}

export const ThemeSelectorTab: React.FC<ThemeSelectorTabProps> = ({
  currentThemeId,
  slug,
  tier,
  onSelectTheme,
  onOpenPreview,
  onUpgradeClick,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Pilihan Desain Tema Undangan
          </h2>
          <p className="text-xs text-slate-500">
            Ganti tema kapan saja secara instan. Seluruh data mempelai yang sudah Anda isi otomatis diterapkan ke tema yang dipilih.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPreview}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Lihat di Layar Ponsel</span>
        </button>
      </div>

      {/* Starter Tier Info Banner */}
      {(tier === "STARTER" || tier === "FREE") && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F97316] shrink-0" />
            <span>
              Anda saat ini menggunakan <strong>Paket Starter</strong> dengan akses tema Minimalist. Upgrade ke Paket Elegant atau Ultimate untuk membuka seluruh koleksi tema adat, floral, dan luxury.
            </span>
          </div>
          {onUpgradeClick && (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs shrink-0 transition-colors shadow-2xs"
            >
              Buka Semua Tema
            </button>
          )}
        </div>
      )}

      {/* Grid Theme Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {THEME_LIST.map((theme) => {
          const isSelected = currentThemeId === theme.id;
          const isLockedForTier = (tier === "STARTER" || tier === "FREE") && theme.id !== "minimalist";
          const previewUrl = slug
            ? isSelected
              ? `/invitation/${slug}`
              : `/invitation/${slug}?theme=${theme.id}`
            : `/invitation/demo-${theme.id}`;

          return (
            <div
              key={theme.id}
              className={`rounded-xl bg-white border p-4 shadow-xs transition-all flex flex-col justify-between space-y-3.5 ${
                isSelected
                  ? "border-2 border-[#F97316] ring-1 ring-orange-100"
                  : "border-[#E2E8F0] hover:border-slate-300"
              }`}
            >
              {/* Visual Preview Box with Wedding Image */}
              <div className="relative h-44 w-full rounded-lg overflow-hidden bg-slate-100 border border-[#E2E8F0] group/img">
                {theme.thumbnail ? (
                  <Image
                    src={theme.thumbnail}
                    alt={`Preview Tema ${theme.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-tr ${theme.bgPreview}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider text-white font-semibold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs border border-white/20">
                    {theme.category}
                  </span>
                  {isLockedForTier && (
                    <span className="text-[10px] text-amber-200 font-semibold px-2 py-0.5 rounded-full bg-amber-950/80 backdrop-blur-xs border border-amber-500/40 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-300" />
                      <span>Berbayar</span>
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <span className="text-white font-bold text-sm drop-shadow-md">
                    {theme.name}
                  </span>
                </div>

                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#F97316] text-white flex items-center justify-center shadow-xs z-10">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Theme Info */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">{theme.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{theme.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-2 rounded-lg text-xs font-semibold border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 text-center flex items-center justify-center gap-1 transition-colors min-h-[40px]"
                    title={
                      slug
                        ? isSelected
                          ? "Buka undangan Anda dengan data asli"
                          : "Pratinjau data mempelai Anda pada tema ini"
                        : "Buka demo"
                    }
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isSelected ? "Buka Web" : "Pratinjau"}</span>
                  </a>

                  {isLockedForTier ? (
                    <button
                      type="button"
                      onClick={onUpgradeClick}
                      className="py-2 px-2 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1 transition-colors min-h-[40px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xs"
                      title="Upgrade paket untuk membuka tema ini"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Upgrade</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectTheme(theme.id)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1 transition-colors min-h-[40px] ${
                        isSelected
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Digunakan</span>
                        </>
                      ) : (
                        <span>Terapkan</span>
                      )}
                    </button>
                  )}
                </div>

                {slug && (
                  <div className="text-center">
                    <a
                      href={`/invitation/demo-${theme.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors inline-block py-0.5"
                    >
                      Lihat versi contoh dummy &rarr;
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelectorTab;

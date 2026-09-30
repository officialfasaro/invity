"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  Eye,
  Save,
  Tag,
  ListPlus,
  Sparkles,
  Info,
} from "lucide-react";
import { SettingItem } from "./AdminCmsContentTab";

interface AdminPricingTabProps {
  settings: SettingItem[];
  onSaveSettings: (updatedSettings: SettingItem[]) => Promise<void>;
  isSaving: boolean;
}

const DEFAULT_STARTER_FEATURES = `1 Pilihan Tema Minimalist
Masa Aktif 90 Hari
Galeri hingga 10 Foto
Amplop (2 Rekening Bank)
Buku Ucapan & Doa
Navigasi Google Maps`;

const DEFAULT_ELEGANT_FEATURES = `Akses Semua Tema Desain
Ganti Tema 1-Klik Bebas
Masa Aktif 365 Hari
Galeri Foto HD Tanpa Batas
Amplop Bebas + QRIS Donasi
Buku Tamu & RSVP Realtime
Background Musik Autoplay`;

const DEFAULT_ULTIMATE_FEATURES = `Seluruh Fitur Paket Elegant
Masa Aktif Selamanya (Lifetime)
QR Code Check-in Meja Tamu
WhatsApp Blast Generator
Story / Love Story Timeline Kustom
Prioritas Verifikasi Kilat 10 Menit
Dukungan WhatsApp Prioritas`;

export const AdminPricingTab: React.FC<AdminPricingTabProps> = ({
  settings,
  onSaveSettings,
  isSaving,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};
    for (const item of settings) {
      map[item.key] = item.value;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(map);
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SettingItem[] = settings.map((s) => ({
      ...s,
      value: formData[s.key] !== undefined ? formData[s.key] : s.value,
    }));

    const extraPricingKeys = [
      "price_starter",
      "price_starter_original",
      "max_photos_starter",
      "max_accounts_starter",
      "price_elegant",
      "price_elegant_original",
      "price_ultimate",
      "price_ultimate_original",
      "plan_starter_name",
      "plan_starter_desc",
      "plan_starter_period",
      "plan_starter_badge",
      "plan_starter_features",
      "plan_elegant_name",
      "plan_elegant_desc",
      "plan_elegant_period",
      "plan_elegant_badge",
      "plan_elegant_features",
      "plan_ultimate_name",
      "plan_ultimate_desc",
      "plan_ultimate_period",
      "plan_ultimate_badge",
      "plan_ultimate_features",
    ];

    for (const k of extraPricingKeys) {
      if (formData[k] !== undefined && !updated.some((item) => item.key === k)) {
        updated.push({
          id: `custom-${k}`,
          key: k,
          value: formData[k],
          category: "cms",
          label: k,
          description: "",
          isPublic: true,
        });
      }
    }

    await onSaveSettings(updated);
  };

  // Pricing values for Live Preview
  const starterPrice = parseInt(formData.price_starter || "39000", 10) || 39000;
  const starterOriginal = parseInt(formData.price_starter_original || "89000", 10) || 89000;

  const elegantPrice = parseInt(formData.price_elegant || "149000", 10) || 149000;
  const elegantOriginal = parseInt(formData.price_elegant_original || "249000", 10) || 249000;

  const ultimatePrice = parseInt(formData.price_ultimate || "279000", 10) || 279000;
  const ultimateOriginal = parseInt(formData.price_ultimate_original || "499000", 10) || 499000;

  // Content values for Live Preview
  const starterName = formData.plan_starter_name || "Paket Starter";
  const starterDesc = formData.plan_starter_desc || "Untuk syukuran intim keluarga.";
  const starterPeriod = formData.plan_starter_period || "Masa Aktif 3 Bulan";
  const starterBadge = formData.plan_starter_badge || "Entry Tier";
  const starterFeaturesRaw =
    formData.plan_starter_features !== undefined
      ? formData.plan_starter_features
      : DEFAULT_STARTER_FEATURES;
  const starterFeaturesList = starterFeaturesRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const elegantName = formData.plan_elegant_name || "Paket Elegant";
  const elegantDesc = formData.plan_elegant_desc || "Untuk resepsi lengkap & modern.";
  const elegantPeriod = formData.plan_elegant_period || "Masa Aktif 1 Tahun Penuh";
  const elegantBadge = formData.plan_elegant_badge || "Paling Populer";
  const elegantFeaturesRaw =
    formData.plan_elegant_features !== undefined
      ? formData.plan_elegant_features
      : DEFAULT_ELEGANT_FEATURES;
  const elegantFeaturesList = elegantFeaturesRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const ultimateName = formData.plan_ultimate_name || "Ultimate Event Day";
  const ultimateDesc = formData.plan_ultimate_desc || "Solusi hari-H check-in tamu VIP.";
  const ultimatePeriod = formData.plan_ultimate_period || "Masa Aktif Selamanya";
  const ultimateBadge = formData.plan_ultimate_badge || "VIP Hari-H";
  const ultimateFeaturesRaw =
    formData.plan_ultimate_features !== undefined
      ? formData.plan_ultimate_features
      : DEFAULT_ULTIMATE_FEATURES;
  const ultimateFeaturesList = ultimateFeaturesRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const calculateDiscount = (price: number, orig: number) => {
    if (orig <= price) return null;
    return Math.round(((orig - price) / orig) * 100);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-sans font-bold text-slate-900">
              Pengaturan Konten &amp; Harga Paket (Live Preview)
            </h2>
            <p className="text-xs text-slate-500">
              Atur judul, deskripsi, masa aktif, harga, serta poin-poin fitur setiap paket. Pratinjau di sebelah kanan tersinkronisasi otomatis.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Menyimpan..." : "Simpan Pengaturan Paket"}</span>
        </button>
      </div>

      {/* Main Split Layout: Left Form (5 cols), Right Preview (7 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: EDIT FORM */}
        <div className="xl:col-span-6 space-y-6">
          {/* Card 1: Starter Package */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span>1. Paket Starter</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                {starterBadge}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Paket</label>
                <input
                  type="text"
                  value={formData.plan_starter_name ?? "Paket Starter"}
                  onChange={(e) => handleChange("plan_starter_name", e.target.value)}
                  placeholder="Paket Starter"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Badge Label (Tag Atas)</label>
                <input
                  type="text"
                  value={formData.plan_starter_badge ?? "Entry Tier"}
                  onChange={(e) => handleChange("plan_starter_badge", e.target.value)}
                  placeholder="Contoh: Entry Tier"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={formData.plan_starter_desc ?? "Untuk syukuran intim keluarga."}
                  onChange={(e) => handleChange("plan_starter_desc", e.target.value)}
                  placeholder="Untuk akad intim & syukuran keluarga."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Keterangan Masa Aktif</label>
                <input
                  type="text"
                  value={formData.plan_starter_period ?? "Masa Aktif 3 Bulan"}
                  onChange={(e) => handleChange("plan_starter_period", e.target.value)}
                  placeholder="Masa Aktif 90 Hari (3 Bulan)"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Harga Promo (Rp)</label>
                <input
                  type="number"
                  value={formData.price_starter || "39000"}
                  onChange={(e) => handleChange("price_starter", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] font-mono text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Harga Coret (Rp)</label>
                <input
                  type="number"
                  value={formData.price_starter_original || "89000"}
                  onChange={(e) => handleChange("price_starter_original", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] font-mono text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Maks. Galeri Foto</label>
                <input
                  type="number"
                  value={formData.max_photos_starter || "10"}
                  onChange={(e) => handleChange("max_photos_starter", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] font-mono text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Maks. Rekening Amplop</label>
                <input
                  type="number"
                  value={formData.max_accounts_starter || "2"}
                  onChange={(e) => handleChange("max_accounts_starter", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] font-mono text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>
            </div>

            {/* Poin-Poin Fitur Starter */}
            <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ListPlus className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>Daftar Fitur Paket Starter (1 Baris = 1 Fitur)</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {starterFeaturesList.length} Poin Fitur
                </span>
              </label>
              <textarea
                rows={5}
                value={starterFeaturesRaw}
                onChange={(e) => handleChange("plan_starter_features", e.target.value)}
                placeholder="1 Pilihan Tema Minimalist&#10;Masa Aktif 90 Hari&#10;Galeri hingga 10 Foto&#10;Amplop (2 Rekening Bank)"
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316] font-mono leading-relaxed"
              />
              <p className="text-[10px] text-slate-400">
                Poin fitur di atas langsung dirender sebagai checklist pada kartu harga beranda dan dashboard.
              </p>
            </div>
          </div>

          {/* Card 2: Elegant Package */}
          <div className="rounded-xl border-2 border-orange-200 bg-orange-50/20 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-orange-200 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F97316] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                <span>2. Paket Elegant (Best Seller)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#F97316] text-white font-bold">
                {elegantBadge}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Paket</label>
                <input
                  type="text"
                  value={formData.plan_elegant_name ?? "Paket Elegant"}
                  onChange={(e) => handleChange("plan_elegant_name", e.target.value)}
                  placeholder="Paket Elegant"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Badge Label (Tag Atas)</label>
                <input
                  type="text"
                  value={formData.plan_elegant_badge ?? "Paling Populer"}
                  onChange={(e) => handleChange("plan_elegant_badge", e.target.value)}
                  placeholder="Contoh: Paling Populer"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={formData.plan_elegant_desc ?? "Untuk resepsi lengkap & modern."}
                  onChange={(e) => handleChange("plan_elegant_desc", e.target.value)}
                  placeholder="Untuk resepsi pernikahan lengkap & modern."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Keterangan Masa Aktif</label>
                <input
                  type="text"
                  value={formData.plan_elegant_period ?? "Masa Aktif 1 Tahun Penuh"}
                  onChange={(e) => handleChange("plan_elegant_period", e.target.value)}
                  placeholder="Masa Aktif 1 Tahun Penuh (365 Hari)"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Harga Promo (Rp)</label>
                <input
                  type="number"
                  value={formData.price_elegant || "149000"}
                  onChange={(e) => handleChange("price_elegant", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] font-mono text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Harga Coret (Rp)</label>
                <input
                  type="number"
                  value={formData.price_elegant_original || "249000"}
                  onChange={(e) => handleChange("price_elegant_original", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] font-mono text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>
            </div>

            {/* Poin-Poin Fitur Elegant */}
            <div className="pt-2 border-t border-orange-200 space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ListPlus className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>Daftar Fitur Paket Elegant (1 Baris = 1 Fitur)</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {elegantFeaturesList.length} Poin Fitur
                </span>
              </label>
              <textarea
                rows={5}
                value={elegantFeaturesRaw}
                onChange={(e) => handleChange("plan_elegant_features", e.target.value)}
                placeholder="Akses Semua Tema Desain&#10;Ganti Tema 1-Klik Bebas&#10;Masa Aktif 365 Hari&#10;Galeri Foto HD Tanpa Batas"
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316] font-mono leading-relaxed"
              />
              <p className="text-[10px] text-slate-400">
                Poin fitur di atas langsung dirender sebagai checklist pada kartu harga beranda dan dashboard.
              </p>
            </div>
          </div>

          {/* Card 3: Ultimate Package */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span>3. Paket Ultimate Event Day</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                {ultimateBadge}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Paket</label>
                <input
                  type="text"
                  value={formData.plan_ultimate_name ?? "Ultimate Event Day"}
                  onChange={(e) => handleChange("plan_ultimate_name", e.target.value)}
                  placeholder="Ultimate Event Day"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Badge Label (Tag Atas)</label>
                <input
                  type="text"
                  value={formData.plan_ultimate_badge ?? "VIP Hari-H"}
                  onChange={(e) => handleChange("plan_ultimate_badge", e.target.value)}
                  placeholder="Contoh: VIP Hari-H"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={formData.plan_ultimate_desc ?? "Solusi hari-H check-in tamu VIP."}
                  onChange={(e) => handleChange("plan_ultimate_desc", e.target.value)}
                  placeholder="Solusi hari-H check-in tamu VIP resepsi."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Keterangan Masa Aktif</label>
                <input
                  type="text"
                  value={formData.plan_ultimate_period ?? "Masa Aktif Selamanya"}
                  onChange={(e) => handleChange("plan_ultimate_period", e.target.value)}
                  placeholder="Masa Aktif Selamanya (Lifetime)"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Harga Promo (Rp)</label>
                <input
                  type="number"
                  value={formData.price_ultimate || "279000"}
                  onChange={(e) => handleChange("price_ultimate", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] font-mono text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Harga Coret (Rp)</label>
                <input
                  type="number"
                  value={formData.price_ultimate_original || "499000"}
                  onChange={(e) => handleChange("price_ultimate_original", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] font-mono text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>
            </div>

            {/* Poin-Poin Fitur Ultimate */}
            <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ListPlus className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>Daftar Fitur Paket Ultimate (1 Baris = 1 Fitur)</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {ultimateFeaturesList.length} Poin Fitur
                </span>
              </label>
              <textarea
                rows={5}
                value={ultimateFeaturesRaw}
                onChange={(e) => handleChange("plan_ultimate_features", e.target.value)}
                placeholder="Seluruh Fitur Paket Elegant&#10;Masa Aktif Selamanya (Lifetime)&#10;QR Code Check-in Meja Tamu&#10;WhatsApp Blast Generator"
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316] font-mono leading-relaxed"
              />
              <p className="text-[10px] text-slate-400">
                Poin fitur di atas langsung dirender sebagai checklist pada kartu harga beranda dan dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW */}
        <div className="xl:col-span-6 space-y-4 xl:sticky xl:top-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#F97316]" />
              <span className="text-xs font-bold text-slate-900">
                Live Preview Tampilan Landing Page
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sinkron Real-time</span>
            </span>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Perubahan teks, harga, dan fitur yang Anda ketik di sebelah kiri langsung ter-update di pratinjau ini dan akan tampil persis sama di Landing Page dan Dashboard pengguna.
            </span>
          </div>

          {/* 3-Card Grid Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
            {/* 1. Preview Starter */}
            <div className="rounded-xl bg-white border border-[#E2E8F0] p-4 flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div>
                  {starterBadge && (
                    <span className="inline-block mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1.5 py-0.5 rounded bg-slate-100">
                      {starterBadge}
                    </span>
                  )}
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{starterName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{starterDesc}</p>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs line-through text-slate-400 font-mono">
                      Rp {starterOriginal.toLocaleString("id-ID")}
                    </span>
                    {calculateDiscount(starterPrice, starterOriginal) && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Hemat {calculateDiscount(starterPrice, starterOriginal)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-slate-900 font-sans tracking-tight">
                      Rp {starterPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">{starterPeriod}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0] text-[11px] text-slate-600">
                  {starterFeaturesList.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Preview Elegant */}
            <div className="rounded-xl bg-white border-2 border-[#F97316] p-4 flex flex-col justify-between relative shadow-sm ring-1 ring-orange-100">
              {elegantBadge && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#F97316] text-white text-[10px] font-bold shadow-xs whitespace-nowrap">
                  {elegantBadge}
                </div>
              )}

              <div className="space-y-3 pt-1">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{elegantName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{elegantDesc}</p>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs line-through text-slate-400 font-mono">
                      Rp {elegantOriginal.toLocaleString("id-ID")}
                    </span>
                    {calculateDiscount(elegantPrice, elegantOriginal) && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Hemat {calculateDiscount(elegantPrice, elegantOriginal)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-[#F97316] font-sans tracking-tight">
                      Rp {elegantPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">{elegantPeriod}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0] text-[11px] text-slate-600">
                  {elegantFeaturesList.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#F97316] shrink-0 mt-0.5" />
                      <span className={`leading-tight ${idx === 0 ? "font-semibold text-slate-900" : ""}`}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Preview Ultimate */}
            <div className="rounded-xl bg-white border border-[#E2E8F0] p-4 flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div>
                  {ultimateBadge && (
                    <span className="inline-block mb-1 text-[9px] font-bold uppercase tracking-wider text-purple-700 px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200">
                      {ultimateBadge}
                    </span>
                  )}
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{ultimateName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{ultimateDesc}</p>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs line-through text-slate-400 font-mono">
                      Rp {ultimateOriginal.toLocaleString("id-ID")}
                    </span>
                    {calculateDiscount(ultimatePrice, ultimateOriginal) && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Hemat {calculateDiscount(ultimatePrice, ultimateOriginal)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-slate-900 font-sans tracking-tight">
                      Rp {ultimatePrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">{ultimatePeriod}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0] text-[11px] text-slate-600">
                  {ultimateFeaturesList.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className={`leading-tight ${idx === 0 ? "font-semibold text-slate-900" : ""}`}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AdminPricingTab;

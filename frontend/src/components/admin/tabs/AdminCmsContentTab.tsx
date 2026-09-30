"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Headphones,
  Heart,
  Info,
  Layers,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";

export interface SettingItem {
  id: string;
  key: string;
  value: string;
  label?: string;
  description: string | null;
  category?: "cms" | "feature" | "maintenance" | "gateway";
  isPublic?: boolean;
}

export interface ShowcaseWeddingItem {
  couple: string;
  date: string;
  venue: string;
  theme: string;
  img: string;
  slug: string;
}

const DEFAULT_SHOWCASE_WEDDINGS: ShowcaseWeddingItem[] = [
  {
    couple: "Faisal & Putri",
    date: "24 Oktober 2026",
    venue: "Balai Nan Gadang, Padang",
    theme: "Traditional Minang",
    img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80",
    slug: "demo-minang",
  },
  {
    couple: "Adi & Rara",
    date: "31 Agustus 2026",
    venue: "Aula Masjid ABRI, Cimahi",
    theme: "WebNikah Classic",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    slug: "demo-adirara",
  },
  {
    couple: "Rian & Sinta",
    date: "24 Oktober 2026",
    venue: "Grand Ballroom Sahid, Surabaya",
    theme: "Modern Editorial",
    img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
    slug: "demo-minimalist",
  },
];

interface AdminCmsContentTabProps {
  settings: SettingItem[];
  onSaveSettings: (updatedSettings: SettingItem[]) => Promise<void>;
  isSaving: boolean;
}

export const AdminCmsContentTab: React.FC<AdminCmsContentTabProps> = ({
  settings,
  onSaveSettings,
  isSaving,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseWeddingItem[]>(
    DEFAULT_SHOWCASE_WEDDINGS
  );

  useEffect(() => {
    const map: Record<string, string> = {};
    for (const item of settings) {
      map[item.key] = item.value;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(map);

    // Parse showcase weddings from JSON
    if (map.showcase_weddings_json) {
      try {
        const parsed = JSON.parse(map.showcase_weddings_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setShowcaseItems(parsed);
        }
      } catch {
        // Fallback to default
      }
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleShowcaseChange = (
    index: number,
    field: keyof ShowcaseWeddingItem,
    value: string
  ) => {
    setShowcaseItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddShowcaseItem = () => {
    setShowcaseItems((prev) => [
      ...prev,
      {
        couple: "Pasangan Baru",
        date: "Tanggal Acara",
        venue: "Nama Tempat & Kota",
        theme: "Tema Undangan",
        img: "",
        slug: "demo-adirara",
      },
    ]);
  };

  const handleRemoveShowcaseItem = (index: number) => {
    if (showcaseItems.length <= 1) return;
    setShowcaseItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Serialize showcase items into JSON string
    const updatedFormData: Record<string, string> = {
      ...formData,
      showcase_weddings_json: JSON.stringify(showcaseItems),
    };

    // Map updatedFormData back to SettingItem array
    const updated: SettingItem[] = settings.map((s) => ({
      ...s,
      value:
        updatedFormData[s.key] !== undefined
          ? updatedFormData[s.key]
          : s.value,
    }));

    // Ensure showcase_weddings_json is present
    const hasShowcase = updated.some((s) => s.key === "showcase_weddings_json");
    if (!hasShowcase) {
      updated.push({
        id: "def-showcase_weddings_json",
        key: "showcase_weddings_json",
        value: JSON.stringify(showcaseItems),
        label: "Data Pengantin Live Showcase",
        description: "Daftar pernikahan live showcase dalam format JSON",
        category: "cms",
        isPublic: true,
      });
    }

    await onSaveSettings(updated);
  };

  const isAnnouncementActive = formData.announcement_enabled === "true";
  const announcementType = formData.announcement_type || "info";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* SECTION 1: HERO & BRANDING */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-sans font-bold text-slate-900">
              Teks Utama Landing Page (Hero Section)
            </h2>
            <p className="text-xs text-slate-500">
              Ubah judul utama, deskripsi, teks badge, dan gambar mockup yang tampil di halaman beranda.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Teks Badge Atas</label>
              <input
                type="text"
                value={formData.site_hero_badge || ""}
                onChange={(e) => handleChange("site_hero_badge", e.target.value)}
                placeholder="250.000+ Pasangan Telah Menggunakan Platform Kami"
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Teks Badge Promo Keunggulan</label>
              <input
                type="text"
                value={formData.site_hero_promo || ""}
                onChange={(e) => handleChange("site_hero_promo", e.target.value)}
                placeholder="Mulai Rp 39rb Promo Spesial"
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Judul Utama Hero (H1)</label>
            <input
              type="text"
              value={formData.site_hero_title || ""}
              onChange={(e) => handleChange("site_hero_title", e.target.value)}
              placeholder="Buat Website Undangan Pernikahan Digital Elegan dalam Hitungan Menit"
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Subjudul / Deskripsi Hero</label>
            <textarea
              rows={3}
              value={formData.site_hero_subtitle || ""}
              onChange={(e) => handleChange("site_hero_subtitle", e.target.value)}
              placeholder="Penjelasan ringkas mengenai fitur unggulan Fasaro..."
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316] leading-relaxed"
            />
          </div>

          {/* Hero Image Upload */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <ImageUploadField
              label="Gambar Ilustrasi / Mockup Hero (Opsional)"
              value={formData.site_hero_image || ""}
              onChange={(url) => handleChange("site_hero_image", url)}
              folder="hero"
              helperText="Unggah gambar mockup undangan untuk ditampilkan di samping/bawah teks hero"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: LIVE SHOWCASE WEDDINGS */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-sans font-bold text-slate-900">
                Showcase Pengantin (Live Weddings Showcase)
              </h2>
              <p className="text-xs text-slate-500">
                Data pernikahan yang tampil di section &quot;Baru Saja Menikah Menggunakan Fasaro&quot;.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddShowcaseItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Tambah Pasangan</span>
          </button>
        </div>

        <div className="space-y-4">
          {showcaseItems.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 space-y-3 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Kartu #{idx + 1}: {item.couple || "Nama Pasangan"}
                </span>
                {showcaseItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveShowcaseItem(idx)}
                    className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nama Pasangan Pengantin</label>
                  <input
                    type="text"
                    value={item.couple}
                    onChange={(e) => handleShowcaseChange(idx, "couple", e.target.value)}
                    placeholder="Contoh: Faisal & Putri"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tanggal Pernikahan</label>
                  <input
                    type="text"
                    value={item.date}
                    onChange={(e) => handleShowcaseChange(idx, "date", e.target.value)}
                    placeholder="Contoh: 24 Oktober 2026"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nama Tempat &amp; Kota</label>
                  <input
                    type="text"
                    value={item.venue}
                    onChange={(e) => handleShowcaseChange(idx, "venue", e.target.value)}
                    placeholder="Contoh: Balai Nan Gadang, Padang"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nama Desain Tema</label>
                  <input
                    type="text"
                    value={item.theme}
                    onChange={(e) => handleShowcaseChange(idx, "theme", e.target.value)}
                    placeholder="Contoh: Traditional Minang"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700">Slug Tautan Undangan</label>
                  <input
                    type="text"
                    value={item.slug}
                    onChange={(e) => handleShowcaseChange(idx, "slug", e.target.value)}
                    placeholder="demo-minang"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] font-mono text-slate-900 focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                {/* Direct Image Upload for Couple Photo */}
                <div className="sm:col-span-2 pt-1">
                  <ImageUploadField
                    label="Unggah Foto Pernikahan Pasangan"
                    value={item.img}
                    onChange={(url) => handleShowcaseChange(idx, "img", url)}
                    folder="showcase"
                    helperText="Pilih foto langsung dari komputer Anda atau paste link foto"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: GLOBAL ANNOUNCEMENT BANNER */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-sans font-bold text-slate-900">
                Bilah Pengumuman Global (Announcement Bar)
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isAnnouncementActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {isAnnouncementActive ? "Aktif Tayang" : "Nonaktif"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tampilkan pesan pengumuman atau info penting di bagian paling atas situs web.
            </p>
          </div>
        </div>

        {/* Live Preview Box */}
        {isAnnouncementActive && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Pratinjau Bilah Pengumuman:
            </span>
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2.5 ${
                announcementType === "warning"
                  ? "bg-amber-500 text-slate-950"
                  : announcementType === "promo"
                  ? "bg-emerald-600 text-white"
                  : "bg-[#F97316] text-white"
              }`}
            >
              <Info className="w-4 h-4 shrink-0" />
              <span>{formData.announcement_text || "Isi pengumuman Anda..."}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Status Banner</label>
            <select
              value={formData.announcement_enabled || "false"}
              onChange={(e) => handleChange("announcement_enabled", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#F97316]"
            >
              <option value="false">Nonaktifkan Banner</option>
              <option value="true">Aktifkan Banner (Tayang)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Gaya Tampilan</label>
            <select
              value={formData.announcement_type || "info"}
              onChange={(e) => handleChange("announcement_type", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#F97316]"
            >
              <option value="info">Info Standar (Oranye Fasaro)</option>
              <option value="warning">Peringatan Pemeliharaan (Kuning/Amber)</option>
              <option value="promo">Promo &amp; Diskon (Hijau Emerald)</option>
            </select>
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Teks Pesan Pengumuman</label>
            <input
              type="text"
              value={formData.announcement_text || ""}
              onChange={(e) => handleChange("announcement_text", e.target.value)}
              placeholder="Contoh: 📢 Promo Spesial Bulan Ini! Dapatkan diskon hingga 56% untuk seluruh paket undangan."
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: CUSTOMER SUPPORT & CONTACT */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-sans font-bold text-slate-900">
              Pusat Bantuan &amp; Kontak Layanan
            </h2>
            <p className="text-xs text-slate-500">
              Nomor WhatsApp dan email yang digunakan tombol bantuan customer care.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Nomor WhatsApp Bantuan</label>
            <input
              type="text"
              value={formData.support_whatsapp || ""}
              onChange={(e) => handleChange("support_whatsapp", e.target.value)}
              placeholder="085716697416"
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 font-mono focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Email Layanan</label>
            <input
              type="email"
              value={formData.support_email || ""}
              onChange={(e) => handleChange("support_email", e.target.value)}
              placeholder="support@fasaro.id"
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Jam Operasional Layanan</label>
            <input
              type="text"
              value={formData.support_hours || ""}
              onChange={(e) => handleChange("support_hours", e.target.value)}
              placeholder="Senin - Minggu (08:00 - 22:00 WIB)"
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316]"
            />
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Menyimpan Konten..." : "Simpan Seluruh Konten"}</span>
        </button>
      </div>
    </form>
  );
};

export default AdminCmsContentTab;

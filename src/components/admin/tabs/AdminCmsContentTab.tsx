"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Calendar,
  Clock,
  Gift,
  Globe,
  Headphones,
  Heart,
  Images,
  Info,
  Layers,
  MapPin,
  MessageSquare,
  Plus,
  QrCode,
  Save,
  Share2,
  ShieldCheck,
  Trash2,
  Users,
  Video,
  Wallet,
  Zap,
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

export interface FeatureCardItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export const DEFAULT_FEATURE_CARDS: FeatureCardItem[] = [
  {
    id: "f1",
    icon: "Images",
    title: "Galeri Foto (Maks. 10 Foto)",
    desc: "Tampilkan momen prewedding terbaik Anda dalam album foto beresolusi tinggi dengan batas maksimal hingga 10 foto.",
  },
  {
    id: "f2",
    icon: "Wallet",
    title: "Amplop Digital & QRIS Terintegrasi",
    desc: "Tamu dapat mentransfer tanda kasih langsung melalui berbagai rekening bank dan QRIS otomatis.",
  },
  {
    id: "f3",
    icon: "Users",
    title: "RSVP Cerdas & Manajemen Kuota",
    desc: "Konfirmasi kehadiran otomatis dengan batasan jumlah tamu per undangan agar jamuan lebih terkontrol.",
  },
  {
    id: "f4",
    icon: "MapPin",
    title: "Navigasi Google Maps & Waze",
    desc: "Bantu tamu menemukan lokasi venue pesta Anda dengan petunjuk arah rute 1-klik langsung ke aplikasi navigasi.",
  },
  {
    id: "f5",
    icon: "QrCode",
    title: "Buku Tamu Digital & QR Check-in",
    desc: "Sistem absensi tamu di meja penerima dengan scan QR Code kilat untuk mencegah antrean panjang.",
  },
  {
    id: "f6",
    icon: "Headphones",
    title: "Background Music Romantis",
    desc: "Alunan musik romantis dengan pemutar melayang (floating player) dan fitur putar otomatis yang dapat disesuaikan.",
  },
];

export const AVAILABLE_FEATURE_ICONS: Array<{
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "Images", label: "Galeri Foto (Images)", icon: Images },
  { value: "Wallet", label: "Amplop / Rekening (Wallet)", icon: Wallet },
  { value: "Users", label: "Tamu / RSVP (Users)", icon: Users },
  { value: "MapPin", label: "Lokasi / Navigasi (MapPin)", icon: MapPin },
  { value: "QrCode", label: "QR Code / Tiket Masuk (QrCode)", icon: QrCode },
  { value: "Headphones", label: "Musik Romantis (Headphones)", icon: Headphones },
  { value: "Heart", label: "Kisah Kasih / Love Story (Heart)", icon: Heart },
  { value: "Calendar", label: "Kalender Acara (Calendar)", icon: Calendar },
  { value: "Gift", label: "Kirim Kado Fisik (Gift)", icon: Gift },
  { value: "Clock", label: "Hitung Mundur Waktu (Clock)", icon: Clock },
  { value: "MessageSquare", label: "Buku Tamu / Ucapan (MessageSquare)", icon: MessageSquare },
  { value: "Share2", label: "Bagikan / WhatsApp (Share2)", icon: Share2 },
  { value: "ShieldCheck", label: "Keamanan & Privasi (ShieldCheck)", icon: ShieldCheck },
  { value: "Video", label: "Streaming / Video (Video)", icon: Video },
  { value: "Zap", label: "Fitur Cepat / Instan (Zap)", icon: Zap },
];

const DEFAULT_SHOWCASE_WEDDINGS: ShowcaseWeddingItem[] = [
  {
    couple: "Rian & Sinta",
    date: "24 Oktober 2026",
    venue: "Grand Ballroom Sahid, Surabaya",
    theme: "Tema 1",
    img: "/templates/botanical/cover.jpg",
    slug: "rian-sinta",
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
  const [featureCards, setFeatureCards] = useState<FeatureCardItem[]>(
    DEFAULT_FEATURE_CARDS
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

    // Parse feature cards from JSON
    if (map.site_features_cards_json) {
      try {
        const parsed = JSON.parse(map.site_features_cards_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFeatureCards(parsed);
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

  const handleFeatureCardChange = (
    index: number,
    field: keyof FeatureCardItem,
    value: string
  ) => {
    setFeatureCards((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddFeatureCard = () => {
    setFeatureCards((prev) => [
      ...prev,
      {
        id: `f_${Date.now()}`,
        icon: "Zap",
        title: "Fitur Baru",
        desc: "Deskripsi penjelasan fitur unggulan undangan pernikahan Anda.",
      },
    ]);
  };

  const handleRemoveFeatureCard = (index: number) => {
    if (featureCards.length <= 1) return;
    setFeatureCards((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Serialize showcase items and feature cards into JSON string
    const updatedFormData: Record<string, string> = {
      ...formData,
      showcase_weddings_json: JSON.stringify(showcaseItems),
      site_features_cards_json: JSON.stringify(featureCards),
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

    // Ensure site_features_cards_json is present
    const hasFeatureCards = updated.some((s) => s.key === "site_features_cards_json");
    if (!hasFeatureCards) {
      updated.push({
        id: "def-site_features_cards_json",
        key: "site_features_cards_json",
        value: JSON.stringify(featureCards),
        label: "Daftar Kartu Fitur Unggulan (JSON)",
        description: "Data kartu fitur (ikon, judul, deskripsi) dalam format JSON",
        category: "cms",
        isPublic: true,
      });
    }

    // Ensure site_features_badge, site_features_title, site_features_subtitle are present
    const defaultFeatureSettings = [
      { key: "site_features_badge", def: "Fitur Lengkap & Canggih", label: "Teks Badge Bagian Fitur" },
      { key: "site_features_title", def: "Semua yang Anda Butuhkan untuk Hari Bahagia", label: "Judul Bagian Fitur" },
      { key: "site_features_subtitle", def: "Didesain khusus untuk mempermudah calon pengantin mempersiapkan pesta pernikahan modern.", label: "Subjudul Bagian Fitur" },
    ];
    for (const item of defaultFeatureSettings) {
      if (!updated.some((s) => s.key === item.key)) {
        updated.push({
          id: `def-${item.key}`,
          key: item.key,
          value: updatedFormData[item.key] ?? item.def,
          label: item.label,
          description: item.label,
          category: "cms",
          isPublic: true,
        });
      }
    }

    await onSaveSettings(updated);
  };

  const isAnnouncementActive = formData.announcement_enabled === "true";
  const announcementType = formData.announcement_type || "info";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* SECTION 0: IDENTITAS BRAND, TAB BROWSER & ICON APLIKASI */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-7 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-sans font-bold text-slate-900">
                Identitas Brand, Tab Browser &amp; Icon Aplikasi
              </h2>
              <p className="text-xs text-slate-500">
                Atur logo brand resmi, favicon tab browser, serta icon shortcut aplikasi (PWA / homescreen ponsel).
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Sanity CMS Sync
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Logo Brand Website */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Logo Brand Website
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tampil di Navbar Header, Mobile Topbar, Footer, dan Halaman Login.
              </p>

              <ImageUploadField
                label="Unggah File Logo"
                value={formData.site_logo_url || ""}
                onChange={(url) => handleChange("site_logo_url", url)}
                folder="branding"
                helperText="Disarankan PNG/SVG transparan atau JPG horizontal/persegi."
              />
            </div>

            {/* Live Preview Navbar */}
            <div className="pt-3 border-t border-slate-200">
              <span className="text-[10px] font-semibold text-slate-400 block mb-1.5 uppercase">
                Pratinjau di Navbar:
              </span>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2 min-h-[46px]">
                {formData.site_logo_url ? (
                  <img
                    src={formData.site_logo_url}
                    alt="Logo Preview"
                    className="h-7 max-w-[120px] object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#F97316] flex items-center justify-center text-white shadow-2xs">
                      <Heart className="w-3.5 h-3.5 fill-white" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">
                      Invity<span className="text-[#F97316]">.</span>{" "}
                      <span className="text-[10px] font-normal text-slate-500">by Fasaro</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Favicon Tab Browser */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Favicon Tab Browser
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tampil di tab browser pengunjung di samping judul halaman website.
              </p>

              <ImageUploadField
                label="Unggah File Favicon"
                value={formData.site_favicon_url || ""}
                onChange={(url) => handleChange("site_favicon_url", url)}
                folder="branding"
                helperText="Format .ico, .png, atau .svg (rekomendasi 32x32 / 64x64 px)."
              />
            </div>

            {/* Live Preview Browser Tab */}
            <div className="pt-3 border-t border-slate-200">
              <span className="text-[10px] font-semibold text-slate-400 block mb-1.5 uppercase">
                Pratinjau Tab Browser:
              </span>
              <div className="p-2 rounded-lg bg-slate-800 text-white flex items-center gap-2 text-xs shadow-xs min-h-[46px]">
                {formData.site_favicon_url ? (
                  <img
                    src={formData.site_favicon_url}
                    alt="Favicon Preview"
                    className="w-4 h-4 rounded-xs object-contain"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-xs bg-[#F97316] flex items-center justify-center">
                    <Heart className="w-2.5 h-2.5 fill-white text-white" />
                  </div>
                )}
                <span className="truncate text-[11px] font-medium text-slate-200">
                  Invity by Fasaro - Platform Undangan...
                </span>
              </div>
            </div>
          </div>

          {/* 3. Icon Aplikasi (PWA / Shortcut) */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Icon Aplikasi (PWA &amp; Shortcut)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tampil saat website di-install ke layar utama HP Android/iOS &amp; shortcut desktop.
              </p>

              <ImageUploadField
                label="Unggah Icon Aplikasi"
                value={formData.site_app_icon_url || ""}
                onChange={(url) => handleChange("site_app_icon_url", url)}
                folder="branding"
                helperText="Format PNG rasio 1:1 persegi (rekomendasi min 192x192 / 512x512 px)."
              />
            </div>

            {/* Live Preview Homescreen Shortcut */}
            <div className="pt-3 border-t border-slate-200">
              <span className="text-[10px] font-semibold text-slate-400 block mb-1.5 uppercase">
                Pratinjau Shortcut HP:
              </span>
              <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 min-h-[46px]">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-orange-100 border border-orange-200 flex items-center justify-center shadow-xs shrink-0">
                  {formData.site_app_icon_url ? (
                    <img
                      src={formData.site_app_icon_url}
                      alt="App Icon Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#F97316] flex items-center justify-center">
                      <Heart className="w-4 h-4 fill-white text-white" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block truncate leading-tight">
                    Invity
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Aplikasi Web
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                placeholder="Opsional: Teks badge highlight"
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
              placeholder="Penjelasan ringkas mengenai fitur unggulan Invity..."
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

      {/* SECTION 1.5: FITUR UNGGULAN BERANDA (FEATURE CARDS) */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-7 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-sans font-bold text-slate-900">
                Fitur Unggulan Beranda (Feature Cards)
              </h2>
              <p className="text-xs text-slate-500">
                Ubah judul, subjudul, dan kartu fitur yang tampil di bagian &quot;Fitur Lengkap &amp; Canggih&quot;.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddFeatureCard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Tambah Kartu Fitur</span>
          </button>
        </div>

        {/* 1. Judul & Subjudul Bagian */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F97316]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Teks Judul &amp; Subjudul Bagian Fitur
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Teks Badge Atas</label>
              <input
                type="text"
                value={formData.site_features_badge ?? "Fitur Lengkap & Canggih"}
                onChange={(e) => handleChange("site_features_badge", e.target.value)}
                placeholder="Fitur Lengkap & Canggih"
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-700">Judul Utama Bagian (H2)</label>
              <input
                type="text"
                value={formData.site_features_title ?? "Semua yang Anda Butuhkan untuk Hari Bahagia"}
                onChange={(e) => handleChange("site_features_title", e.target.value)}
                placeholder="Semua yang Anda Butuhkan untuk Hari Bahagia"
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 font-semibold focus:outline-none focus:border-[#F97316]"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="font-semibold text-slate-700">Subjudul / Deskripsi Bagian</label>
              <textarea
                rows={2}
                value={formData.site_features_subtitle ?? "Didesain khusus untuk mempermudah calon pengantin mempersiapkan pesta pernikahan modern."}
                onChange={(e) => handleChange("site_features_subtitle", e.target.value)}
                placeholder="Didesain khusus untuk mempermudah calon pengantin mempersiapkan pesta pernikahan modern."
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 leading-relaxed focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>
        </div>

        {/* 2. Daftar Kartu Fitur */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Daftar Kartu Fitur ({featureCards.length} Kartu Aktif)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              Format grid otomatis tersusun rapi di beranda pengunjung
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featureCards.map((card, idx) => {
              const matchedIcon = AVAILABLE_FEATURE_ICONS.find((i) => i.value === card.icon);
              const IconComp = matchedIcon ? matchedIcon.icon : Zap;

              return (
                <div
                  key={card.id || idx}
                  className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 space-y-3.5 relative flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-orange-100/70 text-[#F97316] font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                        {card.title || `Kartu #${idx + 1}`}
                      </span>
                    </div>

                    {featureCards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFeatureCard(idx)}
                        className="p-1 px-2 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors text-xs flex items-center gap-1 font-medium cursor-pointer"
                        title="Hapus Kartu Fitur"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* Icon Picker */}
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Pilihan Ikon Fitur</label>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F97316] shrink-0">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <select
                          value={card.icon}
                          onChange={(e) => handleFeatureCardChange(idx, "icon", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-800 font-medium focus:outline-none focus:border-[#F97316]"
                        >
                          {AVAILABLE_FEATURE_ICONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Feature Title */}
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Judul Fitur</label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => handleFeatureCardChange(idx, "title", e.target.value)}
                        placeholder="Contoh: Galeri Foto HD"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 font-medium focus:outline-none focus:border-[#F97316]"
                      />
                    </div>

                    {/* Feature Description */}
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Deskripsi / Penjelasan Fitur</label>
                      <textarea
                        rows={3}
                        value={card.desc}
                        onChange={(e) => handleFeatureCardChange(idx, "desc", e.target.value)}
                        placeholder="Tuliskan keuntungan fitur ini bagi calon pengantin & tamu..."
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-700 leading-relaxed focus:outline-none focus:border-[#F97316]"
                      />
                    </div>
                  </div>

                  {/* Live Mini Preview Box */}
                  <div className="pt-2.5 border-t border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Pratinjau Tampilan Beranda:
                    </span>
                    <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5">
                      <div className="w-7 h-7 rounded-md bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <p className="font-semibold text-xs text-slate-900 leading-snug">{card.title || "Judul Fitur"}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{card.desc || "Deskripsi fitur..."}</p>
                    </div>
                  </div>
                </div>
              );
            })}
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
                Data pernikahan yang tampil di section &quot;Baru Saja Menikah Menggunakan Invity&quot;.
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
              <option value="info">Info Standar (Oranye Invity)</option>
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

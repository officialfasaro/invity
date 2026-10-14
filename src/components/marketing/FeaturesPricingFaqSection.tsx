"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Gift,
  Headphones,
  Heart,
  HelpCircle,
  Images,
  MapPin,
  MessageSquare,
  QrCode,
  Share2,
  ShieldCheck,
  Star,
  Users,
  Video,
  Wallet,
  Zap,
} from "lucide-react";
import BrandLogo from "../shared/BrandLogo";

const FEATURE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Images,
  Wallet,
  Users,
  MapPin,
  QrCode,
  Headphones,
  Heart,
  Calendar,
  Gift,
  Clock,
  MessageSquare,
  Share2,
  ShieldCheck,
  Video,
  Zap,
};

const DEFAULT_FEATURE_CARDS = [
  {
    icon: "Images",
    title: "Galeri Foto (Maks. 10 Foto)",
    desc: "Tampilkan momen prewedding terbaik Anda dalam album foto beresolusi tinggi dengan batas maksimal hingga 10 foto.",
  },
  {
    icon: "Wallet",
    title: "Amplop Digital & QRIS Terintegrasi",
    desc: "Tamu dapat mentransfer tanda kasih langsung melalui berbagai rekening bank dan QRIS otomatis.",
  },
  {
    icon: "Users",
    title: "RSVP Cerdas & Manajemen Kuota",
    desc: "Konfirmasi kehadiran otomatis dengan batasan jumlah tamu per undangan agar jamuan lebih terkontrol.",
  },
  {
    icon: "MapPin",
    title: "Navigasi Google Maps & Waze",
    desc: "Bantu tamu menemukan lokasi venue pesta Anda dengan petunjuk arah rute 1-klik langsung ke aplikasi navigasi.",
  },
  {
    icon: "QrCode",
    title: "Buku Tamu Digital & QR Check-in",
    desc: "Sistem absensi tamu di meja penerima dengan scan QR Code kilat untuk mencegah antrean panjang.",
  },
  {
    icon: "Headphones",
    title: "Background Music Romantis",
    desc: "Alunan musik romantis dengan pemutar melayang (floating player) dan fitur putar otomatis yang dapat disesuaikan.",
  },
];

interface FeaturesPricingFaqSectionProps {
  settings?: Record<string, string>;
}

export const FeaturesPricingFaqSection: React.FC<FeaturesPricingFaqSectionProps> = ({
  settings,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const starterPrice = (parseInt(settings?.price_starter || "39000", 10) || 39000).toLocaleString("id-ID");
  const starterOriginal = (parseInt(settings?.price_starter_original || "89000", 10) || 89000).toLocaleString("id-ID");
  const starterPhotos = settings?.max_photos_starter || "10";
  const starterAccounts = settings?.max_accounts_starter || "2";

  const elegantPrice = (parseInt(settings?.price_elegant || "149000", 10) || 149000).toLocaleString("id-ID");
  const elegantOriginal = (parseInt(settings?.price_elegant_original || "249000", 10) || 249000).toLocaleString("id-ID");

  const ultimatePrice = (parseInt(settings?.price_ultimate || "279000", 10) || 279000).toLocaleString("id-ID");
  const ultimateOriginal = (parseInt(settings?.price_ultimate_original || "499000", 10) || 499000).toLocaleString("id-ID");

  const starterName = settings?.plan_starter_name || "Paket Starter";
  const starterDesc = settings?.plan_starter_desc || "Pilihan hemat untuk acara akad/syukuran intim keluarga.";
  const starterPeriod = settings?.plan_starter_period || "Masa Aktif 3 Bulan";
  const starterBadge = settings?.plan_starter_badge;
  const starterFeatures = settings?.plan_starter_features
    ? settings.plan_starter_features.split("\n").map((l) => l.trim()).filter(Boolean)
    : [
        "1 Pilihan Tema Minimalist",
        "Masa Aktif 90 Hari",
        `Galeri Foto hingga ${starterPhotos} Foto`,
        "Buku Ucapan & Doa",
        "Navigasi Google Maps",
        `Amplop Digital (Hingga ${starterAccounts} Rekening Bank)`,
      ];

  const elegantName = settings?.plan_elegant_name || "Paket Elegant";
  const elegantDesc = settings?.plan_elegant_desc || "Paling populer untuk resepsi pernikahan lengkap & modern.";
  const elegantPeriod = settings?.plan_elegant_period || "Masa Aktif 1 Tahun Penuh";
  const elegantBadge = settings?.plan_elegant_badge || "Paling Populer";
  const elegantFeatures = settings?.plan_elegant_features
    ? settings.plan_elegant_features.split("\n").map((l) => l.trim()).filter(Boolean)
    : [
        "Akses Bebas ke Seluruh Tema Desain",
        "Ganti Tema 1-Klik Kapan Saja",
        "Masa Aktif 365 Hari",
        "Galeri Foto HD Tanpa Batas (WebP)",
        "Fitur Amplop Digital (Bebas Rekening + Upload QRIS Donasi)",
        "Buku Tamu & RSVP Realtime + Confetti",
        "Sinkronisasi Google Calendar Tamu",
        "Background Musik Autoplay",
      ];

  const ultimateName = settings?.plan_ultimate_name || "Paket Ultimate Event Day";
  const ultimateDesc = settings?.plan_ultimate_desc || "Solusi lengkap hari-H dengan sistem check-in VIP resepsi.";
  const ultimatePeriod = settings?.plan_ultimate_period || "Masa Aktif Selamanya (Lifetime)";
  const ultimateBadge = settings?.plan_ultimate_badge;
  const ultimateFeatures = settings?.plan_ultimate_features
    ? settings.plan_ultimate_features.split("\n").map((l) => l.trim()).filter(Boolean)
    : [
        "Seluruh Fitur Paket Elegant",
        "Masa Aktif Selamanya (Lifetime)",
        "Sistem QR Code Check-in Meja Tamu",
        "WhatsApp Blast Gateway Generator",
        "Story / Love Story Timeline Kustom",
        "Prioritas Verifikasi Kilat 10 Menit",
        "Dukungan WhatsApp Support Prioritas",
      ];

  const isSinglePromo = settings?.single_promo_mode !== "false";
  const promoName = settings?.promo_plan_name || "Paket Promo All-In-One";
  const promoPrice = (parseInt(settings?.promo_plan_price || "79000", 10) || 79000).toLocaleString("id-ID");
  const promoOriginal = (parseInt(settings?.promo_plan_original_price || "249000", 10) || 249000).toLocaleString("id-ID");
  const promoDesc = settings?.promo_plan_desc || "Satu penawaran spesial untuk seluruh kebutuhan pernikahan Anda dengan semua fitur terbuka tanpa batasan.";
  const promoPeriod = settings?.promo_plan_period || "Masa Aktif 1 Tahun Penuh";
  const promoBadge = settings?.promo_plan_badge || "PROMO SPESIAL LAUNCHING • ALL FEATURES UNLOCKED";
  const promoFeatures = settings?.promo_plan_features
    ? settings.promo_plan_features.split("\n").map((l) => l.trim()).filter(Boolean)
    : [
        "Akses Bebas ke Seluruh Tema Desain Premium",
        "Termasuk Tema Luxury Botanical Mekar & Versa",
        "Ganti Tema 1-Klik Kapan Saja Bebas Tanpa Data Hilang",
        "Galeri Foto HD Lengkap & Fitur Lightbox Layar Penuh",
        "Amplop Digital (Bebas Rekening Bank + Upload QRIS Donasi)",
        "Fitur Pengiriman Kado Fisik ke Kediaman Mempelai",
        "Buku Tamu Digital & Konfirmasi Kehadiran (RSVP) Realtime",
        "Background Musik Romantis Autoplay & Floating Music Player",
        "Petunjuk Peta Rute Lokasi Google Maps 1-Klik",
        "QR Code Tiket Masuk Meja Tamu Undangan",
        "Fitur Perjalanan Cinta / Kisah Kasih (Love Story)",
        "Hitung Mundur Acara Pernikahan (Live Countdown)",
        "Kustomisasi Penuh Teks, Tanggal, dan Foto Mempelai",
        "Dukungan WhatsApp Support Siap Membantu",
      ];

  const featuresBadge = settings?.site_features_badge || "Fitur Lengkap & Canggih";
  const featuresTitle = settings?.site_features_title || "Semua yang Anda Butuhkan untuk Hari Bahagia";
  const featuresSubtitle =
    settings?.site_features_subtitle ||
    "Didesain khusus untuk mempermudah calon pengantin mempersiapkan pesta pernikahan modern.";

  const dynamicFeatures = useMemo(() => {
    if (settings?.site_features_cards_json) {
      try {
        const parsed = JSON.parse(settings.site_features_cards_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as Array<{ icon: string; title: string; desc: string }>;
        }
      } catch {
        // fallback to default
      }
    }
    return DEFAULT_FEATURE_CARDS;
  }, [settings?.site_features_cards_json]);

  const pricingPlans = [
    {
      name: starterName,
      price: starterPrice,
      originalPrice: starterOriginal,
      period: starterPeriod,
      description: starterDesc,
      highlight: false,
      badge: starterBadge,
      tier: "STARTER",
      features: starterFeatures,
    },
    {
      name: elegantName,
      price: elegantPrice,
      originalPrice: elegantOriginal,
      period: elegantPeriod,
      description: elegantDesc,
      highlight: true,
      badge: elegantBadge,
      tier: "ELEGANT",
      features: elegantFeatures,
    },
    {
      name: ultimateName,
      price: ultimatePrice,
      originalPrice: ultimateOriginal,
      period: ultimatePeriod,
      description: ultimateDesc,
      highlight: false,
      badge: ultimateBadge,
      tier: "ULTIMATE",
      features: ultimateFeatures,
    },
  ];

  const [testimonials, setTestimonials] = useState<
    Array<{
      couple: string;
      city?: string;
      rating?: number;
      comment: string;
      weddingDate?: string;
    }>
  >(() => {
    if (settings?.user_testimonials_json) {
      try {
        const parsed = JSON.parse(settings.user_testimonials_json);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // empty
      }
    }
    return [];
  });

  React.useEffect(() => {
    fetch("/api/public/testimonials")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          setTestimonials(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const faqs = [
    {
      q: "Berapa lama proses pembuatan undangan digital di Invity?",
      a: "Hanya butuh 5 hingga 10 menit! Anda cukup mengisi nama mempelai, tanggal acara, lokasi, dan foto, undangan langsung online dan siap disebarkan.",
    },
    {
      q: "Apakah saya bisa mengganti tema setelah undangan selesai dibuat?",
      a: "Bisa banget! Berkat arsitektur modular Invity, Anda bisa berganti-ganti tema kapan saja dari dashboard hanya dengan 1-klik tanpa ada satu pun data yang hilang.",
    },
    {
      q: "Bagaimana cara tamu mengirimkan kado/amplop digital?",
      a: "Tamu cukup menekan tombol 'Salin Rekening' pada nomor rekening Anda atau memindai kode QRIS langsung melalui mobile banking / e-wallet apapun (GoPay, OVO, ShopeePay, Dana).",
    },
    {
      q: "Metode pembayaran apa saja yang didukung untuk upgrade paket?",
      a: "Kami mendukung pembayaran otomatis via Payment Gateway Midtrans (GoPay, QRIS, Virtual Account BCA/Mandiri/BRI) dan transfer manual langsung ke rekening bank & QRIS resmi Invity by Fasaro dengan verifikasi admin.",
    },
    {
      q: "Apakah ada batasan jumlah tamu yang bisa menerima undangan?",
      a: "Tidak ada batasan (Unlimited)! Anda bebas menyebarkan link undangan ke ratusan maupun ribuan tamu dengan sapaan nama penerima dinamis (?to=Nama+Tamu).",
    },
  ];

  return (
    <div className="w-full space-y-24 py-8">
      {/* 1. Fitur Unggulan Grid */}
      <section id="fitur" className="max-w-6xl mx-auto px-4 space-y-10 scroll-mt-20">
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-orange-50 border border-orange-100 text-[#F97316] text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>{featuresBadge}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {featuresTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dynamicFeatures.map((f, idx) => {
            const Icon = FEATURE_ICON_MAP[f.icon] || Zap;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#F97316] transition-all space-y-3 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316] group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base text-slate-900">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Tabel Paket Harga */}
      <section id="harga" className="max-w-6xl mx-auto px-4 space-y-10 scroll-mt-20">
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {isSinglePromo
              ? "Satu Paket Promo Lengkap untuk Momen Spesial Anda"
              : "Pilihan Paket Sesuai Kebutuhan Anda"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isSinglePromo
              ? "Nikmati seluruh fitur premium undangan pernikahan digital tanpa batasan dalam 1 penawaran promo launching spesial."
              : "Sekali bayar tanpa biaya tersembunyi. Aktif seketika via gateway otomatis atau transfer manual."}
          </p>
        </div>

        {isSinglePromo ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-9 border-2 border-[#F97316] shadow-sm ring-4 ring-orange-500/10 relative overflow-hidden">
              {promoBadge && (
                <div className="absolute top-0 right-0 bg-[#F97316] text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 sm:px-4 rounded-bl-xl shadow-2xs z-10">
                  {promoBadge}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 sm:pt-4">
                {/* Left Side: Pricing & CTA */}
                <div className="lg:col-span-5 space-y-5 text-left border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-8">
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                      {promoName}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {promoDesc}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100/80 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 line-through font-medium">
                        Rp {promoOriginal}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-none">
                        Diskon Promo Launching
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-slate-700">Rp</span>
                      <span className="text-4xl font-extrabold text-[#F97316] tracking-tight">
                        {promoPrice}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium pt-0.5">
                      {promoPeriod} • Sekali Bayar
                    </p>
                  </div>

                  <Link
                    href="/order"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.99] text-center"
                  >
                    <span>Buat Undangan Promo Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="space-y-1.5 pt-1 text-[11px] text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Langsung aktif seketika setelah pembayaran</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Bebas ganti tema &amp; edit data kapan saja</span>
                    </p>
                  </div>
                </div>

                {/* Right Side: Features Checklist */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Daftar Fitur Lengkap yang Anda Dapatkan:
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      100% lengkap tanpa batasan, tanpa biaya tambahan apa pun.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {promoFeatures.map((feat, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-800"
                      >
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-6 flex flex-col justify-between relative transition-all ${
                  plan.highlight
                    ? "bg-white border-2 border-[#F97316] shadow-md ring-1 ring-orange-100"
                    : "bg-white border border-[#E2E8F0] hover:border-slate-300 shadow-xs"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 py-0.5 px-3 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#F97316] text-white shadow-xs">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                  </div>

                  <div className="py-2">
                    {"originalPrice" in plan && plan.originalPrice && (
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
                        <span className="line-through">Rp {plan.originalPrice}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Diskon Promo
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-slate-500">Rp</span>
                      <span className="text-3xl font-bold text-slate-900 tracking-tight">
                        {plan.price}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#F97316] font-semibold">{plan.period}</span>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-[#E2E8F0]">
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <Link
                    href={`/login?mode=register&plan=${plan.tier}&from=/dashboard`}
                    className={`w-full block text-center py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors ${
                      plan.highlight
                        ? "bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs"
                        : "bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-slate-100 text-slate-800"
                    }`}
                  >
                    Pilih {plan.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Testimoni Pasangan (Hanya tampil jika terdapat 5 atau lebih testimoni) */}
      {testimonials.length >= 5 && (
        <section id="testimoni" className="max-w-6xl mx-auto px-4 space-y-10 scroll-mt-20">
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-orange-50 border border-orange-100 text-[#F97316] text-xs font-semibold">
              <Heart className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
              <span>Cerita Bahagia</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Kisah Sukses Pengantin Invity
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Dipercaya oleh pasangan pengantin yang merayakan hari bahagianya bersama Invity by Fasaro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testi, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4 text-left flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(testi.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    &quot;{testi.comment}&quot;
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900">{testi.couple}</h4>
                    <span className="text-[11px] text-slate-500">{testi.city || "Indonesia"}</span>
                  </div>
                  {testi.weddingDate && (
                    <span className="text-[10px] text-[#F97316] font-mono bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                      {testi.weddingDate}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Accordion FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 space-y-8 scroll-mt-20">
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-orange-50 border border-orange-100 text-[#F97316] text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Pertanyaan Sering Ditanyakan</h2>
        </div>

        <div className="space-y-3 text-left">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-white border border-[#E2E8F0] shadow-xs overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full py-3.5 px-5 flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-slate-800 hover:text-[#F97316] text-left transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                      isOpen ? "rotate-180 text-[#F97316]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-[#E2E8F0] pt-3 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white pt-14 pb-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-left pb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <BrandLogo href="/" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Platform pembuatan undangan pernikahan digital elegan nomor #1 di Indonesia. Berkecepatan tinggi, aman, dan mudah digunakan.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>SSL 256-Bit Secured &amp; Verified</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Navigasi Cepat
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li><a href="#home" className="hover:text-[#F97316] transition-colors">Beranda</a></li>
              <li><a href="#tema" className="hover:text-[#F97316] transition-colors">Katalog Tema</a></li>
              <li><a href="#fitur" className="hover:text-[#F97316] transition-colors">Fitur Platform</a></li>
              <li><a href="#harga" className="hover:text-[#F97316] transition-colors">Paket Harga</a></li>
            </ul>
          </div>

          {/* Program & Kemitraan (Dinonaktifkan Sementara / Non-clickable dengan label Segera Hadir) */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Kemitraan &amp; Komunitas
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-600">Program Reseller WO</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-500 font-medium border border-slate-200/60">
                  Segera Hadir
                </span>
              </li>
              <li className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-600">Mitra Fotografer Wedding</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-500 font-medium border border-slate-200/60">
                  Segera Hadir
                </span>
              </li>
              <li className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-600">Affiliate Earning</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-500 font-medium border border-slate-200/60">
                  Segera Hadir
                </span>
              </li>
              <li className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-600">Admin Portal</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-500 font-medium border border-slate-200/60">
                  Segera Hadir
                </span>
              </li>
            </ul>
          </div>

          {/* Kontak Support */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Bantuan &amp; Kontak
            </h4>
            <p className="text-xs text-slate-500">
              Customer Success siap membantu persiapan hari bahagia Anda setiap hari ({settings?.support_hours || "08:00 - 22:00 WIB"}).
            </p>
            {(() => {
              const rawWa = settings?.support_whatsapp || "085716697416";
              const digits = rawWa.replace(/[^0-9]/g, "");
              const cleanWa = digits.startsWith("0") ? "62" + digits.slice(1) : digits;
              return (
                <a
                  href={`https://wa.me/${cleanWa}?text=Halo%20Admin%20Invity%20saya%20ingin%20tanya%20undangan%20pernikahan`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 py-2 px-3.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  Chat WhatsApp Support
                </a>
              );
            })()}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-6 border-t border-[#E2E8F0] text-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Invity by Fasaro. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesPricingFaqSection;

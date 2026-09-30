import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Palette,
  Users,
} from "lucide-react";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import AnnouncementBanner from "@/components/marketing/AnnouncementBanner";
import MaintenanceNotice from "@/components/maintenance/MaintenanceNotice";
import ThemeCatalogSection from "@/components/marketing/ThemeCatalogSection";
import FeaturesPricingFaqSection from "@/components/marketing/FeaturesPricingFaqSection";

const RECENT_WEDDINGS = [
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

export default function HomePage() {
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) {
          setSettings(j.data);
        }
      })
      .catch(() => {});

    // Check if current session user is admin for bypass
    fetch("/api/dashboard/invitation")
      .then((r) => {
        if (r.ok) return r.json();
        return null;
      })
      .then((j) => {
        if (j?.data?.isAdmin || j?.data?.userEmail === "admin@admin.com") {
          setIsAdmin(true);
        }
      })
      .catch(() => {});
  }, []);

  const showcaseList = React.useMemo(() => {
    if (settings?.showcase_weddings_json) {
      try {
        const parsed = JSON.parse(settings.showcase_weddings_json);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Fallback
      }
    }
    return RECENT_WEDDINGS;
  }, [settings]);

  // If maintenance mode is active and user is not admin, show full maintenance page
  if (settings?.maintenance_mode === "true" && !isAdmin) {
    return (
      <MaintenanceNotice
        title={settings.maintenance_title}
        message={settings.maintenance_message}
        estimatedEnd={settings.maintenance_estimated_end}
        whatsappNumber={settings.support_whatsapp}
      />
    );
  }

  const isRegistrationOpen = settings?.feature_registration !== "false";

  return (
    <div className="min-h-screen bg-[#F3F6FB] text-slate-900 flex flex-col selection:bg-[#F97316] selection:text-white">
      {/* Maintenance Bypass Notice for Admin */}
      {settings?.maintenance_mode === "true" && isAdmin && (
        <MaintenanceNotice isAdminBypass={true} />
      )}

      {/* Global Announcement Banner */}
      <AnnouncementBanner initialSettings={settings || undefined} />

      {/* 1. Sticky Responsive Navbar */}
      <MarketingNavbar />

      {/* 2. Hero Section */}
      <section id="home" className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center">
        <div className="space-y-6">
          {/* Live Counter Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E2E8F0] bg-white text-[#F97316] text-xs font-semibold shadow-xs">
            <Users className="w-3.5 h-3.5 text-[#F97316]" />
            <span>
              {settings?.site_hero_badge || "250.000+ Pasangan Telah Menggunakan Platform Kami"}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
            {settings?.site_hero_title || (
              <>
                Buat Website Undangan Pernikahan Digital Elegan{" "}
                <span className="text-[#F97316]">dalam Hitungan Menit</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {settings?.site_hero_subtitle ||
              "Platform all-in-one: ganti tema 1-klik tanpa data hilang, amplop digital terintegrasi (QRIS/Bank), buku tamu RSVP realtime, hingga audio player autoplay super cepat."}
          </p>

          {/* CTA Dual Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              href="/login?from=/dashboard"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs transition-colors"
            >
              <span>{isRegistrationOpen ? "Buat Undangan Sekarang" : "Masuk ke Akun Saya"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#tema"
              className="inline-flex items-center gap-2 py-3 px-5 rounded-xl text-xs font-semibold border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-800 transition-colors shadow-xs"
            >
              <Palette className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Lihat Desain Tema</span>
            </a>
          </div>

          {/* Checklist Trust Factors */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{settings?.site_hero_promo || "Mulai Rp 39rb Promo Spesial"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Buka Cepat &lt; 500ms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ganti Tema Bebas Kapan Saja</span>
            </div>
          </div>

          {/* Dynamic Hero Mockup Image if uploaded */}
          {settings?.site_hero_image && (
            <div className="pt-6 max-w-2xl mx-auto">
              <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-white">
                <Image
                  src={settings.site_hero_image}
                  alt="Preview Undangan Fasaro"
                  fill
                  sizes="(max-width: 768px) 100vw, 700px"
                  unoptimized
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Live Wedding Showcase (Baru Saja Menikah) */}
      <section className="border-y border-[#E2E8F0] bg-white py-14 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs uppercase tracking-wider text-[#F97316] font-semibold">
                Live Showcase
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Baru Saja Menikah Menggunakan Fasaro
              </h2>
            </div>
            <Link
              href="/login?from=/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F97316] hover:underline"
            >
              <span>Bergabung Bersama Mereka</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {showcaseList.map((w, idx) => (
              <div
                key={idx}
                className="group rounded-xl bg-white border border-[#E2E8F0] overflow-hidden shadow-xs hover:border-[#F97316] transition-all text-left flex flex-col justify-between"
              >
                <a
                  href={`/invitation/${w.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative h-48 w-full overflow-hidden bg-slate-100"
                  title={`Buka undangan ${w.couple} di tab baru`}
                >
                  <Image
                    src={w.img || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80"}
                    alt={w.couple}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority={false}
                    unoptimized={Boolean(w.img && (w.img.startsWith("/uploads/") || w.img.startsWith("data:")))}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] font-semibold text-white border border-white/10">
                    {w.theme}
                  </div>
                </a>

                <div className="p-4 space-y-3">
                  <div>
                    <a
                      href={`/invitation/${w.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-base text-slate-900 hover:text-[#F97316] transition-colors"
                    >
                      {w.couple}
                    </a>
                    <p className="text-xs text-slate-500 mt-0.5">{w.venue}</p>
                  </div>

                  <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{w.date}</span>
                    <a
                      href={`/invitation/${w.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F97316] hover:underline"
                    >
                      <span>Lihat Contoh</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Katalog & Filter Tema Undangan (Live Theme Preview) */}
      <div className="max-w-7xl mx-auto px-4 w-full">
        <ThemeCatalogSection />
      </div>

      {/* 5. Fitur Unggulan, Tabel Harga, Testimoni & FAQ */}
      <div className="w-full">
        <FeaturesPricingFaqSection settings={settings || undefined} />
      </div>
    </div>
  );
}

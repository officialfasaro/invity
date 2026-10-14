import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import AnnouncementBanner from "@/components/marketing/AnnouncementBanner";
import MaintenanceNotice from "@/components/maintenance/MaintenanceNotice";
import HeroSplitSection from "@/components/marketing/HeroSplitSection";
import ThemeCatalogSection from "@/components/marketing/ThemeCatalogSection";
import FeaturesPricingFaqSection from "@/components/marketing/FeaturesPricingFaqSection";

interface ShowcaseItem {
  id: string;
  slug: string;
  couple: string;
  img: string;
  theme: string;
  venue: string;
  date: string;
}

export default function HomePage() {
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [showcaseList, setShowcaseList] = useState<ShowcaseItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((j) => {
        const data = j?.data || j;
        if (data) {
          setSettings(data);
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
    fetch("/api/public/showcase")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.success && Array.isArray(j.data)) {
          setShowcaseList(j.data);
        }
      })
      .catch(() => {});
  }, []);

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

      {/* 2. Hero Section (Split 2-Kolom dengan Smartphone Mockups & Floating Badges) */}
      <HeroSplitSection
        settings={settings}
        isRegistrationOpen={isRegistrationOpen}
      />

      {/* 3. Live Wedding Showcase (Hanya tampil jika ada 5 atau lebih data real mempelai) */}
      {showcaseList.length >= 5 && (
        <section className="border-y border-[#E2E8F0] bg-white py-14 px-4">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left space-y-1">
                <span className="text-xs uppercase tracking-wider text-[#F97316] font-semibold">
                  Live Showcase
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Baru Saja Menikah Menggunakan Invity
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
                        <span>Lihat Undangan</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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

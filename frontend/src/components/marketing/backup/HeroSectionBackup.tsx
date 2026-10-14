import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Palette, Users } from "lucide-react";

interface HeroSectionBackupProps {
  settings?: Record<string, string> | null;
  isRegistrationOpen?: boolean;
}

/**
 * BACKUP HERO SECTION SEBELUM SPLIT 2-KOLOM
 * Disimpan sesuai instruksi user untuk referensi / fallback jika diperlukan.
 */
export const HeroSectionBackup: React.FC<HeroSectionBackupProps> = ({
  settings,
  isRegistrationOpen = true,
}) => {
  return (
    <section id="home" className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-left">
      <div className="space-y-6">
        {/* Optional CMS Hero Badge */}
        {Boolean(
          settings?.site_hero_badge?.trim() &&
            !settings.site_hero_badge.includes("250.000") &&
            !settings.site_hero_badge.toLowerCase().includes("pasangan")
        ) && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E2E8F0] bg-white text-[#F97316] text-xs font-semibold shadow-xs">
            <Users className="w-3.5 h-3.5 text-[#F97316]" />
            <span>{settings?.site_hero_badge}</span>
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
          {settings?.site_hero_title || (
            <>
              Buat Website Undangan Pernikahan Digital Elegan{" "}
              <span className="text-[#F97316]">dalam Hitungan Menit</span>
            </>
          )}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          {settings?.site_hero_subtitle ||
            "Platform all-in-one: ganti tema 1-klik tanpa data hilang, amplop digital terintegrasi (QRIS/Bank), buku tamu RSVP realtime, hingga audio player autoplay super cepat."}
        </p>

        {/* CTA Dual Buttons */}
        <div className="flex flex-wrap items-center justify-start gap-3.5 pt-2">
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
        <div className="pt-4 flex flex-wrap items-center justify-start gap-6 text-xs text-slate-600">
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
          <div className="pt-6 max-w-2xl">
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
  );
};

export default HeroSectionBackup;

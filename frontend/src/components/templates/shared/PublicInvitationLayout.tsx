"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { WeddingInvitationData } from "@/types/wedding";
import QRCode from "qrcode";
import {
  Calendar,
  Disc3,
  Gift,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  Music2,
  QrCode,
  X,
} from "lucide-react";
import GoogleTranslateWidget from "@/components/shared/GoogleTranslateWidget";

interface PublicInvitationLayoutProps {
  data: WeddingInvitationData;
  guestName?: string;
  children: React.ReactNode;
}

export const PublicInvitationLayout: React.FC<PublicInvitationLayoutProps> = ({
  data,
  guestName,
  children,
}) => {
  const [activeSection, setActiveSection] = useState<string>("couple");
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
  const [guestQrDataUrl, setGuestQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (guestName && typeof window !== "undefined") {
      const codeParam = new URLSearchParams(window.location.search).get("code") || guestName;
      const payload = JSON.stringify({
        guestName,
        slugCode: codeParam,
        invitationSlug: data.slug,
      });
      QRCode.toDataURL(payload, { width: 240, margin: 1 })
        .then(setGuestQrDataUrl)
        .catch(() => {});
    }
  }, [guestName, data.slug]);

  // Sync music state from FloatingAudioPlayer events
  useEffect(() => {
    const handleMusicState = (e: Event) => {
      const customEvent = e as CustomEvent<{ isPlaying: boolean }>;
      if (customEvent.detail) {
        setIsPlayingMusic(customEvent.detail.isPlaying);
      }
    };
    window.addEventListener("fasaro:music-state", handleMusicState);
    return () => {
      window.removeEventListener("fasaro:music-state", handleMusicState);
    };
  }, []);

  // Track active section on scroll
  useEffect(() => {
    const sectionIds = ["couple", "event", "gallery", "gift", "wishes"];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el =
          document.getElementById(id) ||
          (id === "couple" && (document.getElementById("home") || document.getElementById("mempelai"))) ||
          (id === "event" && (document.getElementById("acara") || document.getElementById("undangan"))) ||
          (id === "gallery" && document.getElementById("galeri")) ||
          (id === "gift" && (document.getElementById("kado") || document.getElementById("amplop"))) ||
          (id === "wishes" && (document.getElementById("doa") || document.getElementById("rsvp") || document.getElementById("ucapan")));

        if (el) {
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          if (scrollPosition >= top) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    let target = document.getElementById(sectionId);

    // Fallbacks for various theme IDs
    if (!target) {
      if (sectionId === "couple") {
        target = document.getElementById("mempelai") || document.getElementById("home");
      } else if (sectionId === "event") {
        target = document.getElementById("acara") || document.getElementById("undangan");
      } else if (sectionId === "gallery") {
        target = document.getElementById("galeri");
      } else if (sectionId === "gift") {
        target = document.getElementById("kado") || document.getElementById("amplop");
      } else if (sectionId === "wishes") {
        target = document.getElementById("doa") || document.getElementById("ucapan") || document.getElementById("rsvp");
      }
    }

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleMusic = () => {
    window.dispatchEvent(new CustomEvent("fasaro:music-toggle"));
  };

  const getYouTubeVideoId = (url?: string | null): string | null => {
    if (!url) return null;
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const rawYoutubeUrl = data.youtubeVideoUrl || data.coupleInfo.youtubeVideoUrl;
  const youtubeCoverId = data.coupleInfo.useVideoAsDesktopCover ? getYouTubeVideoId(rawYoutubeUrl) : null;

  // Prewedding Hero Image: Prefer custom desktop cover, then couple photos, then gallery
  const heroImage =
    data.coupleInfo.desktopCoverImage ||
    data.coupleInfo.groomPhoto ||
    data.galleries?.[0]?.imageUrl ||
    data.coupleInfo.bridePhoto ||
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=80";

  const primaryEvent = data.eventSchedules?.[0];
  const formattedEventDate = primaryEvent?.date
    ? new Date(primaryEvent.date).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Hari Bahagia";

  const brideDisplay = data.coupleInfo.brideNickname || data.coupleInfo.brideName;
  const groomDisplay = data.coupleInfo.groomNickname || data.coupleInfo.groomName;
  const isDemo = data.id.startsWith("demo-");

  const navItems = [
    { id: "couple", label: "Couple", icon: Heart },
    { id: "event", label: "Acara", icon: Calendar },
    { id: "gallery", label: "Galeri", icon: ImageIcon },
    { id: "gift", label: "Kado", icon: Gift },
    { id: "wishes", label: "Ucapan", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F3F6FB] relative">
      {/* ========================================================= */}
      {/* 1. DESKTOP LEFT PANE (STICKY SHOWCASE / SISI KIRI)       */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex lg:w-1/2 xl:w-[55%] sticky top-0 h-screen overflow-hidden flex-col justify-between p-8 xl:p-10 select-none z-10">
        {/* Background Media: YouTube Video Teaser or Hero Image */}
        {youtubeCoverId ? (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeCoverId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeCoverId}&playsinline=1&modestbranding=1&rel=0`}
              title="Background Video Teaser"
              className="absolute top-1/2 left-1/2 w-[300%] h-[300%] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
            {/* Subtle Dark Vignette / Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/50" />
            <div className="absolute inset-0 bg-black/25" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImage}
              alt={`${groomDisplay} & ${brideDisplay}`}
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover object-center scale-105 transition-transform duration-1000"
            />
            {/* Subtle Dark Vignette / Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/45" />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}

        {/* Falling Sakura Petals Animation */}
        <div className="absolute inset-0 pointer-events-none z-1 overflow-hidden">
          {[
            { left: "10%", delay: "0s", duration: "12s", size: "w-3 h-3" },
            { left: "25%", delay: "3s", duration: "15s", size: "w-2.5 h-2.5" },
            { left: "40%", delay: "1.5s", duration: "14s", size: "w-3.5 h-3.5" },
            { left: "55%", delay: "4.5s", duration: "16s", size: "w-2 h-2" },
            { left: "70%", delay: "2s", duration: "13s", size: "w-3 h-3" },
            { left: "85%", delay: "5s", duration: "17s", size: "w-2.5 h-2.5" },
            { left: "95%", delay: "0.5s", duration: "11s", size: "w-3.5 h-3.5" },
          ].map((petal, idx) => (
            <div
              key={idx}
              className={`absolute -top-6 rounded-full bg-rose-200/60 blur-[0.5px] animate-petal ${petal.size}`}
              style={{
                left: petal.left,
                animationDelay: petal.delay,
                animationDuration: petal.duration,
              }}
            />
          ))}
        </div>

        {/* Top Header Bar inside Left Pane */}
        <div className="relative z-10 flex items-center justify-between">
          {/* Tag / Status Badge & Language Translate */}
          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium tracking-wide shadow-sm">
              {isDemo ? (
                <span>sedang menggunakan data contoh</span>
              ) : (
                <span>The Wedding of {groomDisplay} &amp; {brideDisplay}</span>
              )}
            </div>
            <GoogleTranslateWidget className="bg-black/40 backdrop-blur-md border-white/20 text-white" />
          </div>

          {/* Quick Action Floating Buttons (Music & Kado Shortcut) */}
          <div className="flex flex-col items-center gap-2.5">
            {/* Audio Toggle Button (White circle, matches screenshot) */}
            <button
              type="button"
              onClick={toggleMusic}
              title={isPlayingMusic ? "Hentikan Musik" : "Putar Musik"}
              className="w-11 h-11 rounded-full bg-white text-slate-800 shadow-xl border border-white/80 hover:bg-slate-50 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer relative"
            >
              {isPlayingMusic ? (
                <>
                  <Disc3 className="w-5 h-5 text-rose-600 animate-spin" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                </>
              ) : (
                <Music2 className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {/* Quick Kado / Amplop Button (Teal circle, matches screenshot) */}
            <button
              type="button"
              onClick={() => scrollToSection("gift")}
              title="Kirim Kado / Amplop Digital"
              className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl border border-emerald-400/40 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <Gift className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center / Right Edge: Vertical Pill Navigation Bar */}
        <div className="absolute right-3 xl:right-4 top-1/2 -translate-y-1/2 z-20">
          <nav className="bg-white/95 backdrop-blur-md py-3 px-1.5 rounded-full border border-stone-200/90 shadow-2xl flex flex-col items-center gap-3 text-stone-700">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <div key={item.id} className="relative group flex items-center">
                  <button
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`p-2 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                      isActive
                        ? "bg-[#9f1239] text-white shadow-md scale-105"
                        : "text-stone-600 hover:text-[#9f1239] hover:bg-stone-100"
                    }`}
                    aria-label={item.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>

                  {/* Tooltip on active / hover (Like ♥ Couple in screenshot) */}
                  <div
                    className={`absolute right-full mr-2.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-lg transition-all duration-200 pointer-events-none flex items-center gap-1 ${
                      isActive
                        ? "bg-[#9f1239] text-white opacity-100 translate-x-0"
                        : "bg-stone-900/90 text-white opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    }`}
                  >
                    <span>{item.label}</span>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Left: Couple Names in Elegant Script Typography */}
        <div className="relative z-10 space-y-1.5 text-white drop-shadow-md">
          <p className="text-xs uppercase tracking-[0.35em] text-white/80 font-medium">
            The Wedding of
          </p>
          <h1 className="font-script text-5xl xl:text-6xl tracking-wide leading-none text-white py-1">
            {brideDisplay} &amp; {groomDisplay}
          </h1>
          <p className="text-xs tracking-wider text-white/90 font-medium pt-1">
            {formattedEventDate}
          </p>
          {guestName && (
            <p className="text-[11px] text-white/70 italic pt-1">
              Khusus untuk: <span className="text-white font-semibold">{guestName}</span>
            </p>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. RIGHT PANE / MAIN INVITATION CONTENT                  */}
      {/* ========================================================= */}
      <main className="w-full lg:w-1/2 xl:w-[45%] min-h-screen relative bg-background shadow-2xl border-l border-stone-200/50 flex-1">
        {children}
      </main>

      {/* ========================================================= */}
      {/* 3. MOBILE FLOATING LANGUAGE SWITCHER & BOTTOM NAV (< lg)  */}
      {/* ========================================================= */}
      <div className="fixed top-3 left-3 z-40 lg:hidden pointer-events-auto">
        <GoogleTranslateWidget className="shadow-lg backdrop-blur-md bg-white/95 border border-stone-200 text-xs" />
      </div>

      <nav
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 lg:hidden transform-gpu will-change-transform bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-stone-200 shadow-xl flex items-center gap-3 sm:gap-5 text-stone-700 transition-all duration-300"
        aria-label="Navigasi Undangan"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors cursor-pointer ${
                isActive ? "text-[#9f1239] font-bold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "scale-110" : ""}`} />
              <span className="text-[9px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 4. FLOATING GUEST QR CODE TICKET (If personalized guestName exists) */}
      {guestName && (
        <>
          <button
            type="button"
            onClick={() => setShowTicketModal(true)}
            className="fixed bottom-16 right-4 z-40 lg:bottom-6 lg:right-6 py-2 px-3.5 rounded-full bg-slate-900/90 text-white hover:bg-slate-900 border border-white/20 shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
            title="Tampilkan Tiket Masuk & QR Code Anda"
          >
            <QrCode className="w-4 h-4 text-[#F97316]" />
            <span>Tiket Masuk QR</span>
          </button>

          {/* Ticket Modal */}
          {showTicketModal && (
            <div
              onClick={() => setShowTicketModal(false)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-xs w-full p-5 border border-stone-200 shadow-2xl text-center space-y-3"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#F97316]" />
                    <span className="font-bold text-xs text-stone-800">Tiket Masuk Tamu</span>
                  </div>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="p-1 rounded text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-0.5">
                  <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                    Tamu Terhormat
                  </p>
                  <h4 className="font-bold text-base text-stone-900">{guestName}</h4>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200 inline-block mx-auto shadow-2xs">
                  {guestQrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={guestQrDataUrl}
                      alt="QR Tiket"
                      className="w-44 h-44 mx-auto rounded"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-xs text-stone-400">
                      Menyiapkan QR...
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-stone-500">
                  Tunjukkan kode QR ini kepada penerima tamu di meja resepsi acara.
                </p>

                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="w-full py-2 px-3 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PublicInvitationLayout;

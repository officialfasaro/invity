"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  Heart,
  Mail,
  MapPin,
  Play,
  QrCode,
  VolumeX,
  X,
} from "lucide-react";
import InstagramIcon from "../shared/InstagramIcon";
import GoogleMapEmbed from "../shared/GoogleMapEmbed";
import { isFeatureAvailable } from "@/utils/featureFlags";
import { WeddingInvitationData, EventScheduleItem, BankAccountItem } from "@/types/wedding";

interface LocalWish {
  id: string;
  senderName: string;
  attendance: string;
  message: string;
  timeAgo: string;
}

const DEFAULT_WISHES: LocalWish[] = [
  {
    id: "w-1",
    senderName: "Bagas & Keluarga",
    attendance: "Hadir",
    message: "Selamat untuk Raka & Ayu! Semoga sakinah, mawaddah, warahmah dan langgeng selamanya.",
    timeAgo: "2 jam lalu",
  },
  {
    id: "w-2",
    senderName: "Dinda Maharani",
    attendance: "Hadir",
    message: "Barakallahu lakum wa baraka alaikum. Bahagia selalu kedua mempelai!",
    timeAgo: "4 jam lalu",
  },
  {
    id: "w-3",
    senderName: "Rizky Firmansyah",
    attendance: "Hadir",
    message: "Selamat menempuh hidup baru sahabatku Raka. Semoga selalu diberkahi kebahagiaan.",
    timeAgo: "Kemarin",
  },
];

interface RakaAyuThemeProps {
  data: WeddingInvitationData;
  guestName?: string;
  showCover?: boolean;
  isEmbedded?: boolean;
}

export const RakaAyuTheme: React.FC<RakaAyuThemeProps> = ({
  data,
  guestName,
  showCover = true,
  isEmbedded = false,
}) => {
  const [isOpen, setIsOpen] = useState(!showCover);
  const [isPlaying, setIsPlaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Form states
  const [rsvpName, setRsvpName] = useState(guestName || "");
  const [rsvpAttendance, setRsvpAttendance] = useState("Hadir");
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wishes List
  const [wishesList, setWishesList] = useState<LocalWish[]>(() => {
    if (data.wishes && data.wishes.length > 0) {
      return data.wishes.map((w, idx) => ({
        id: w.id || `w-${idx}`,
        senderName: w.senderName,
        attendance: "Hadir",
        message: w.message,
        timeAgo: "Baru saja",
      }));
    }
    return DEFAULT_WISHES;
  });

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  // QR Ticket Modal state
  const [showQrTicketModal, setShowQrTicketModal] = useState(false);
  const [qrTicketDataUrl, setQrTicketDataUrl] = useState<string>("");

  useEffect(() => {
    if (guestName && typeof window !== "undefined") {
      const codeParam = new URLSearchParams(window.location.search).get("code") || guestName;
      const payload = JSON.stringify({
        guestName,
        slugCode: codeParam,
        invitationSlug: data.slug,
      });
      QRCode.toDataURL(payload, { width: 220, margin: 1 })
        .then(setQrTicketDataUrl)
        .catch(() => {});
    }
  }, [guestName, data.slug]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic Couple Info
  const groomNick =
    data.coupleInfo.groomNickname || data.coupleInfo.groomName?.split(" ")[0] || "Raka";
  const groomFullName = data.coupleInfo.groomName || "Raka Pratama, S.T.";
  const brideNick =
    data.coupleInfo.brideNickname || data.coupleInfo.brideName?.split(" ")[0] || "Ayu";
  const brideFullName = data.coupleInfo.brideName || "Ayu Lestari, S.Pd.";
  const coupleDisplayName = `${groomNick} & ${brideNick}`;
  const coupleMonogram = `${groomNick[0] || "R"} & ${brideNick[0] || "A"}`;

  const groomParents = useMemo(() => {
    if (data.coupleInfo.groomFather && data.coupleInfo.groomMother) {
      return `Putra dari Bpk. ${data.coupleInfo.groomFather} & Ibu ${data.coupleInfo.groomMother}`;
    }
    return "Putra dari Bapak Hendra & Ibu Sari";
  }, [data.coupleInfo.groomFather, data.coupleInfo.groomMother]);

  const brideParents = useMemo(() => {
    if (data.coupleInfo.brideFather && data.coupleInfo.brideMother) {
      return `Putri dari Bpk. ${data.coupleInfo.brideFather} & Ibu ${data.coupleInfo.brideMother}`;
    }
    return "Putri dari Bapak Wijaya & Ibu Rina";
  }, [data.coupleInfo.brideFather, data.coupleInfo.brideMother]);

  // Images
  const leftPanelImage = useMemo(() => {
    return (
      data.coupleInfo.desktopCoverImage ||
      data.galleries?.[0]?.imageUrl ||
      "/templates/raka-ayu/desktop-cover.jpg"
    );
  }, [data.coupleInfo.desktopCoverImage, data.galleries]);

  const heroBgImage = useMemo(() => {
    return (
      data.coupleInfo.backgroundImage ||
      data.coupleInfo.desktopCoverImage ||
      data.galleries?.[1]?.imageUrl ||
      "/templates/raka-ayu/cover.jpg"
    );
  }, [data.coupleInfo.backgroundImage, data.coupleInfo.desktopCoverImage, data.galleries]);

  const groomPhoto = useMemo(() => {
    return data.coupleInfo.groomPhoto || "/templates/raka-ayu/groom.jpg";
  }, [data.coupleInfo.groomPhoto]);

  const bridePhoto = useMemo(() => {
    return data.coupleInfo.bridePhoto || "/templates/raka-ayu/bride.jpg";
  }, [data.coupleInfo.bridePhoto]);

  // Schedules
  const schedules: EventScheduleItem[] = useMemo(() => {
    if (data.eventSchedules && data.eventSchedules.length > 0) {
      return data.eventSchedules;
    }
    return [
      {
        eventName: "Akad Nikah",
        date: "2026-12-12T08:00:00+07:00",
        startTime: "08:00 WIB",
        endTime: "10:00 WIB",
        venueName: "Masjid Al-Ikhlas",
        address: "Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan",
        mapsUrl: "https://maps.google.com/?q=Jakarta",
      },
      {
        eventName: "Resepsi Pernikahan",
        date: "2026-12-12T11:00:00+07:00",
        startTime: "11:00 WIB",
        endTime: "14:00 WIB",
        venueName: "Gedung Serbaguna Mawar",
        address: "Jl. Mawar No. 5, Kebayoran Baru, Jakarta Selatan",
        mapsUrl: "https://maps.google.com/?q=Jakarta",
      },
    ];
  }, [data.eventSchedules]);

  const primaryEventDateStr = useMemo(() => {
    const firstDate = schedules[0]?.date;
    if (firstDate) {
      try {
        const d = new Date(firstDate);
        return new Intl.DateTimeFormat("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(d);
      } catch {
        return "Sabtu, 12 Desember 2026";
      }
    }
    return "Sabtu, 12 Desember 2026";
  }, [schedules]);

  const primaryEventVenue = useMemo(() => {
    return schedules[0]?.venueName || "Masjid Al-Ikhlas Jakarta";
  }, [schedules]);

  // Target timestamp for countdown
  const targetDateTimestamp = useMemo(() => {
    const firstDate = schedules[0]?.date;
    if (firstDate) {
      const parsed = new Date(firstDate).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    return new Date("2026-12-12T08:00:00+07:00").getTime();
  }, [schedules]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const distance = targetDateTimestamp - now;

      if (distance <= 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDateTimestamp]);

  // Gallery items (6 items with asymmetry)
  const galleryItems = useMemo(() => {
    if (data.galleries && data.galleries.length >= 6) {
      return data.galleries.slice(0, 6);
    }
    return [
      { id: "g1", imageUrl: "/templates/raka-ayu/cover.jpg", sortOrder: 0 },
      { id: "g2", imageUrl: "/templates/raka-ayu/bride.jpg", sortOrder: 1 },
      { id: "g3", imageUrl: "/templates/raka-ayu/groom.jpg", sortOrder: 2 },
      { id: "g4", imageUrl: "/templates/raka-ayu/desktop-cover.jpg", sortOrder: 3 },
      { id: "g5", imageUrl: "/templates/raka-ayu/cover.jpg", sortOrder: 4 },
      { id: "g6", imageUrl: "/templates/raka-ayu/desktop-cover.jpg", sortOrder: 5 },
    ];
  }, [data.galleries]);

  // Bank accounts
  const bankAccounts: BankAccountItem[] = useMemo(() => {
    if (data.bankAccounts && data.bankAccounts.length > 0) {
      return data.bankAccounts;
    }
    return [
      {
        id: "ba-1",
        bankName: "BCA",
        accountNumber: "1234 5678 90",
        accountHolder: groomFullName,
      },
      {
        id: "ba-2",
        bankName: "Bank Mandiri",
        accountNumber: "0987 6543 21",
        accountHolder: brideFullName,
      },
    ];
  }, [data.bankAccounts, groomFullName, brideFullName]);

  // Physical Gift Shipping Addresses
  const physicalGiftList = useMemo(() => {
    if (Array.isArray(data.coupleInfo.giftAddresses) && data.coupleInfo.giftAddresses.length > 0) {
      const valid = data.coupleInfo.giftAddresses.filter(
        (g) => g.address && g.address.trim() !== ""
      );
      if (valid.length > 0) return valid;
    }
    const fallbackAddr =
      data.coupleInfo.giftAddress ||
      (schedules && schedules[0]?.address) ||
      "Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan 12140";
    return [
      {
        id: "primary",
        title: "Alamat Pengiriman",
        receiver: data.coupleInfo.giftReceiver || coupleDisplayName,
        phone: data.coupleInfo.giftPhone || "0812-3456-7890",
        address: fallbackAddr,
      },
    ];
  }, [
    data.coupleInfo.giftAddresses,
    data.coupleInfo.giftAddress,
    data.coupleInfo.giftReceiver,
    data.coupleInfo.giftPhone,
    schedules,
    coupleDisplayName,
  ]);

  // Toast Helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast(`${label} berhasil disalin!`))
        .catch(() => showToast(`Gagal menyalin ${label}`));
    } else {
      showToast(`${label} disalin!`);
    }
  };

  // Google Calendar URL Generator
  const generateGoogleCalendarUrl = (
    title: string,
    dateStr: string | Date,
    startTime: string,
    venue: string
  ) => {
    const d = new Date(dateStr);
    const dateFormatted = d.toISOString().slice(0, 10).replace(/-/g, "");
    const timeFormatted = startTime.replace(/[^0-9]/g, "").padEnd(4, "0");
    const startIso = `${dateFormatted}T${timeFormatted}00Z`;
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${startIso}/${startIso}&location=${encodeURIComponent(venue)}`;
  };

  // Audio Play / Pause
  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      showToast("Musik latar dijeda");
    } else {
      audioRef.current.muted = false;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          showToast("Memutar alunan musik pernikahan");
        })
        .catch(() => {
          setIsPlaying(false);
          showToast("Sentuh layar untuk memutar musik");
        });
    }
  }, [isPlaying, showToast]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
    const heroEl = document.getElementById("raka-hero");
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // RSVP Submission Handler
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = rsvpName.trim();
    if (!name) return;
    setIsSubmitting(true);

    const newWish: LocalWish = {
      id: `w-${Date.now()}`,
      senderName: name,
      attendance: rsvpAttendance,
      message: rsvpMessage.trim() || "Selamat menempuh hidup baru Raka & Ayu!",
      timeAgo: "Baru saja",
    };

    setWishesList((prev) => [newWish, ...prev]);

    try {
      await fetch("/api/public/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: data.id || data.slug,
          guestName: name,
          status: rsvpAttendance === "Hadir" ? "attending" : "declined",
          attendeeCount: 1,
        }),
      });

      if (rsvpMessage.trim()) {
        await fetch("/api/public/wishes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invitationId: data.id || data.slug,
            senderName: name,
            message: rsvpMessage.trim(),
            reaction: "💐",
          }),
        });
      }
    } catch {
      // Offline fallback
    } finally {
      setIsSubmitting(false);
      setRsvpMessage("");
      showToast("Ucapan & konfirmasi kehadiran Anda telah terkirim!");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#faf6f0] text-[#26332f] font-sans antialiased selection:bg-[#1f3a34] selection:text-[#f1dcae] theme-wrapper no-scrollbar">
      {/* Background Audio */}
      <audio
        ref={audioRef}
        src={data.musicUrl || "/music/wedding-romance.mp3"}
        loop
        preload="auto"
      />

      {/* Toast Notification */}
      <div
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-[#1f3a34] text-[#faf6f0] border border-[#b08a4a]/40 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase shadow-2xl flex items-center gap-2 transition-all duration-300 pointer-events-none ${
          toastMessage ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95"
        }`}
      >
        <CheckCircle2 className="w-4 h-4 text-[#b08a4a]" />
        <span>{toastMessage}</span>
      </div>

      {/* Floating Vinyl Music Disc Widget (Fixed Bottom Right) */}
      {isFeatureAvailable("music", { data, forcedThemeId: "raka-ayu" }) && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 pointer-events-auto">
          <button
            type="button"
            onClick={toggleAudio}
            aria-label={isPlaying ? "Jeda Musik Latar" : "Putar Musik Latar"}
            title={isPlaying ? "Jeda Musik Latar" : "Putar Musik Latar"}
            className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#1f3a34]/95 border-2 border-[#b08a4a] text-[#b08a4a] shadow-2xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <>
                {/* Vinyl record spinning animation */}
                <div className="w-8 h-8 rounded-full bg-[#12221e] flex items-center justify-center animate-spin [animation-duration:4s]">
                  <div className="w-3 h-3 rounded-full bg-[#b08a4a] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#faf6f0]" />
                  </div>
                </div>
                {/* Audio pulse badge */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b08a4a] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#b08a4a]"></span>
                </span>
              </>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#12221e] flex items-center justify-center">
                <Play className="w-4 h-4 ml-0.5 text-[#b08a4a]" />
              </div>
            )}
          </button>
          <span className="hidden sm:inline-block bg-[#1f3a34]/90 text-[#faf6f0] text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-[#b08a4a]/40 backdrop-blur-md shadow-lg font-sans">
            {isPlaying ? "Playing: Romantic Melody" : "Music Paused"}
          </span>
        </div>
      )}

      {/* Main Container: Split-Screen Desktop Architecture (60/40) */}
      <div className="min-h-screen flex flex-col lg:flex-row w-full max-w-[1680px] mx-auto shadow-2xl relative bg-[#faf6f0] theme-wrapper no-scrollbar">
        {/* ========================================================================= */}
        {/* DESKTOP LEFT PANEL (Sticky 58-60%, 100vh)                                */}
        {/* ========================================================================= */}
        {!isEmbedded && (
          <aside className="hidden lg:flex lg:w-[58%] xl:w-[60%] h-screen sticky top-0 overflow-hidden flex-col justify-between p-12 xl:p-16 text-[#faf6f0] z-10 select-none bg-[#1f3a34]">
            {/* Emerald Vignette Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f3a34]/95 via-[#1f3a34]/50 to-[#1f3a34]/70 z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/40 z-10 pointer-events-none" />

            {/* Pre-wedding Image Background */}
            <img
              src={leftPanelImage}
              alt={`${coupleDisplayName} Prewedding`}
              className="absolute inset-0 w-full h-full object-cover object-center brightness-90 contrast-105 z-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/templates/raka-ayu/desktop-cover.jpg";
              }}
            />

            {/* Top Branding on Left Panel */}
            <div className="relative z-20 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-[1px] bg-[#b08a4a]" />
                <span className="text-xs uppercase tracking-[0.3em] font-medium text-[#faf6f0]/90">
                  Official Wedding Invitation
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border border-[#b08a4a]/60 flex items-center justify-center font-serif text-sm tracking-widest text-[#f1dcae] backdrop-blur-sm bg-black/20">
                {coupleMonogram}
              </div>
            </div>

            {/* Center / Lower Editorial Title on Left Panel */}
            <div className="relative z-20 my-auto py-12 max-w-xl">
              <span className="text-xs uppercase tracking-[0.35em] text-[#b08a4a] font-semibold mb-3 block">
                The Wedding Celebration Of
              </span>
              <h2 className="font-script-pinyon text-6xl xl:text-7xl 2xl:text-8xl text-[#f1dcae] font-normal leading-[1.1] mb-4">
                {groomNick} <span className="font-serif italic text-3xl xl:text-4xl text-[#faf6f0]/80">&amp;</span> {brideNick}
              </h2>
              <div className="h-[1px] w-20 bg-[#b08a4a]/80 mb-4" />
              <p className="font-serif italic text-lg xl:text-xl text-[#faf6f0]/95 font-light leading-relaxed mb-6">
                &quot;Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri, agar kamu merasa tenteram kepadanya.&quot;
              </p>

              {/* Wedding Date & Venue Chip */}
              <div className="inline-flex items-center gap-5 bg-[#12221e]/80 backdrop-blur-md border border-[#b08a4a]/30 px-5 py-3 rounded-full text-[#faf6f0]/90 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#b08a4a]" />
                  <span className="font-medium tracking-wide">{primaryEventDateStr}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-[#faf6f0]/40" />
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#b08a4a]" />
                  <span className="text-[#faf6f0]/80">{primaryEventVenue}</span>
                </div>
              </div>
            </div>

            {/* Bottom Panel Note on Left Panel */}
            <div className="relative z-20 flex justify-between items-center border-t border-[#b08a4a]/30 pt-4 text-xs text-[#faf6f0]/70 tracking-widest uppercase">
              <span>Royal Tema 01</span>
              <span>Scroll Right to Explore Invitation ↓</span>
            </div>
          </aside>
        )}

        {/* ========================================================================= */}
        {/* RIGHT PANEL (Scrollable 40-42%, max-width 480px centered mobile layout)   */}
        {/* ========================================================================= */}
        <div
          className={`w-full ${
            !isEmbedded ? "lg:w-[42%] xl:w-[40%]" : "max-w-[480px] mx-auto"
          } bg-[#faf6f0] flex flex-col justify-start items-center relative ${
            isOpen ? "overflow-y-auto lg:h-screen" : "overflow-hidden h-screen"
          } no-scrollbar shadow-inner`}
        >
          {/* Constrained Mobile Content Wrapper (Max width 480px on desktop) */}
          <div className="w-full max-w-[480px] min-h-screen bg-[#faf6f0] border-x border-[#ead7d0]/60 flex flex-col relative pb-28">
            {/* ======================================================================= */}
            {/* SECTION 1: DOUBLE FRENCH DOOR COVER OVERLAY (Aligned 100% on card)      */}
            {/* ======================================================================= */}
            <div
              className={`fixed lg:absolute inset-0 z-50 flex items-center justify-center overflow-hidden transition-all duration-700 select-none ${
                isOpen ? "pointer-events-none opacity-0 invisible" : "opacity-100 visible"
              }`}
            >
              {/* Left French Door */}
              <div
                className={`absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-[#1f3a34] to-[#2b4d45] transition-transform duration-1000 ease-[cubic-bezier(0.77,0,0.18,1)] delay-100 ${
                  isOpen ? "-translate-x-full" : "translate-x-0"
                }`}
              >
                <div className="absolute inset-4 border border-[#b08a4a]/55 border-r-0" />
              </div>

              {/* Right French Door */}
              <div
                className={`absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-[#1f3a34] to-[#2b4d45] transition-transform duration-1000 ease-[cubic-bezier(0.77,0,0.18,1)] delay-100 ${
                  isOpen ? "translate-x-full" : "translate-x-0"
                }`}
              >
                <div className="absolute inset-4 border border-[#b08a4a]/55 border-l-0" />
              </div>

              {/* Inner Content on Door Front */}
              <div
                className={`relative z-10 p-6 text-center text-[#faf6f0] flex flex-col items-center max-w-sm transition-all duration-700 ${
                  isOpen ? "opacity-0 scale-110 pointer-events-none" : "opacity-100 scale-100"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.35em] text-[#faf6f0]/80">
                  The Wedding Of
                </p>
                <h1 className="font-script-pinyon text-6xl sm:text-7xl text-[#f1dcae] my-3 leading-tight animate-pulse">
                  {coupleDisplayName}
                </h1>
                <div className="w-12 h-[1px] bg-[#b08a4a] my-2" />

                <p className="text-xs tracking-wider text-[#faf6f0]/80 mt-6 mb-1">
                  Kepada Yth. Bapak/Ibu/Saudara/i:
                </p>
                <p className="font-serif text-2xl font-normal text-[#faf6f0] mb-6">
                  {guestName || "Tamu Undangan"}
                </p>

                <button
                  type="button"
                  onClick={handleOpenInvitation}
                  className="py-3 px-8 text-xs uppercase tracking-[0.2em] font-medium text-[#faf6f0] border border-[#b08a4a] hover:bg-[#b08a4a] hover:text-[#1f3a34] transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  <span>Buka Undangan</span>
                </button>
              </div>
            </div>
            {/* =================================================================== */}
            {/* SECTION 2: HERO BANNER WITH KEN BURNS & ROSE PETALS                 */}
            {/* =================================================================== */}
            <section
              id="raka-hero"
              className="relative w-full min-h-screen flex items-center justify-center text-center text-[#faf6f0] overflow-hidden p-6"
            >
              {/* Ken Burns Background */}
              <div className="absolute inset-0 z-0">
                <img
                  src={heroBgImage}
                  alt={`${coupleDisplayName} Hero`}
                  className="w-full h-full object-cover filter brightness-75 contrast-105 scale-105 animate-pulse duration-[10000ms]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/templates/raka-ayu/cover.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f3a34] via-[#1f3a34]/60 to-[#1f3a34]/40" />
              </div>

              {/* Romantic Rose Petals floating particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-4 bg-[#ead7d0]/70 rounded-tr-full rounded-bl-full animate-bounce opacity-70"
                    style={{
                      left: `${(i * 19) % 95}%`,
                      top: `${(i * 13) % 85}%`,
                      animationDuration: `${4 + (i % 5)}s`,
                      transform: `rotate(${i * 35}deg)`,
                    }}
                  />
                ))}
              </div>

              {/* Hero Inner Info */}
              <div className="relative z-20 py-12 flex flex-col items-center">
                <p className="text-xs uppercase tracking-[0.35em] text-[#faf6f0]/90 mb-3">
                  Kami Menikah
                </p>
                <h1 className="font-script-pinyon text-6xl sm:text-7xl text-[#f1dcae] my-2 leading-none">
                  {coupleDisplayName}
                </h1>
                <div className="w-16 h-[1px] bg-[#b08a4a] my-4" />
                <p className="font-serif text-lg tracking-widest text-[#faf6f0]/90">
                  {primaryEventDateStr}
                </p>
              </div>

              {/* Vertical Scroll Line */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[1px] h-12 bg-gradient-to-b from-[#b08a4a] to-transparent animate-pulse" />
            </section>

            {/* =================================================================== */}
            {/* SECTION 3: BISMILLAH & QURANIC VERSE                                */}
            {/* =================================================================== */}
            <section className="py-16 px-6 text-center border-b border-[#ead7d0]">
              <p className="font-script-pinyon text-5xl text-[#b08a4a]">Bismillah</p>
              <div className="w-16 h-[1px] bg-[#b08a4a] mx-auto my-5" />
              <p className="font-serif italic text-lg sm:text-xl text-[#26332f] max-w-sm mx-auto leading-relaxed">
                &quot;Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri, agar kamu merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.&quot;
              </p>
              <p className="text-xs text-[#b08a4a] tracking-widest uppercase font-semibold mt-4">
                QS. Ar-Rum: 21
              </p>
            </section>

            {/* =================================================================== */}
            {/* SECTION 4: COUPLE PROFILES (MEMPELAI)                               */}
            {/* =================================================================== */}
            <section id="couple" className="py-16 px-6 text-center border-b border-[#ead7d0]">
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1f3a34] mb-3">
                Mempelai
              </h2>
              <p className="text-xs text-[#26332f]/80 max-w-sm mx-auto mb-10 leading-relaxed">
                Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan syukuran pernikahan kami:
              </p>

              <div className="flex flex-col gap-10">
                {/* Groom Card */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-48 h-64 rounded-t-full rounded-b-sm overflow-hidden mb-5 bg-[#ead7d0] p-1 border border-[#b08a4a]/40"
                    style={{ boxShadow: "10px 10px 0 #ead7d0" }}
                  >
                    <img
                      src={groomPhoto}
                      alt={groomFullName}
                      className="w-full h-full object-cover rounded-t-full rounded-b-sm"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/templates/raka-ayu/groom.jpg";
                      }}
                    />
                  </div>
                  <h3 className="font-serif text-2xl text-[#1f3a34] font-medium">
                    {groomFullName}
                  </h3>
                  <p className="text-xs text-[#26332f]/80 mt-1 max-w-xs">{groomParents}</p>
                  {data.coupleInfo.groomInstagram && (
                    <a
                      href={`https://instagram.com/${data.coupleInfo.groomInstagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#b08a4a] mt-3 hover:underline"
                    >
                      <InstagramIcon className="w-3.5 h-3.5" />
                      <span>{data.coupleInfo.groomInstagram}</span>
                    </a>
                  )}
                </div>

                {/* Romantic Ampersand */}
                <div className="font-script-pinyon text-5xl text-[#b08a4a]">&amp;</div>

                {/* Bride Card */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-48 h-64 rounded-t-full rounded-b-sm overflow-hidden mb-5 bg-[#ead7d0] p-1 border border-[#b08a4a]/40"
                    style={{ boxShadow: "10px 10px 0 #ead7d0" }}
                  >
                    <img
                      src={bridePhoto}
                      alt={brideFullName}
                      className="w-full h-full object-cover rounded-t-full rounded-b-sm"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/templates/raka-ayu/bride.jpg";
                      }}
                    />
                  </div>
                  <h3 className="font-serif text-2xl text-[#1f3a34] font-medium">
                    {brideFullName}
                  </h3>
                  <p className="text-xs text-[#26332f]/80 mt-1 max-w-xs">{brideParents}</p>
                  {data.coupleInfo.brideInstagram && (
                    <a
                      href={`https://instagram.com/${data.coupleInfo.brideInstagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#b08a4a] mt-3 hover:underline"
                    >
                      <InstagramIcon className="w-3.5 h-3.5" />
                      <span>{data.coupleInfo.brideInstagram}</span>
                    </a>
                  )}
                </div>
              </div>
            </section>

            {/* =============================================================== */}
            {/* FEATURE: QR TICKET ENTRY BADGE                                  */}
            {/* =============================================================== */}
            {isFeatureAvailable("qr_ticket", { data, forcedThemeId: "raka-ayu" }) && (
              <div className="py-5 px-6 border-b border-[#ead7d0] bg-[#1f3a34]/10">
                <div className="p-4 border border-[#b08a4a] bg-white flex items-center justify-between gap-3 text-left shadow-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#b08a4a] font-semibold">Tiket Tamu Undangan</p>
                    <p className="font-serif text-lg text-[#1f3a34] font-medium">{guestName || "Tamu Undangan"}</p>
                    <p className="text-[11px] text-[#26332f]/70">Scan QR Code di meja resepsi acara</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQrTicketModal(true)}
                    className="px-3.5 py-2 text-xs uppercase tracking-wider text-white bg-[#1f3a34] hover:bg-[#2b4d45] font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Buka QR</span>
                  </button>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 5: LIVE COUNTDOWN TIMER                                     */}
            {/* =================================================================== */}
            {isFeatureAvailable("countdown", { data, forcedThemeId: "raka-ayu" }) && (
              <section className="py-14 px-6 bg-[#1f3a34] text-[#faf6f0] text-center border-b border-[#ead7d0]">
              <h2 className="font-serif text-3xl text-[#f1dcae] mb-2">
                Menuju Hari Bahagia
              </h2>
              <p className="text-xs text-[#faf6f0]/75 mb-6">
                Menghitung detik menuju ikrar suci janji suci kami:
              </p>

              <div className="grid grid-cols-4 gap-2.5 max-w-xs mx-auto">
                <div className="p-3 border border-[#b08a4a]/60 bg-[#12221e]/80 rounded-none shadow-md">
                  <b className="block font-serif text-2xl sm:text-3xl text-[#f1dcae]">
                    {timeLeft.days}
                  </b>
                  <span className="text-[10px] uppercase tracking-wider text-[#faf6f0]/70">
                    Hari
                  </span>
                </div>
                <div className="p-3 border border-[#b08a4a]/60 bg-[#12221e]/80 rounded-none shadow-md">
                  <b className="block font-serif text-2xl sm:text-3xl text-[#f1dcae]">
                    {timeLeft.hours}
                  </b>
                  <span className="text-[10px] uppercase tracking-wider text-[#faf6f0]/70">
                    Jam
                  </span>
                </div>
                <div className="p-3 border border-[#b08a4a]/60 bg-[#12221e]/80 rounded-none shadow-md">
                  <b className="block font-serif text-2xl sm:text-3xl text-[#f1dcae]">
                    {timeLeft.minutes}
                  </b>
                  <span className="text-[10px] uppercase tracking-wider text-[#faf6f0]/70">
                    Menit
                  </span>
                </div>
                <div className="p-3 border border-[#b08a4a]/60 bg-[#12221e]/80 rounded-none shadow-md">
                  <b className="block font-serif text-2xl sm:text-3xl text-[#f1dcae]">
                    {timeLeft.seconds}
                  </b>
                  <span className="text-[10px] uppercase tracking-wider text-[#faf6f0]/70">
                    Detik
                  </span>
                </div>
              </div>
            </section>
          )}

            {/* =================================================================== */}
            {/* SECTION 6: RANGKAIAN ACARA (EVENTS & SCHEDULES)                     */}
            {/* =================================================================== */}
            <section id="event" className="py-16 px-6 text-center border-b border-[#ead7d0]">
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1f3a34] mb-3">
                Rangkaian Acara
              </h2>
              <p className="text-xs text-[#26332f]/80 max-w-sm mx-auto mb-8">
                Merupakan kehormatan bagi kami atas kehadiran dan doa restu Bapak/Ibu/Saudara/i:
              </p>

              <div className="flex flex-col gap-6">
                {schedules.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-8 border border-[#b08a4a] relative bg-white shadow-sm text-center"
                  >
                    {/* Inner decorative frame */}
                    <div className="absolute inset-2 border border-[#ead7d0] pointer-events-none" />

                    <h3 className="font-serif text-2xl text-[#1f3a34] mb-2">{ev.eventName}</h3>
                    <div className="w-12 h-[1px] bg-[#b08a4a] mx-auto my-3" />
                    <p className="text-xs font-medium text-[#b08a4a] uppercase tracking-wider mb-1">
                      {ev.startTime} {ev.endTime ? `– ${ev.endTime}` : ""}
                    </p>
                    <p className="font-serif text-base text-[#1f3a34] font-semibold mb-1">
                      {ev.venueName}
                    </p>
                    <p className="text-xs text-[#26332f]/70 leading-relaxed mb-6">{ev.address}</p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                      {ev.mapsUrl && (
                        <a
                          href={ev.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-5 bg-[#1f3a34] hover:bg-[#b08a4a] text-white text-xs uppercase tracking-wider font-medium transition-colors flex items-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Buka Google Maps</span>
                        </a>
                      )}
                      <a
                        href={generateGoogleCalendarUrl(
                          `${ev.eventName} - ${coupleDisplayName}`,
                          ev.date,
                          ev.startTime,
                          ev.venueName
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-5 border border-[#1f3a34] text-[#1f3a34] hover:bg-[#1f3a34] hover:text-white text-xs uppercase tracking-wider font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Simpan Kalender</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Embedded Google Maps */}
              {isFeatureAvailable("google_maps", { data, forcedThemeId: "raka-ayu" }) && (
                <div className="mt-8 overflow-hidden border border-[#b08a4a]">
                  <GoogleMapEmbed
                    venueName={schedules[0]?.venueName || "Lokasi Acara"}
                    address={
                      schedules[0]?.address ||
                      "Masjid Agung Al-Azhar Kebayoran Baru Jakarta"
                    }
                    mapsUrl={schedules[0]?.mapsUrl}
                    latitude={schedules[0]?.latitude}
                    longitude={schedules[0]?.longitude}
                    heightClass="h-56 sm:h-64"
                  />
                </div>
              )}
            </section>

            {/* =================================================================== */}
            {/* SECTION 7: KISAH KAMI (LOVE STORY TIMELINE)                         */}
            {/* =================================================================== */}
            {isFeatureAvailable("love_story", { data, forcedThemeId: "raka-ayu" }) && (
              <section id="story" className="py-16 px-6 text-center border-b border-[#ead7d0]">
                <h2 className="font-serif text-3xl sm:text-4xl text-[#1f3a34] mb-3">
                  Kisah Kami
                </h2>
                <div className="w-12 h-[1px] bg-[#b08a4a] mx-auto mb-8" />

                <div className="relative max-w-sm mx-auto text-left pl-6 border-l border-[#b08a4a] space-y-8 py-2">
                  {(data.coupleInfo.stories && data.coupleInfo.stories.length > 0
                    ? data.coupleInfo.stories
                    : [
                        {
                          date: "2019",
                          title: "Pertama Bertemu",
                          story: "Kami pertama kali bertemu di sebuah acara kampus dan mulai menjalin pertemanan hangat.",
                        },
                        {
                          date: "2022",
                          title: "Memulai Perjalanan",
                          story: "Pertemanan perlahan berubah menjadi komitmen mendalam untuk saling menjaga dan menghargai.",
                        },
                        {
                          date: "2025",
                          title: "Menuju Ikrar Suci",
                          story: "Dengan restu kedua orang tua dan keluarga, kami mantap melangkah ke jenjang pernikahan.",
                        },
                      ]
                  ).map((st, i) => (
                    <div key={i} className="relative pl-4">
                      {/* Timeline Node */}
                      <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#faf6f0] border-2 border-[#b08a4a]" />
                      <span className="text-xs uppercase tracking-widest text-[#b08a4a] font-semibold block">
                        {st.date}
                      </span>
                      <h3 className="font-serif text-xl text-[#1f3a34] my-1 font-medium">
                        {st.title}
                      </h3>
                      <p className="text-xs text-[#26332f]/80 leading-relaxed">{st.story}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* =================================================================== */}
            {/* SECTION 8: GALERI MOMEN (GALLERY & LIGHTBOX)                        */}
            {/* =================================================================== */}
            {isFeatureAvailable("gallery", { data, forcedThemeId: "raka-ayu" }) && (
              <section id="gallery" className="py-16 px-6 text-center border-b border-[#ead7d0]">
                <h2 className="font-serif text-3xl sm:text-4xl text-[#1f3a34] mb-3">
                  Galeri Momen
                </h2>
                <p className="text-xs text-[#26332f]/80 max-w-sm mx-auto mb-8">
                  Potret kenangan manis langkah perjalanan cinta kami:
                </p>

                <div className="grid grid-cols-3 gap-2.5">
                  {galleryItems.map((g, idx) => (
                    <div
                      key={g.id || idx}
                      onClick={() => setLightboxImg(g.imageUrl)}
                      className={`relative overflow-hidden cursor-zoom-in bg-[#ead7d0] group shadow-sm ${
                        idx === 0 || idx === 5 ? "col-span-2 aspect-[16/10]" : "aspect-square"
                      }`}
                    >
                      <img
                        src={g.imageUrl}
                        alt={`Galeri ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/templates/raka-ayu/cover.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-[#1f3a34]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* =================================================================== */}
            {/* SECTION 9: KONFIRMASI KEHADIRAN (RSVP) & BUKU TAMU (WISHES)         */}
            {/* =================================================================== */}
            {Boolean(
              isFeatureAvailable("rsvp", { data, forcedThemeId: "raka-ayu" }) ||
                isFeatureAvailable("wishes", { data, forcedThemeId: "raka-ayu" })
            ) && (
              <section id="rsvp" className="py-16 px-6 text-center border-b border-[#ead7d0]">
                {isFeatureAvailable("rsvp", { data, forcedThemeId: "raka-ayu" }) && (
                  <>
                    <h2 className="font-serif text-3xl sm:text-4xl text-[#1f3a34] mb-3">
                      Konfirmasi Kehadiran
                    </h2>
                    <p className="text-xs text-[#26332f]/80 max-w-sm mx-auto mb-8">
                      Mohon konfirmasi kehadiran Anda agar kami dapat menyambut kehadiran Anda dengan hangat:
                    </p>

                    <form onSubmit={handleRsvpSubmit} className="max-w-sm mx-auto text-left space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-[#26332f]/80 mb-1">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          required
                          value={rsvpName}
                          onChange={(e) => setRsvpName(e.target.value)}
                          placeholder="Nama Anda"
                          className="w-full text-xs p-3 bg-white border border-[#cdbfb3] focus:border-[#b08a4a] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-[#26332f]/80 mb-1">
                          Konfirmasi Kehadiran
                        </label>
                        <select
                          value={rsvpAttendance}
                          onChange={(e) => setRsvpAttendance(e.target.value)}
                          className="w-full text-xs p-3 bg-white border border-[#cdbfb3] focus:border-[#b08a4a] outline-none"
                        >
                          <option value="Hadir">Hadir</option>
                          <option value="Tidak Hadir">Tidak Hadir</option>
                          <option value="Masih Ragu">Masih Ragu</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-[#26332f]/80 mb-1">
                          Ucapan &amp; Doa Restu
                        </label>
                        <textarea
                          rows={4}
                          value={rsvpMessage}
                          onChange={(e) => setRsvpMessage(e.target.value)}
                          placeholder="Tuliskan ucapan dan doa terbaik untuk kedua mempelai..."
                          className="w-full text-xs p-3 bg-white border border-[#cdbfb3] focus:border-[#b08a4a] outline-none resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-[#1f3a34] hover:bg-[#2b4d45] text-white text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-md"
                      >
                        {isSubmitting ? "Mengirimkan..." : "Kirim Ucapan & Konfirmasi"}
                      </button>
                    </form>
                  </>
                )}

                {/* Wishes Wall Stream */}
                {isFeatureAvailable("wishes", { data, forcedThemeId: "raka-ayu" }) && (
                  <div className="max-w-sm mx-auto mt-10 text-left border-t border-[#ead7d0] pt-6">
                    <p className="text-xs uppercase tracking-wider text-[#b08a4a] font-semibold mb-3">
                      Doa &amp; Ucapan ({wishesList.length})
                    </p>
                    <div className="space-y-3.5 max-h-72 overflow-y-auto no-scrollbar pr-1">
                      {wishesList.map((w) => (
                        <div key={w.id} className="pb-3 border-b border-[#ead7d0]/70 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-serif text-base font-semibold text-[#1f3a34]">
                              {w.senderName}
                            </span>
                            <span className="text-[10px] text-[#b08a4a] font-medium bg-[#ead7d0]/40 px-2 py-0.5 rounded-full">
                              {w.attendance}
                            </span>
                          </div>
                          <p className="text-[#26332f]/80 leading-relaxed">{w.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* =================================================================== */}
            {/* SECTION 10: AMPLOP DIGITAL (DIGITAL GIFTS & CASHLESS)               */}
            {/* =================================================================== */}
            {isFeatureAvailable("digital_gift", { data, forcedThemeId: "raka-ayu" }) && (
              <section id="gift" className="py-16 px-6 text-center border-b border-[#ead7d0]">
                <h2 className="font-serif text-3xl sm:text-4xl text-[#1f3a34] mb-3">
                  Amplop Digital
                </h2>
                <p className="text-xs text-[#26332f]/80 max-w-sm mx-auto mb-8">
                  Kehadiran dan doa restu Anda adalah hadiah terindah bagi kami. Namun jika Anda bermaksud memberikan tanda kasih, dapat melalui rekening berikut:
                </p>

                <div className="flex flex-col gap-4 max-w-sm mx-auto">
                  {bankAccounts.map((b) => (
                    <div
                      key={b.id || b.accountNumber}
                      className="p-6 border border-[#b08a4a] bg-white text-center shadow-xs"
                    >
                      <p className="text-xs uppercase tracking-widest text-[#b08a4a] font-semibold mb-1">
                        {b.bankName}
                      </p>
                      <b className="font-serif text-2xl text-[#1f3a34] block tracking-wider my-1">
                        {b.accountNumber}
                      </b>
                      <p className="text-xs text-[#26332f]/70 mb-4">a.n. {b.accountHolder}</p>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(b.accountNumber, `Nomor Rekening ${b.bankName}`)}
                        className="py-2 px-5 bg-[#1f3a34] hover:bg-[#b08a4a] text-white text-xs uppercase tracking-wider font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Nomor</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* =================================================================== */}
            {/* SECTION 11: KIRIM KADO FISIK (PHYSICAL GIFT)                        */}
            {/* =================================================================== */}
            {isFeatureAvailable("physical_gift", { data, forcedThemeId: "raka-ayu" }) && physicalGiftList.length > 0 && (
              <section className="py-16 px-6 text-center border-b border-[#ead7d0]">
                <p className="text-xs uppercase tracking-widest text-[#b08a4a] font-semibold mb-1">
                  Kirim Hadiah
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#1f3a34] mb-3">
                  Kirim Kado Fisik
                </h2>
                <p className="text-xs text-[#26332f]/80 max-w-sm mx-auto mb-6 leading-relaxed">
                  Bagi keluarga dan sahabat yang ingin mengirimkan bingkisan atau tanda kasih fisik ke kediaman mempelai:
                </p>
                <div className="space-y-4 max-w-sm mx-auto">
                  {physicalGiftList.map((item, idx) => {
                    const fullText = `${item.receiver || coupleDisplayName}\n${item.address}\nTelp: ${item.phone || "-"}`;
                    return (
                      <div key={item.id || idx} className="p-6 border border-[#b08a4a] bg-white text-left space-y-2.5 shadow-sm">
                        <div className="flex items-center gap-2 text-[#b08a4a] text-xs font-semibold uppercase tracking-wider">
                          <MapPin className="w-4 h-4" />
                          <span>{item.title || `Alamat ${idx + 1}`}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#1f3a34]">{item.receiver || coupleDisplayName}</p>
                        <p className="text-xs text-[#26332f]/80 leading-relaxed">{item.address}</p>
                        {item.phone && <p className="text-xs text-[#b08a4a] font-mono">No. Telp: {item.phone}</p>}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                fullText,
                                item.title || `Alamat Pengiriman ${idx + 1}`
                              )
                            }
                            className="py-2 px-5 bg-[#1f3a34] hover:bg-[#b08a4a] text-white text-xs uppercase tracking-wider font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Alamat Lengkap</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* =================================================================== */}
            {/* FOOTER SECTION                                                      */}
            {/* =================================================================== */}
            <footer className="py-14 px-6 bg-[#1f3a34] text-[#faf6f0] text-center">
              <p className="text-xs text-[#faf6f0]/80 mb-2">Terima kasih atas doa dan kehadirannya</p>
              <p className="font-script-pinyon text-5xl text-[#f1dcae] my-2">
                {coupleDisplayName}
              </p>
              <div className="w-12 h-[1px] bg-[#b08a4a]/40 mx-auto my-4" />
              <small className="text-[10px] text-[#faf6f0]/50 tracking-widest uppercase block">
                Invity by Fasaro • Royal Tema 01
              </small>
            </footer>
          </div>
        </div>
      </div>

      {/* Guest QR Code Ticket Modal */}
      {showQrTicketModal && isFeatureAvailable("qr_ticket", { data, forcedThemeId: "raka-ayu" }) && (
        <div
          onClick={() => setShowQrTicketModal(false)}
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#faf6f0] border-2 border-[#b08a4a] max-w-xs w-full p-6 text-center space-y-4 shadow-2xl relative"
          >
            <button
              onClick={() => setShowQrTicketModal(false)}
              className="absolute top-3 right-3 text-[#26332f]/60 hover:text-[#26332f] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-2 text-[#1f3a34]">
              <QrCode className="w-5 h-5 text-[#b08a4a]" />
              <span className="font-serif text-xl tracking-wider font-bold">Tiket Tamu Resepsi</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#b08a4a] font-semibold">Tamu Terhormat</p>
              <h4 className="font-serif text-2xl text-[#1f3a34] mt-1">{guestName || "Tamu Undangan"}</h4>
            </div>
            <div className="bg-white p-3 inline-block mx-auto border border-[#b08a4a] shadow-sm">
              {qrTicketDataUrl ? (
                <img src={qrTicketDataUrl} alt="QR Code Tamu" className="w-40 h-40 mx-auto" />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-xs text-gray-400">
                  Membuat QR Code...
                </div>
              )}
            </div>
            <p className="text-[11px] text-[#26332f]/70 leading-relaxed">
              Tunjukkan kode QR ini kepada petugas resepsi di pintu masuk untuk check-in kehadiran.
            </p>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
        >
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden">
            <img
              src={lightboxImg}
              alt="Preview Galeri"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#b08a4a] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RakaAyuTheme;

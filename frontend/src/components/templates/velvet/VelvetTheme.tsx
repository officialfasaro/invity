"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { WeddingInvitationData } from "@/types/wedding";
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Copy,
  Disc3,
  Feather,
  Heart,
  MailOpen,
  MapPin,
  Music,
  Send,
  Share2,
  VolumeX,
  X,
  Sparkles,
  Glasses,
} from "lucide-react";
import InstagramIcon from "../shared/InstagramIcon";

interface ThemeProps {
  data: WeddingInvitationData;
  guestName?: string;
  showCover?: boolean;
  isEmbedded?: boolean;
}

interface LocalWish {
  id: string;
  senderName: string;
  timeAgo: string;
  attendance: string;
  guestCount: string;
  message: string;
}

const DEFAULT_WISHES: LocalWish[] = [
  {
    id: "v-wish-1",
    senderName: "Dimas & Anisa",
    timeAgo: "10 menit yang lalu",
    attendance: "Hadir",
    guestCount: "2 Orang",
    message:
      "Barakallah Mekar & Versa! Semoga jadi keluarga sakinah mawaddah warahmah, lancar sampai hari-H nanti ya sahabat baikku!",
  },
  {
    id: "v-wish-2",
    senderName: "Keluarga Bpk. Hendrawan",
    timeAgo: "1 jam yang lalu",
    attendance: "Hadir",
    guestCount: "2 Orang",
    message:
      "Selamat menempuh babak baru kehidupan pernikahan. Semoga senantiasa dipenuhi keberkahan rezeki dan kebahagiaan seumur hidup.",
  },
  {
    id: "v-wish-3",
    senderName: "Sarah Nabilah",
    timeAgo: "2 jam yang lalu",
    attendance: "Tidak Hadir",
    guestCount: "1 Orang",
    message:
      "Mohon maaf belum bisa hadir langsung karena dinas di luar kota. Doa terbaik dan peluk hangat dari jauh untuk Mekar & Versa!",
  },
];

const DEFAULT_GALLERY = [
  {
    src: "/templates/velvet/tea-garden.jpg",
    alt: "Pre-wedding Kebun Teh",
    isWide: true,
  },
  {
    src: "/templates/velvet/rings.jpg",
    alt: "Buket Bunga & Cincin",
    isWide: false,
  },
  {
    src: "/templates/velvet/bride.jpg",
    alt: "Mempelai Wanita",
    isWide: false,
  },
  {
    src: "/templates/velvet/groom.jpg",
    alt: "Mempelai Pria",
    isWide: false,
  },
  {
    src: "/templates/velvet/couple.jpg",
    alt: "Tatapan Kasih",
    isWide: false,
  },
  {
    src: "/templates/velvet/forest.jpg",
    alt: "Pre-wedding Hutan Pinus",
    isWide: true,
  },
];

export const VelvetTheme: React.FC<ThemeProps> = ({
  data,
  guestName,
  showCover = true,
  isEmbedded = false,
}) => {
  const [isOpen, setIsOpen] = useState(!showCover);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [rsvpName, setRsvpName] = useState(guestName || "");
  const [rsvpStatus, setRsvpStatus] = useState<"Hadir" | "Tidak Hadir">("Hadir");
  const [rsvpCount, setRsvpCount] = useState("2");
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Wishes State
  const [wishesList, setWishesList] = useState<LocalWish[]>(() => {
    if (data.wishes && data.wishes.length > 0) {
      return data.wishes.map((w, idx) => ({
        id: w.id || `wish-${idx}`,
        senderName: w.senderName,
        timeAgo: "Baru saja",
        attendance: "Hadir",
        guestCount: "2 Orang",
        message: w.message,
      }));
    }
    return DEFAULT_WISHES;
  });

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const primaryEvent = data.eventSchedules?.[0];
  const secondaryEvent = data.eventSchedules?.[1];

  const groomName = data.coupleInfo.groomName || "Versa Pratama, S.T.";
  const brideName = data.coupleInfo.brideName || "Mekar Anggraini, S.Ds.";

  const coupleDisplayName = useMemo(() => {
    const groom = data.coupleInfo.groomNickname || data.coupleInfo.groomName?.split(" ")[0] || "Versa";
    const bride = data.coupleInfo.brideNickname || data.coupleInfo.brideName?.split(" ")[0] || "Mekar";
    return `${groom} & ${bride}`;
  }, [data.coupleInfo]);

  const groomParents = useMemo(() => {
    if (data.coupleInfo.groomFather && data.coupleInfo.groomMother) {
      return `${data.coupleInfo.groomFather} & ${data.coupleInfo.groomMother}`;
    }
    return "Bpk. Bambang Wijaya & Ibu Sri Rahayu";
  }, [data.coupleInfo.groomFather, data.coupleInfo.groomMother]);

  const brideParents = useMemo(() => {
    if (data.coupleInfo.brideFather && data.coupleInfo.brideMother) {
      return `${data.coupleInfo.brideFather} & ${data.coupleInfo.brideMother}`;
    }
    return "Bpk. Hendra Kusuma & Ibu Dewi Sartika";
  }, [data.coupleInfo.brideFather, data.coupleInfo.brideMother]);

  // Toast Helper
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Audio Toggle
  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      showToast("Musik diheningkan");
      window.dispatchEvent(
        new CustomEvent("fasaro:music-state", { detail: { isPlaying: false } })
      );
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          showToast("Musik pernikahan diputar");
          window.dispatchEvent(
            new CustomEvent("fasaro:music-state", { detail: { isPlaying: true } })
          );
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [isPlaying, showToast]);

  // Sync external music toggle
  useEffect(() => {
    const handleToggle = () => toggleAudio();
    window.addEventListener("fasaro:music-toggle", handleToggle);
    return () => window.removeEventListener("fasaro:music-toggle", handleToggle);
  }, [toggleAudio]);

  // Open Invitation Handler
  const handleOpenInvitation = () => {
    setIsOpen(true);
    if (!isPlaying && audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          window.dispatchEvent(
            new CustomEvent("fasaro:music-state", { detail: { isPlaying: true } })
          );
        })
        .catch(() => {});
    }

    const target = document.getElementById("couple");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Copy to Clipboard Helper
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

  // Web Share API
  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `The Wedding of ${coupleDisplayName}`,
          text: "Kami mengundang Anda untuk hadir di momen bahagia kami.",
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      copyToClipboard(window.location.href, "Link undangan");
    }
  };

  // Live Countdown Effect
  useEffect(() => {
    const targetDateStr = primaryEvent?.date
      ? new Date(primaryEvent.date).toISOString()
      : "2026-12-20T08:00:00+07:00";
    const targetTimestamp = new Date(targetDateStr).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetTimestamp - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days: String(days).padStart(2, "0"),
          hours: String(hours).padStart(2, "0"),
          minutes: String(minutes).padStart(2, "0"),
          seconds: String(seconds).padStart(2, "0"),
        });
      } else {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [primaryEvent?.date]);

  // Handle RSVP Submit
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = rsvpName.trim();
    const msg = rsvpMessage.trim();

    if (!name || !msg) return;
    setIsSubmitting(true);

    const newWish: LocalWish = {
      id: `vwish-${Date.now()}`,
      senderName: name,
      timeAgo: "Baru saja",
      attendance: rsvpStatus,
      guestCount: `${rsvpCount} Orang`,
      message: msg,
    };

    setWishesList((prev) => [newWish, ...prev]);

    try {
      await fetch("/api/public/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: data.id || data.slug,
          guestName: name,
          status: rsvpStatus === "Hadir" ? "attending" : "declined",
          attendeeCount: parseInt(rsvpCount, 10) || 1,
        }),
      });

      await fetch("/api/public/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: data.id || data.slug,
          senderName: name,
          message: msg,
          reaction: "🍷",
        }),
      });
    } catch {
      // Offline / Demo fallback
    } finally {
      setIsSubmitting(false);
      setRsvpMessage("");
      showToast("Terima kasih! Konfirmasi dan doa Anda telah terkirim.");
    }
  };

  const stories = data.coupleInfo.stories && data.coupleInfo.stories.length > 0
    ? data.coupleInfo.stories
    : [
        {
          date: "Tahun 2022",
          title: "Pertama Bertemu",
          story:
            "Dipertemukan saat proyek studi dan diskusi bersama di kampus. Berawal dari rekan diskusi hangat hingga tumbuh rasa saling menghargai.",
          imageUrl: null,
        },
        {
          date: "Februari 2025",
          title: "Lamaran Resmi",
          story:
            "Dengan niat yang tulus dan restu kedua orang tua, kami mengikat janji suci pertunangan di hadapan keluarga besar.",
          imageUrl: null,
        },
        {
          date: "Desember 2026",
          title: "Menuju Pelaminan",
          story:
            "Melangkah bersama menyempurnakan ibadah dan memulai lembaran baru sebagai keluarga yang sakinah, mawaddah, warahmah.",
          imageUrl: null,
        },
      ];

  const audioSource =
    data.musicUrl ||
    "https://cdn.jsdelivr.net/gh/roimgit/fasaro-assets@main/music/mellow-wedding-2.mp3";

  return (
    <div className="bg-[#F8F4ED] text-[#1C1917] font-sans-jakarta antialiased selection:bg-[#FBE8EB] selection:text-[#3D0A14] overflow-x-hidden min-h-screen">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={audioSource} loop preload="auto" />

      {/* FLOATING ACTION BUTTON (BGM Play/Pause) */}
      {!isEmbedded && (
        <aside className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <button
            onClick={toggleAudio}
            aria-label="Toggle Background Music"
            className={`w-12 h-12 rounded-full bg-[#580F1E] text-[#C5A880] border border-[#C5A880]/40 shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none cursor-pointer ${
              isPlaying ? "animate-spin" : ""
            }`}
          >
            {isPlaying ? (
              <Disc3 className="w-5 h-5 text-[#C5A880]" />
            ) : (
              <Music className="w-5 h-5 text-[#C5A880]" />
            )}
            {isPlaying && (
              <span className="absolute inset-0 rounded-full border border-[#C5A880] animate-ping opacity-30 pointer-events-none" />
            )}
          </button>
        </aside>
      )}

      {/* CONTAINER UTAMA (Mobile-first centered column) */}
      <main className="max-w-md mx-auto min-h-screen bg-[#FDFBF7] shadow-2xl relative border-x border-[#EFE7DA]">
        {/* ======================================================== */}
        {/* 1. COVER / HERO SECTION (Full 100vh Velvet Wax Inspired) */}
        {/* ======================================================== */}
        <section
          id="cover"
          className={`relative w-full velvet-bg flex flex-col items-center justify-between text-center px-6 py-12 text-[#FDFBF7] select-none overflow-hidden transition-all duration-700 ${
            !isOpen && showCover ? "min-h-screen justify-center" : "min-h-[92vh]"
          }`}
        >
          {/* Subtle Decorative Corner Borders */}
          <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-[#C5A880]/40 pointer-events-none" />
          <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-[#C5A880]/40 pointer-events-none" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-[#C5A880]/40 pointer-events-none" />
          <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-[#C5A880]/40 pointer-events-none" />

          {/* Header Cover Note */}
          <div className="z-10 pt-4">
            <p className="text-xs tracking-[0.3em] uppercase text-[#E5D6C1] font-light">
              The Wedding Celebration of
            </p>
            <div className="w-12 h-[1px] bg-[#C5A880]/40 mx-auto my-3" />
          </div>

          {/* Center Envelope & Couple Badge (Wax Seal Card) */}
          <div className="z-10 my-auto flex flex-col items-center max-w-xs w-full">
            <div className="w-full bg-[#fbf8f2] text-[#1C1917] rounded-2xl p-7 shadow-2xl border border-[#C5A880]/30 relative">
              {/* Monogram Badge */}
              <div className="w-10 h-10 mx-auto rounded-full bg-[#F8F4ED] border border-[#C5A880]/40 flex items-center justify-center text-[#580F1E] font-serif-cormorant text-lg font-bold mb-3 shadow-inner">
                V&amp;M
              </div>
              <h1 className="font-serif-cormorant text-3xl sm:text-4xl text-[#3D0A14] tracking-wide font-normal mb-1">
                {coupleDisplayName}
              </h1>
              <p className="text-xs uppercase tracking-widest text-[#2C2723] font-medium">
                {primaryEvent?.date
                  ? new Date(primaryEvent.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Minggu, 20 Desember 2026"}
              </p>

              <div className="my-4 border-t border-dashed border-[#EFE7DA]" />

              {/* Personalized Guest Card */}
              <div className="bg-[#F8F4ED]/80 rounded-xl p-3 border border-[#EFE7DA]/60">
                <span className="text-[11px] uppercase tracking-wider text-[#2C2723]/80 block">
                  Kepada Yth. Bapak/Ibu/Saudara/i:
                </span>
                <span className="font-serif-cormorant text-lg font-bold text-[#3D0A14] block mt-0.5">
                  {guestName || "Tamu Undangan Terhormat"}
                </span>
              </div>

              {/* Wax Seal Look Action Button */}
              <button
                onClick={handleOpenInvitation}
                className="mt-6 w-full py-3.5 px-6 rounded-full bg-[#580F1E] hover:bg-[#751428] active:scale-95 text-[#E5D6C1] text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-wax flex items-center justify-center gap-2.5 wax-pulse cursor-pointer"
              >
                <MailOpen className="w-4 h-4" />
                <span>Buka Undangan</span>
              </button>
            </div>
          </div>

          {/* Footer Cover Note */}
          <div className="z-10 pb-2">
            <p className="text-[11px] text-[#EFE7DA]/70 tracking-widest uppercase font-light">
              #MekarBersamaVersa
            </p>
          </div>
        </section>

        {/* ======================================================== */}
        {/* CONTENT WRAPPER                                          */}
        {/* ======================================================== */}
        <div id="main-content">
          {/* KUTIPAN SUCI / AYAT (Spiritual Blessing) */}
          <section className="px-7 py-16 text-center border-b border-[#EFE7DA]/80 bg-[#FDFBF7]">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FBE8EB] text-[#580F1E] mb-6 shadow-sm">
              <Feather className="w-5 h-5 rotate-45" />
            </div>
            <p className="font-serif-cormorant text-lg sm:text-xl text-[#1C1917] italic leading-relaxed font-light mb-4">
              &quot;{data.coupleInfo.greetingMessage ||
                "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."}&quot;
            </p>
            <span className="text-xs uppercase tracking-widest text-[#A3845C] font-semibold">
              (QS. Ar-Rum: 21)
            </span>
          </section>

          {/* 2. COUPLE PROFILE (Mempelai Pria & Wanita) */}
          <section id="couple" className="px-6 py-20 bg-[#F8F4ED]/60 border-b border-[#EFE7DA]/80">
            <div className="text-center mb-14">
              <span className="text-xs uppercase tracking-[0.25em] text-[#A3845C] font-semibold block mb-2">
                Maha Suci Allah
              </span>
              <h2 className="font-serif-cormorant text-3xl sm:text-4xl text-[#3D0A14] font-normal">
                Mempelai Bahagia
              </h2>
              <div className="w-16 h-[2px] bg-[#C5A880] mx-auto mt-3" />
              <p className="text-xs text-stone-600 mt-4 max-w-xs mx-auto leading-relaxed">
                Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud melangsungkan pernikahan putra-putri kami:
              </p>
            </div>

            {/* Groom Profile Card (Arch Frame) */}
            <div className="bg-white rounded-3xl p-6 shadow-card-luxury border border-[#EFE7DA] text-center mb-8">
              <div className="relative w-44 h-56 mx-auto mb-5 rounded-t-full rounded-b-2xl overflow-hidden border-2 border-[#C5A880]/40 shadow-inner bg-[#EFE7DA]">
                <Image
                  src={data.coupleInfo.groomPhoto || "/templates/velvet/groom.jpg"}
                  alt={groomName}
                  fill
                  className="object-cover object-top hover:scale-105 transition-transform duration-700"
                  sizes="176px"
                />
              </div>
              <h3 className="font-serif-cormorant text-2xl text-[#3D0A14] font-semibold mb-1">
                {groomName}
              </h3>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Putra pertama dari pasangan:<br />
                <strong className="text-[#1C1917] font-medium">{groomParents}</strong>
              </p>
              {data.coupleInfo.groomInstagram && (
                <a
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#580F1E] bg-[#FBE8EB]/60 px-4 py-2 rounded-full hover:bg-[#580F1E] hover:text-[#C5A880] transition-colors"
                  href={`https://instagram.com/${data.coupleInfo.groomInstagram.replace("@", "")}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>@{data.coupleInfo.groomInstagram.replace("@", "")}</span>
                </a>
              )}
            </div>

            {/* Ampersand Divider */}
            <div className="text-center my-6">
              <span className="font-serif-cormorant text-4xl italic text-[#C5A880] font-light">&amp;</span>
            </div>

            {/* Bride Profile Card (Arch Frame) */}
            <div className="bg-white rounded-3xl p-6 shadow-card-luxury border border-[#EFE7DA] text-center">
              <div className="relative w-44 h-56 mx-auto mb-5 rounded-t-full rounded-b-2xl overflow-hidden border-2 border-[#C5A880]/40 shadow-inner bg-[#EFE7DA]">
                <Image
                  src={data.coupleInfo.bridePhoto || "/templates/velvet/bride.jpg"}
                  alt={brideName}
                  fill
                  className="object-cover object-top hover:scale-105 transition-transform duration-700"
                  sizes="176px"
                />
              </div>
              <h3 className="font-serif-cormorant text-2xl text-[#3D0A14] font-semibold mb-1">
                {brideName}
              </h3>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Putri kedua dari pasangan:<br />
                <strong className="text-[#1C1917] font-medium">{brideParents}</strong>
              </p>
              {data.coupleInfo.brideInstagram && (
                <a
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#580F1E] bg-[#FBE8EB]/60 px-4 py-2 rounded-full hover:bg-[#580F1E] hover:text-[#C5A880] transition-colors"
                  href={`https://instagram.com/${data.coupleInfo.brideInstagram.replace("@", "")}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>@{data.coupleInfo.brideInstagram.replace("@", "")}</span>
                </a>
              )}
            </div>
          </section>

          {/* 3. EVENT DETAILS & COUNTDOWN TIMER */}
          <section id="event" className="px-6 py-20 bg-[#FDFBF7] border-b border-[#EFE7DA]/80">
            <div className="text-center mb-10">
              <span className="text-xs uppercase tracking-[0.25em] text-[#A3845C] font-semibold block mb-2">
                Save The Date
              </span>
              <h2 className="font-serif-cormorant text-3xl sm:text-4xl text-[#3D0A14] font-normal">
                Waktu &amp; Tempat
              </h2>
              <div className="w-16 h-[2px] bg-[#C5A880] mx-auto mt-3" />
            </div>

            {/* COUNTDOWN TIMER CONTAINER */}
            <div className="bg-[#3D0A14] text-[#FDFBF7] rounded-3xl p-6 text-center shadow-xl mb-12 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#751428]/30 rounded-full blur-xl pointer-events-none" />
              <h3 className="font-serif-cormorant text-xl text-[#E5D6C1] mb-1">Menghitung Hari</h3>
              <p className="text-[11px] text-[#EFE7DA]/70 tracking-widest uppercase mb-5">
                Menuju Hari Bahagia Kami
              </p>

              {/* Grid 4 Angka Countdown */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-xs mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl py-3 px-1 border border-[#C5A880]/20">
                  <span className="font-serif-cormorant text-2xl sm:text-3xl font-bold text-[#E5D6C1] block">
                    {timeLeft.days}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#EFE7DA] block mt-1">Hari</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl py-3 px-1 border border-[#C5A880]/20">
                  <span className="font-serif-cormorant text-2xl sm:text-3xl font-bold text-[#E5D6C1] block">
                    {timeLeft.hours}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#EFE7DA] block mt-1">Jam</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl py-3 px-1 border border-[#C5A880]/20">
                  <span className="font-serif-cormorant text-2xl sm:text-3xl font-bold text-[#E5D6C1] block">
                    {timeLeft.minutes}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#EFE7DA] block mt-1">Menit</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl py-3 px-1 border border-[#C5A880]/20">
                  <span className="font-serif-cormorant text-2xl sm:text-3xl font-bold text-[#E5D6C1] block">
                    {timeLeft.seconds}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#EFE7DA] block mt-1">Detik</span>
                </div>
              </div>

              {/* Tambahkan ke Google Calendar */}
              <div className="mt-6">
                <a
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#1C1917] bg-[#E5D6C1] hover:bg-[#C5A880] px-5 py-2.5 rounded-full transition-colors"
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                    `The Wedding of ${coupleDisplayName}`
                  )}&dates=20261220T010000Z/20261220T070000Z&details=${encodeURIComponent(
                    `Pernikahan ${groomName} dan ${brideName}`
                  )}&location=${encodeURIComponent(
                    secondaryEvent?.venueName || "Grand Ballroom Hotel Santika Bogor"
                  )}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Simpan ke Google Calendar</span>
                </a>
              </div>
            </div>

            {/* Kartu 1: Akad Nikah */}
            <div className="bg-white rounded-3xl p-6 shadow-card-luxury border border-[#EFE7DA] mb-6">
              <div className="flex items-center justify-between border-b border-[#F8F4ED] pb-4 mb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#A3845C] font-bold">
                    Prosesi Sakral
                  </span>
                  <h3 className="font-serif-cormorant text-2xl text-[#3D0A14] font-bold">
                    {primaryEvent?.eventName || "Akad Nikah"}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FBE8EB] text-[#580F1E] flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-[#580F1E]" />
                </div>
              </div>
              <div className="space-y-3 text-xs text-stone-600 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-[#A3845C] shrink-0 mt-0.5" />
                  <span>
                    {primaryEvent?.date
                      ? new Date(primaryEvent.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Minggu, 20 Desember 2026"}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#A3845C] shrink-0 mt-0.5" />
                  <span>
                    Pukul {primaryEvent?.startTime || "08.00"} - {primaryEvent?.endTime || "10.00 WIB"}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#A3845C] shrink-0 mt-0.5" />
                  <span>
                    <strong>{primaryEvent?.venueName || "Masjid Raya Bogor"}</strong>
                    <br />
                    {primaryEvent?.address || "Jl. Pajajaran No. 10, Baranangsiang, Kota Bogor"}
                  </span>
                </div>
              </div>
              <a
                className="w-full py-2.5 px-4 rounded-xl border border-[#580F1E] text-[#580F1E] hover:bg-[#580F1E] hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                href={
                  primaryEvent?.mapsUrl ||
                  `https://maps.google.com/?q=${encodeURIComponent(
                    primaryEvent?.venueName || "Masjid Raya Bogor"
                  )}`
                }
                rel="noopener noreferrer"
                target="_blank"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Buka Google Maps</span>
              </a>
            </div>

            {/* Kartu 2: Resepsi Pernikahan */}
            <div className="bg-white rounded-3xl p-6 shadow-card-luxury border border-[#EFE7DA]">
              <div className="flex items-center justify-between border-b border-[#F8F4ED] pb-4 mb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#A3845C] font-bold">
                    Perayaan Cinta
                  </span>
                  <h3 className="font-serif-cormorant text-2xl text-[#3D0A14] font-bold">
                    {secondaryEvent?.eventName || "Resepsi Pernikahan"}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FBE8EB] text-[#580F1E] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-3 text-xs text-stone-600 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-[#A3845C] shrink-0 mt-0.5" />
                  <span>
                    {secondaryEvent?.date
                      ? new Date(secondaryEvent.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Minggu, 20 Desember 2026"}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#A3845C] shrink-0 mt-0.5" />
                  <span>
                    Pukul {secondaryEvent?.startTime || "11.00"} - {secondaryEvent?.endTime || "14.00 WIB"}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#A3845C] shrink-0 mt-0.5" />
                  <span>
                    <strong>
                      {secondaryEvent?.venueName || "Grand Ballroom Hotel Santika Bogor"}
                    </strong>
                    <br />
                    {secondaryEvent?.address || "Botani Square Mall, Jl. Raya Padjadjaran, Kota Bogor"}
                  </span>
                </div>
              </div>
              <a
                className="w-full py-2.5 px-4 rounded-xl border border-[#580F1E] text-[#580F1E] hover:bg-[#580F1E] hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                href={
                  secondaryEvent?.mapsUrl ||
                  `https://maps.google.com/?q=${encodeURIComponent(
                    secondaryEvent?.venueName || "Hotel Santika Bogor"
                  )}`
                }
                rel="noopener noreferrer"
                target="_blank"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Buka Google Maps</span>
              </a>
            </div>
          </section>

          {/* 4. GALLERY (Grid Foto 6 Image & Lightbox Modal) */}
          <section id="gallery" className="px-6 py-20 bg-[#F8F4ED]/60 border-b border-[#EFE7DA]/80">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-[0.25em] text-[#A3845C] font-semibold block mb-2">
                Momen Abadi
              </span>
              <h2 className="font-serif-cormorant text-3xl sm:text-4xl text-[#3D0A14] font-normal">
                Galeri Kenangan
              </h2>
              <div className="w-16 h-[2px] bg-[#C5A880] mx-auto mt-3" />
              <p className="text-xs text-stone-600 mt-4 max-w-xs mx-auto">
                Potret kebersamaan kami dalam merajut asa dan cinta suci.
              </p>
            </div>

            {/* Grid Foto */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {DEFAULT_GALLERY.map((item, idx) => (
                <div
                  key={`gal-${idx}`}
                  onClick={() => setLightboxImg(item.src)}
                  className={`${
                    item.isWide ? "col-span-2 h-52" : "h-44"
                  } relative rounded-2xl overflow-hidden shadow-card-luxury cursor-pointer group bg-[#EFE7DA]`}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 450px"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. LOVE STORY (Timeline Perjalanan Cinta) */}
          <section id="story" className="px-6 py-20 bg-[#FDFBF7] border-b border-[#EFE7DA]/80">
            <div className="text-center mb-14">
              <span className="text-xs uppercase tracking-[0.25em] text-[#A3845C] font-semibold block mb-2">
                Our Love Story
              </span>
              <h2 className="font-serif-cormorant text-3xl sm:text-4xl text-[#3D0A14] font-normal">
                Kisah Kami
              </h2>
              <div className="w-16 h-[2px] bg-[#C5A880] mx-auto mt-3" />
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-6 border-l-2 border-[#C5A880]/40 space-y-8 max-w-sm mx-auto">
              {stories.map((s, idx) => (
                <div key={`story-${idx}`} className="relative group">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#580F1E] border-2 border-[#FDFBF7] group-hover:scale-125 transition-transform shadow-sm" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#580F1E] bg-[#FBE8EB]/70 px-2.5 py-1 rounded-md">
                    {s.date}
                  </span>
                  <h3 className="font-serif-cormorant text-xl font-bold text-[#1C1917] mt-2 mb-1">
                    {s.title}
                  </h3>
                  {s.imageUrl && (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden my-2 border border-[#EFE7DA]">
                      <Image src={s.imageUrl} alt={s.title} fill className="object-cover" />
                    </div>
                  )}
                  <p className="text-xs text-stone-600 leading-relaxed">{s.story}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION: DIGITAL GIFT (Cashless Angpao) */}
          <section className="px-6 py-20 bg-[#F8F4ED]/60 border-b border-[#EFE7DA]/80">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-[0.25em] text-[#A3845C] font-semibold block mb-2">
                Tanda Kasih
              </span>
              <h2 className="font-serif-cormorant text-3xl sm:text-4xl text-[#3D0A14] font-normal">
                Kado Digital
              </h2>
              <div className="w-16 h-[2px] bg-[#C5A880] mx-auto mt-3" />
              <p className="text-xs text-stone-600 mt-4 max-w-xs mx-auto">
                Doa restu Anda merupakan karunia terindah bagi kami. Namun jika ingin memberikan tanda kasih secara digital:
              </p>
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
              {/* Rekening BCA */}
              <div className="bg-white rounded-2xl p-5 border border-[#EFE7DA] shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold tracking-wider text-blue-800 block">BANK BCA</span>
                  <p className="font-mono text-sm font-semibold text-[#1C1917] mt-0.5 tracking-wider">
                    8020192831
                  </p>
                  <p className="text-[11px] text-stone-500">a.n {groomName}</p>
                </div>
                <button
                  onClick={() => copyToClipboard("8020192831", "Nomor Rekening BCA")}
                  className="px-3.5 py-1.5 rounded-lg border border-[#EFE7DA] hover:border-[#580F1E] text-xs font-medium text-[#2C2723] hover:text-[#580F1E] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </button>
              </div>

              {/* Rekening Mandiri */}
              <div className="bg-white rounded-2xl p-5 border border-[#EFE7DA] shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold tracking-wider text-amber-700 block">BANK MANDIRI</span>
                  <p className="font-mono text-sm font-semibold text-[#1C1917] mt-0.5 tracking-wider">
                    133009281920
                  </p>
                  <p className="text-[11px] text-stone-500">a.n {brideName}</p>
                </div>
                <button
                  onClick={() => copyToClipboard("133009281920", "Nomor Rekening Mandiri")}
                  className="px-3.5 py-1.5 rounded-lg border border-[#EFE7DA] hover:border-[#580F1E] text-xs font-medium text-[#2C2723] hover:text-[#580F1E] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </button>
              </div>
            </div>
          </section>

          {/* 6. RSVP & WISHES */}
          <section id="rsvp" className="px-6 py-20 bg-[#FDFBF7] border-b border-[#EFE7DA]/80">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-[0.25em] text-[#A3845C] font-semibold block mb-2">
                Konfirmasi Kehadiran
              </span>
              <h2 className="font-serif-cormorant text-3xl sm:text-4xl text-[#3D0A14] font-normal">
                Buku Tamu &amp; RSVP
              </h2>
              <div className="w-16 h-[2px] bg-[#C5A880] mx-auto mt-3" />
              <p className="text-xs text-stone-600 mt-4 max-w-xs mx-auto">
                Mohon kesediaan Bapak/Ibu/Saudara/i untuk mengonfirmasi kehadiran serta mengirimkan doa restu.
              </p>
            </div>

            {/* FORM RSVP */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card-luxury border border-[#EFE7DA] max-w-sm mx-auto mb-12">
              <form onSubmit={handleRsvpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C2723] uppercase tracking-wider mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="Contoh: Rian Pratama & Partner"
                    className="w-full px-4 py-3 rounded-xl border border-[#EFE7DA] bg-[#FDFBF7] text-xs text-[#1C1917] focus:outline-none focus:border-[#580F1E] focus:ring-1 focus:ring-[#580F1E] transition-all placeholder:text-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C2723] uppercase tracking-wider mb-1.5">
                    Konfirmasi Kehadiran
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(["Hadir", "Tidak Hadir"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setRsvpStatus(st)}
                        className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                          rsvpStatus === st
                            ? "bg-[#580F1E] text-[#E5D6C1] border-[#580F1E] shadow-sm"
                            : "bg-[#FDFBF7] text-[#1C1917] border-[#EFE7DA] hover:bg-[#F8F4ED]"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C2723] uppercase tracking-wider mb-1.5">
                    Jumlah Orang
                  </label>
                  <select
                    value={rsvpCount}
                    onChange={(e) => setRsvpCount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#EFE7DA] bg-[#FDFBF7] text-xs text-[#1C1917] focus:outline-none focus:border-[#580F1E] focus:ring-1 focus:ring-[#580F1E] transition-all"
                  >
                    <option value="1">1 Orang</option>
                    <option value="2">2 Orang</option>
                    <option value="3">3 Orang</option>
                    <option value="4+">4+ Orang (Keluarga)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C2723] uppercase tracking-wider mb-1.5">
                    Ucapan &amp; Doa Restu
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={rsvpMessage}
                    onChange={(e) => setRsvpMessage(e.target.value)}
                    placeholder="Tuliskan ucapan dan doa hangat untuk kedua mempelai..."
                    className="w-full px-4 py-3 rounded-xl border border-[#EFE7DA] bg-[#FDFBF7] text-xs text-[#1C1917] focus:outline-none focus:border-[#580F1E] focus:ring-1 focus:ring-[#580F1E] transition-all placeholder:text-stone-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#580F1E] hover:bg-[#751428] text-[#E5D6C1] font-semibold text-xs tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Mengirim..." : "Kirim Konfirmasi & Doa"}</span>
                </button>
              </form>
            </div>

            {/* LIST UCAPAN REAL-TIME */}
            <div className="max-w-sm mx-auto">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-serif-cormorant text-lg text-[#3D0A14] font-bold">
                  Untaian Doa Tamu
                </h3>
                <span className="text-xs bg-[#FBE8EB] text-[#580F1E] px-2.5 py-0.5 rounded-full font-medium">
                  {wishesList.length} Doa Masuk
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1 no-scrollbar">
                {wishesList.map((w) => (
                  <div
                    key={w.id}
                    className="bg-white p-4 rounded-2xl border border-[#EFE7DA] shadow-sm text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#1C1917]">{w.senderName}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          w.attendance === "Hadir"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {w.attendance}
                      </span>
                    </div>
                    <p className="text-stone-600 leading-relaxed">{w.message}</p>
                    <span className="text-[10px] text-stone-400 block mt-2">{w.timeAgo}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FOOTER / CLOSING SECTION */}
          <footer className="px-6 py-16 bg-[#1C1917] text-[#FDFBF7] text-center relative overflow-hidden">
            <div className="max-w-xs mx-auto">
              <p className="text-xs text-[#EFE7DA]/80 leading-relaxed mb-6 font-light">
                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.
              </p>
              <span className="text-[11px] uppercase tracking-widest text-[#C5A880] block mb-1">
                Kami Yang Berbahagia
              </span>
              <h3 className="font-serif-cormorant text-3xl text-warm-50 font-normal mb-6">
                {coupleDisplayName}
              </h3>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 text-xs font-medium text-[#1C1917] bg-[#E5D6C1] hover:bg-[#C5A880] px-5 py-2.5 rounded-full transition-colors mb-8 shadow-sm cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan Undangan Ini</span>
              </button>

              <div className="w-12 h-[1px] bg-[#2C2723] mx-auto mb-6" />
              <p className="text-[10px] text-stone-400 uppercase tracking-widest leading-relaxed">
                Designed with Elegance for Wedding Celebration
                <br />
                © 2026 {coupleDisplayName}
              </p>
            </div>
          </footer>
        </div>
      </main>

      {/* LIGHTBOX MODAL */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImg}
            alt="Preview"
            className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#3D0A14] text-[#E5D6C1] text-xs font-medium px-5 py-2.5 rounded-full shadow-2xl border border-[#C5A880]/40 transition-all duration-300 flex items-center gap-2 pointer-events-none ${
          toastMessage ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <CheckCircle2 className="w-4 h-4 text-[#C5A880]" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};

export default VelvetTheme;

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { WeddingInvitationData } from "@/types/wedding";
import {
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Copy,
  Disc3,
  Heart,
  HelpCircle,
  MailCheck,
  MapPin,
  Music,
  Navigation,
  Package,
  Play,
  Send,
  Share2,
  Sparkles,
  X,
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
    id: "w-1",
    senderName: "Dian Sastrowardoyo",
    timeAgo: "10 menit yang lalu",
    attendance: "Hadir",
    guestCount: "2 Tamu",
    message:
      "Barakallahu lakum wa baraka alaikum! Selamat menempuh hidup baru Versa & Mekar, semoga rukun senantiasa dan langgeng hingga kakek nenek.",
  },
  {
    id: "w-2",
    senderName: "Ir. Fachri Alamsyah",
    timeAgo: "1 jam yang lalu",
    attendance: "Hadir",
    guestCount: "2 Tamu",
    message:
      "Selamat untuk ananda Versa & Mekar beserta seluruh keluarga besar. InsyaAllah kami hadir mendoakan langsung di Masjid Raya Bogor.",
  },
  {
    id: "w-3",
    senderName: "Nabila & Kevin",
    timeAgo: "3 jam yang lalu",
    attendance: "Masih Ragu",
    guestCount: "1 Orang",
    message:
      "Happy wedding Mekar cantikk! Semoga acaranya lancar tanpa hambatan apapun. Doa terbaik untuk kalian berdua yaa!",
  },
  {
    id: "w-4",
    senderName: "Rian Hidayat & Rekan",
    timeAgo: "5 jam yang lalu",
    attendance: "Hadir",
    guestCount: "3 Tamu",
    message:
      "Selamat brother Versa! Semoga ikatan suci ini senantiasa dipenuhi keberkahan, sakinah, mawaddah, dan warahmah. Aamiin ya rabbal alamin.",
  },
];

const DEFAULT_GALLERY_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCIHh4QwGgY-xnXwLxYNkGrqcka5VqBlEuCzCrfVgaDlQO2lNivcX16waZHKtnwGr-9AJEZ4NKbI-TnajAzWccVeYvXd3f77H6DLUNncZye9sJ9YLTc4tV63t1POI0R1uEH0VBA7gVeNWcmvYC_ZoCfj_K8QHi74SQTAmXmv5uKVArnpwcWwIB_aQcsqDJ4pCL4wKR1KN3LU7J32fVBQlwJ9E0Py9Lt3SF3kWB2AsklDsDq1D1qvpKO",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCHi8JxVI80b6ElxWZf3hltztJcI680yiq7e6q5R2SdslMIprB5rnE9usXV4mqtx2kDLorkUMlkNh5pFMjvvxQinXd2s7Y6QaoIFVh6ZKUyyzRlPsBnXh-4P7fodCs-lOgE5dRJui2d8q8D0zc27RXKyDS3tDetY4kF_BtxXjqauU0Drc3F0GcWM0ZnQKvFbdBwHSHMyYVSyIMtJQeWJK59O2ZZfe9qJ6qdmqZds8JksxAbjeGRttQA",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB9IGXS3n8IqLCU93ZNfOW8ggR3ZSgwyxt4gbPfuspErQCbELJQqrB5KKB4uEKExqEToFS6OzRkcYF9syxKCItGN8HM9fJ7Oz6HS19-JSOo9q0StoRROYtCa0gP4m2kwVtNrWHS7ZJ06BjPoCe587MEhkUaVLckkKE45KPHB9RrTX7sD-SyJLswhPRKf3MSX2iYjWuMoc6fv9qL4OQtElI8QRhzc5i8hinr2UQnoiMKKhd1n6WBfidh",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuArtK0bJI6KP7cDOnPEOIHK1NSn-PKYyZLY89LMxvS-Fria13shKSFip_Bk14HLanpKTqkwIf0Nbh5SxkPS4TMcDKj6XLgeeX_gALkmR_4qgybL5VmjbO4hvahoqBdruZuBlIeKrzGSgKO0KSFFlAoD0el3_1wEb2D1GothxKiYFhU36mxxJ4Y3L3zDvQrDsbj_FgPhEghLeXvI4tzNGh8ryW8SyNHqkzAUrhIXB6SslpZvAgFkkEC",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCDNzdwFr5GHtY1cXCWBlLIkh_euFkW6UaSzClpjJgzwHjhy2Gjbb-guGZqCRLtZqiaoszwYiZLNDQIer5_XU3PN2bcEk7v9u90xnwjPWb_giBXDmLlbdOF13VrzWV55laqMtn0m8YM8LM6z6ENRkTOtcZXAr3CjtHbr_C7Cl1vnz9aaZXmDvAeqaU8pDhoPgvZAV6ttVG3WAcwa-440iqGOBeKFMLvNJmkMbCIjZ9W96Xs_5iqJH78",
];

export const BotanicalTheme: React.FC<ThemeProps> = ({
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
  const [rsvpAttendance, setRsvpAttendance] = useState<"Hadir" | "Masih Ragu" | "Tidak Hadir">("Hadir");
  const [rsvpCount, setRsvpCount] = useState("1 Orang");
  const [rsvpWishes, setRsvpWishes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Wishes State
  const [wishesList, setWishesList] = useState<LocalWish[]>(() => {
    if (data.wishes && data.wishes.length > 0) {
      return data.wishes.map((w, idx) => ({
        id: w.id || `wish-${idx}`,
        senderName: w.senderName,
        timeAgo: "Baru saja",
        attendance: "Hadir",
        guestCount: "1 Tamu",
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

  // Audio Reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const primaryEvent = data.eventSchedules?.[0];
  const secondaryEvent = data.eventSchedules?.[1];

  const coupleDisplayName = useMemo(() => {
    const groom = data.coupleInfo.groomNickname || data.coupleInfo.groomName?.split(" ")[0] || "Versa";
    const bride = data.coupleInfo.brideNickname || data.coupleInfo.brideName?.split(" ")[0] || "Mekar";
    return `${groom} & ${bride}`;
  }, [data.coupleInfo]);

  const groomFullName = data.coupleInfo.groomName || "Versa Pratama, S.T.";
  const brideFullName = data.coupleInfo.brideName || "Mekar Anggraini, S.Ds.";

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

  // Sync external music toggle events
  useEffect(() => {
    const handleToggle = () => toggleAudio();
    window.addEventListener("fasaro:music-toggle", handleToggle);
    return () => window.removeEventListener("fasaro:music-toggle", handleToggle);
  }, [toggleAudio]);

  // Open Invitation Action
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
        .catch(() => {
          // Auto-play might be blocked by browser policy until interaction
        });
    }

    const target = document.getElementById("spiritualSection");
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
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
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

  // RSVP Submission Handler
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = rsvpName.trim();
    const wishes = rsvpWishes.trim();

    if (!name || !wishes) return;
    setIsSubmitting(true);

    const newWishItem: LocalWish = {
      id: `wish-${Date.now()}`,
      senderName: name,
      timeAgo: "Baru saja",
      attendance: rsvpAttendance,
      guestCount: rsvpCount,
      message: wishes,
    };

    setWishesList((prev) => [newWishItem, ...prev]);

    // Send to public APIs in background
    try {
      await fetch("/api/public/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: data.id || data.slug,
          guestName: name,
          status: rsvpAttendance === "Hadir" ? "attending" : rsvpAttendance === "Tidak Hadir" ? "declined" : "tentative",
          attendeeCount: parseInt(rsvpCount, 10) || 1,
        }),
      });

      await fetch("/api/public/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: data.id || data.slug,
          senderName: name,
          message: wishes,
          reaction: "💐",
        }),
      });
    } catch {
      // Ignored for demo or offline fallback
    } finally {
      setIsSubmitting(false);
      setRsvpWishes("");
      showToast("Terima kasih atas doa restunya!");
    }
  };

  const stories = data.coupleInfo.stories && data.coupleInfo.stories.length > 0
    ? data.coupleInfo.stories
    : [
        {
          date: "2022",
          title: "Pertama Bertemu",
          story:
            "Dipertemukan di kampus saat berkolaborasi dalam proyek riset desain dan teknik bersama. Percakapan santai yang menumbuhkan rasa saling mengagumi.",
          imageUrl: null,
        },
        {
          date: "2025",
          title: "Lamaran Resmi",
          story:
            "Setelah melewati perjalanan panjang saling mendukung impian karier, Versa memantapkan niat dan melamar Mekar di hadapan kedua keluarga besar.",
          imageUrl: null,
        },
        {
          date: "2026",
          title: "Menuju Pelaminan",
          story:
            "Mengikat janji seumur hidup dalam ikatan suci pernikahan, melangkah berdua menuju masa depan yang penuh berkah dan cinta yang abadi.",
          imageUrl: null,
        },
      ];

  const galleryList = data.galleries && data.galleries.length > 0
    ? data.galleries.map((g) => g.imageUrl)
    : DEFAULT_GALLERY_IMAGES;

  const audioSource =
    data.musicUrl ||
    "https://cdn.jsdelivr.net/gh/roimgit/fasaro-assets@main/music/mellow-wedding-1.mp3";

  return (
    <div className="w-full bg-[#fcf9f4] text-[#1c1c19] font-sans-jakarta select-none relative overflow-x-hidden min-h-screen">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={audioSource} loop preload="auto" />

      {/* FLOATING AUDIO CONTROLLER */}
      {!isEmbedded && (
        <aside aria-label="Audio player" className="fixed top-6 right-5 z-50">
          <button
            onClick={toggleAudio}
            title="Putar / Heningkan Musik"
            className="w-12 h-12 rounded-full bg-white text-[#725b38] shadow-lg flex items-center justify-center transition-transform active:scale-95 duration-300 relative group cursor-pointer border border-[#d1c5b8]/30"
          >
            <div
              className={`w-10 h-10 rounded-full bg-[#ebe8e3] flex items-center justify-center transition-all ${
                isPlaying ? "animate-spin" : ""
              }`}
            >
              {isPlaying ? (
                <Disc3 className="w-5 h-5 text-[#725b38]" />
              ) : (
                <Music className="w-5 h-5 text-[#725b38]" />
              )}
            </div>
            <span
              className={`absolute -bottom-1 flex gap-0.5 items-end h-2.5 transition-opacity duration-300 ${
                isPlaying ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="w-0.5 h-2 bg-[#725b38] rounded-full animate-pulse" />
              <span className="w-0.5 h-3 bg-[#c5a880] rounded-full animate-bounce" />
              <span className="w-0.5 h-1.5 bg-[#725b38] rounded-full animate-pulse" />
            </span>
          </button>
        </aside>
      )}

      {/* 1. PARALLAX HERO / COVER SECTION */}
      <header
        id="home"
        className={`relative w-full overflow-hidden flex flex-col items-center justify-between py-12 px-6 bg-[#f6f3ee] transition-all duration-700 ${
          !isOpen && showCover ? "min-h-screen justify-center" : "min-h-[92vh]"
        }`}
      >
        {/* Ambient Botanical SVG Overlay Left Top */}
        <svg
          className="absolute -top-12 -left-12 w-48 h-48 opacity-25 text-[#c5a880] pointer-events-none"
          fill="currentColor"
          viewBox="0 0 200 200"
        >
          <path
            d="M42.7,-64.1C54.9,-58.5,64,-46.8,69.5,-33.5C75,-20.2,77,-5.2,74.3,9.1C71.6,23.5,64.2,37.2,53.8,47.4C43.5,57.7,30.2,64.5,15.7,68.4C1.3,72.4,-14.2,73.5,-28.4,69C-42.6,64.5,-55.4,54.4,-64.8,41.2C-74.2,28,-80.1,11.7,-78.9,-4.1C-77.7,-19.9,-69.3,-35.2,-57.6,-45.5C-45.8,-55.8,-30.7,-61,-16.1,-63.9C-1.5,-66.8,12.5,-67.4,30.5,-69.8L42.7,-64.1Z"
            transform="translate(100 100) scale(0.9)"
          />
        </svg>

        {/* Ambient Botanical SVG Overlay Right Bottom */}
        <svg
          className="absolute -bottom-16 -right-16 w-56 h-56 opacity-20 text-[#725b38] pointer-events-none"
          fill="currentColor"
          viewBox="0 0 200 200"
        >
          <path
            d="M49.3,-68.2C62.9,-60.1,72.3,-45.2,76.6,-29.4C80.8,-13.7,80,3,75.1,18.4C70.1,33.8,61.1,48,48.4,58.7C35.8,69.5,19.5,76.9,2.4,73.6C-14.7,70.3,-32.5,56.3,-45.3,42.8C-58,29.4,-65.7,16.5,-68,-0.3C-70.3,-17.1,-67.2,-37.9,-55.8,-50.2C-44.4,-62.5,-24.8,-66.4,-4.8,-60.2C15.2,-54.1,35.7,-76.3,49.3,-68.2Z"
            transform="translate(100 100) scale(0.9)"
          />
        </svg>

        {/* Top Badge Monogram */}
        <div className="flex flex-col items-center gap-2 z-10 text-center">
          <div className="w-10 h-10 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#725b38] mb-1 shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-[0.75rem] font-semibold tracking-[0.2em] text-[#725b38] uppercase">
            The Wedding Celebration Of
          </p>
          <h1 className="font-serif-playfair text-3xl sm:text-4xl text-[#1c1c19] tracking-tight mt-1 font-normal">
            {coupleDisplayName}
          </h1>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f0ede9] mt-1 border border-[#d1c5b8]/40">
            <Calendar className="w-3.5 h-3.5 text-[#725b38]" />
            <span className="text-xs text-[#4d463c] font-medium">
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
        </div>

        {/* Midground Hero Couple Portrait */}
        <div className="relative z-10 my-6 flex flex-col items-center">
          <div className="relative w-64 h-80 rounded-full overflow-hidden shadow-2xl bg-[#ebe8e3] p-2 flex items-center justify-center border-4 border-white/60">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src={
                  data.coupleInfo.desktopCoverImage ||
                  data.coupleInfo.groomPhoto ||
                  "/templates/botanical/cover.jpg"
                }
                alt={coupleDisplayName}
                fill
                priority
                className="object-cover rounded-full"
                sizes="(max-width: 768px) 256px, 320px"
              />
            </div>
          </div>
        </div>

        {/* Guest Personalization Card & CTA */}
        <div className="w-full max-w-sm z-10 flex flex-col items-center">
          <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-[#e5e2dd] text-center flex flex-col items-center gap-1.5 mb-4">
            <p className="text-xs text-[#4d463c]">Kepada Yth. Bapak/Ibu/Saudara/i</p>
            <p className="font-serif-playfair text-lg text-[#1c1c19] font-semibold">
              {guestName || "Tamu Undangan Terhormat"}
            </p>
            <p className="text-[0.7rem] font-semibold text-[#7f766a] tracking-wider uppercase">
              di Tempat
            </p>
          </div>
          <button
            onClick={handleOpenInvitation}
            className="w-full py-3.5 px-6 rounded-full bg-[#725b38] text-white text-xs font-semibold tracking-[0.18em] uppercase flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all duration-300 group cursor-pointer hover:bg-[#513d1d]"
          >
            <MailCheck className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Buka Undangan</span>
          </button>
        </div>
      </header>

      {/* 2. SPIRITUAL QUOTE SECTION */}
      <section
        id="spiritualSection"
        className="w-full px-6 py-12 flex flex-col items-center text-center bg-[#fcf9f4]"
      >
        <Sparkles className="w-7 h-7 text-[#c5a880] mb-3" />
        <p
          className="font-serif-playfair text-xl text-[#725b38] tracking-wide leading-loose mb-4 max-w-md"
          dir="rtl"
        >
          وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا
          وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً
        </p>
        <p className="text-[0.9375rem] text-[#4d463c] max-w-lg leading-relaxed italic mb-3">
          &quot;{data.coupleInfo.greetingMessage ||
            "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."}&quot;
        </p>
        <p className="text-xs text-[#725b38] uppercase font-bold tracking-widest">
          (QS. Ar-Rum: 21)
        </p>
      </section>

      {/* 3. BRIDE & GROOM PROFILE (MEMPELAI) */}
      <section
        id="couple"
        className="w-full px-5 py-12 bg-[#f6f3ee] flex flex-col items-center"
      >
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-[#725b38] tracking-widest uppercase mb-1">
            Mempelai Bahagia
          </p>
          <h2 className="font-serif-playfair text-2xl sm:text-3xl text-[#1c1c19] font-normal">
            Mempelai Pria &amp; Wanita
          </h2>
          <p className="text-xs text-[#4d463c] max-w-sm mt-1.5 leading-relaxed">
            Dengan memohon ridho dan rahmat Allah SWT, kami bermaksud melangsungkan
            pernikahan putra-putri kami:
          </p>
        </div>

        {/* Groom Profile Card */}
        <article className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-[#e5e2dd] flex flex-col items-center text-center mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-[#f0ede9] mb-4 shadow-inner relative border-2 border-[#d1c5b8]/50">
            <Image
              src={data.coupleInfo.groomPhoto || "/templates/botanical/groom.jpg"}
              alt={groomFullName}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <h3 className="font-serif-playfair text-xl text-[#1c1c19] font-semibold mb-1">
            {groomFullName}
          </h3>
          <p className="text-xs text-[#4d463c] mb-4 leading-relaxed">
            Putra pertama dari pasangan
            <br />
            <span className="font-semibold text-[#1c1c19]">{groomParents}</span>
          </p>
          {data.coupleInfo.groomInstagram && (
            <a
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f0ede9] text-[#4d463c] hover:text-[#725b38] text-xs font-medium transition-colors"
              href={`https://instagram.com/${data.coupleInfo.groomInstagram.replace("@", "")}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>@{data.coupleInfo.groomInstagram.replace("@", "")}</span>
            </a>
          )}
        </article>

        {/* Romantic Monogram Divider */}
        <div className="my-2 flex items-center justify-center w-12 h-12 rounded-full bg-[#f0ede9] text-[#725b38] font-serif-playfair text-2xl font-serif shadow-sm border border-[#d1c5b8]/40">
          &amp;
        </div>

        {/* Bride Profile Card */}
        <article className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-[#e5e2dd] flex flex-col items-center text-center mt-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-[#f0ede9] mb-4 shadow-inner relative border-2 border-[#d1c5b8]/50">
            <Image
              src={data.coupleInfo.bridePhoto || "/templates/botanical/bride.jpg"}
              alt={brideFullName}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <h3 className="font-serif-playfair text-xl text-[#1c1c19] font-semibold mb-1">
            {brideFullName}
          </h3>
          <p className="text-xs text-[#4d463c] mb-4 leading-relaxed">
            Putri kedua dari pasangan
            <br />
            <span className="font-semibold text-[#1c1c19]">{brideParents}</span>
          </p>
          {data.coupleInfo.brideInstagram && (
            <a
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f0ede9] text-[#4d463c] hover:text-[#725b38] text-xs font-medium transition-colors"
              href={`https://instagram.com/${data.coupleInfo.brideInstagram.replace("@", "")}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>@{data.coupleInfo.brideInstagram.replace("@", "")}</span>
            </a>
          )}
        </article>
      </section>

      {/* 4. COUNTDOWN & EVENTS (ACARA) */}
      <section id="event" className="w-full px-5 py-12 bg-[#fcf9f4] flex flex-col items-center">
        <div className="text-center mb-6">
          <p className="text-xs font-semibold text-[#725b38] tracking-widest uppercase mb-1">
            Save The Date
          </p>
          <h2 className="font-serif-playfair text-2xl sm:text-3xl text-[#1c1c19] font-normal">
            Hitung Mundur Hari Bahagia
          </h2>
        </div>

        {/* Live Timer */}
        <div className="grid grid-cols-4 gap-2 w-full max-w-sm mb-10 text-center">
          <div className="bg-[#f6f3ee] rounded-xl p-3 shadow-sm border border-[#e5e2dd]">
            <span className="font-serif-playfair text-xl font-bold text-[#725b38] block">
              {timeLeft.days}
            </span>
            <span className="text-[0.65rem] font-semibold text-[#7f766a] uppercase tracking-wider">
              Hari
            </span>
          </div>
          <div className="bg-[#f6f3ee] rounded-xl p-3 shadow-sm border border-[#e5e2dd]">
            <span className="font-serif-playfair text-xl font-bold text-[#725b38] block">
              {timeLeft.hours}
            </span>
            <span className="text-[0.65rem] font-semibold text-[#7f766a] uppercase tracking-wider">
              Jam
            </span>
          </div>
          <div className="bg-[#f6f3ee] rounded-xl p-3 shadow-sm border border-[#e5e2dd]">
            <span className="font-serif-playfair text-xl font-bold text-[#725b38] block">
              {timeLeft.minutes}
            </span>
            <span className="text-[0.65rem] font-semibold text-[#7f766a] uppercase tracking-wider">
              Menit
            </span>
          </div>
          <div className="bg-[#f6f3ee] rounded-xl p-3 shadow-sm border border-[#e5e2dd]">
            <span className="font-serif-playfair text-xl font-bold text-[#725b38] block">
              {timeLeft.seconds}
            </span>
            <span className="text-[0.65rem] font-semibold text-[#7f766a] uppercase tracking-wider">
              Detik
            </span>
          </div>
        </div>

        {/* Event Cards Container */}
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Card 1: Akad Nikah */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5e2dd] relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#725b38] mb-3">
              <Heart className="w-5 h-5 fill-[#725b38]" />
            </div>
            <span className="text-[0.7rem] font-bold text-[#725b38] uppercase tracking-wider block mb-1">
              Prosesi Sakral
            </span>
            <h3 className="font-serif-playfair text-xl text-[#1c1c19] font-semibold mb-2">
              {primaryEvent?.eventName || "Akad Nikah"}
            </h3>
            <p className="text-sm text-[#4d463c] mb-1">
              {primaryEvent?.date
                ? new Date(primaryEvent.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Minggu, 20 Desember 2026"}
            </p>
            <p className="text-xs font-semibold text-[#725b38] mb-4">
              Pukul {primaryEvent?.startTime || "08.00"} - {primaryEvent?.endTime || "10.00 WIB"}
            </p>
            <div className="bg-[#f6f3ee] rounded-xl p-4 mb-4 border border-[#e5e2dd]/60">
              <p className="text-sm font-semibold text-[#1c1c19]">
                {primaryEvent?.venueName || "Masjid Raya Bogor"}
              </p>
              <p className="text-xs text-[#4d463c] mt-0.5">
                {primaryEvent?.address ||
                  "Jl. Pajajaran No. 10, RT 01/RW 03, Baranangsiang, Kota Bogor"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                className="flex-1 py-2.5 px-4 rounded-full bg-[#725b38] text-white text-xs font-semibold uppercase text-center flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#513d1d] transition-colors"
                href={
                  primaryEvent?.mapsUrl ||
                  `https://maps.google.com/?q=${encodeURIComponent(
                    primaryEvent?.venueName || "Masjid Raya Bogor"
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Buka Google Maps</span>
              </a>
              <a
                className="py-2.5 px-4 rounded-full bg-[#f0ede9] text-[#4d463c] text-xs font-semibold uppercase text-center flex items-center justify-center gap-1.5 hover:text-[#725b38] transition-colors"
                href={generateGoogleCalendarUrl(
                  `${primaryEvent?.eventName || "Akad Nikah"} - ${coupleDisplayName}`,
                  primaryEvent?.date || "2026-12-20",
                  primaryEvent?.startTime || "08:00",
                  primaryEvent?.venueName || "Masjid Raya Bogor"
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Simpan Jadwal</span>
              </a>
            </div>
          </div>

          {/* Card 2: Resepsi Pernikahan */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5e2dd] relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#725b38] mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[0.7rem] font-bold text-[#725b38] uppercase tracking-wider block mb-1">
              Perayaan Cinta
            </span>
            <h3 className="font-serif-playfair text-xl text-[#1c1c19] font-semibold mb-2">
              {secondaryEvent?.eventName || "Resepsi Pernikahan"}
            </h3>
            <p className="text-sm text-[#4d463c] mb-1">
              {secondaryEvent?.date
                ? new Date(secondaryEvent.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Minggu, 20 Desember 2026"}
            </p>
            <p className="text-xs font-semibold text-[#725b38] mb-4">
              Pukul {secondaryEvent?.startTime || "11.00"} - {secondaryEvent?.endTime || "14.00 WIB"}
            </p>
            <div className="bg-[#f6f3ee] rounded-xl p-4 mb-4 border border-[#e5e2dd]/60">
              <p className="text-sm font-semibold text-[#1c1c19]">
                {secondaryEvent?.venueName || "Grand Ballroom Hotel Santika Bogor"}
              </p>
              <p className="text-xs text-[#4d463c] mt-0.5">
                {secondaryEvent?.address ||
                  "Jl. Raya Padjadjaran, Tegallega, Kota Bogor, Jawa Barat"}
              </p>
            </div>
            <div className="w-full">
              <div
                className="w-full h-44 bg-cover bg-center rounded-xl mb-3 shadow-inner border border-[#d1c5b8]/40"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAXYuMday_A_9PM82TuEmRc_AGDLOC3kv7K8WMW72USU1INZmW_cwOUjkNsgORcfW6QtoEDzNEcttggFHmBKlITQxS--bmQ2rO_S1WQuqbPbaXnL7p3qO5Ir_NJ2Csn8XZ_I8AV0icgx51CoQ-UOtTJ0D3L7krKT9npZiRiE2aZkSsNFLxY37gDm8ndscE6Eqq4kNC_EcpEfjDiLdDeaA1x8qEsbC5AWUAKUWEx09GcX6grdG9swMSm')",
                }}
              />
              <a
                className="w-full py-2.5 px-4 rounded-full bg-[#725b38] text-white text-xs font-semibold uppercase text-center flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#513d1d] transition-colors"
                href={
                  secondaryEvent?.mapsUrl ||
                  `https://maps.google.com/?q=${encodeURIComponent(
                    secondaryEvent?.venueName || "Grand Ballroom Hotel Santika Bogor"
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Petunjuk Arah Lokasi</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LOVE STORY TIMELINE */}
      <section className="w-full px-5 py-12 bg-[#f6f3ee] flex flex-col items-center">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-[#725b38] tracking-widest uppercase mb-1">
            Kisah Kasih
          </p>
          <h2 className="font-serif-playfair text-2xl sm:text-3xl text-[#1c1c19] font-normal">
            Our Love Journey
          </h2>
        </div>

        <div className="relative w-full max-w-md pl-6 flex flex-col gap-6">
          <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-[#c5a880]/40" />

          {stories.map((item, idx) => (
            <div key={`story-${idx}`} className="relative flex items-start gap-4">
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#725b38] text-white flex items-center justify-center text-xs shadow-sm">
                <Heart className="w-2.5 h-2.5 fill-white" />
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e5e2dd] w-full">
                <span className="text-[0.7rem] font-bold text-[#725b38] uppercase tracking-wider">
                  {item.date}
                </span>
                <h4 className="font-serif-playfair text-base font-semibold text-[#1c1c19] mt-0.5 mb-1">
                  {item.title}
                </h4>
                {item.imageUrl && (
                  <div className="relative w-full h-36 rounded-lg overflow-hidden my-2 shadow-inner">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                )}
                <p className="text-xs text-[#4d463c] leading-relaxed">{item.story}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PHOTO GALLERY & PREWEDDING VIDEO */}
      <section id="gallery" className="w-full px-5 py-12 bg-[#fcf9f4] flex flex-col items-center">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-[#725b38] tracking-widest uppercase mb-1">
            Dokumentasi
          </p>
          <h2 className="font-serif-playfair text-2xl sm:text-3xl text-[#1c1c19] font-normal">
            Galeri Prewedding
          </h2>
        </div>

        {/* Masonry-like Photo Cards */}
        <div className="w-full max-w-md grid grid-cols-2 gap-3 mb-6">
          {galleryList.slice(0, 5).map((imgUrl, idx) => {
            const isWide = idx === 2;
            return (
              <div
                key={`gal-${idx}`}
                onClick={() => setLightboxImg(imgUrl)}
                className={`${
                  isWide ? "col-span-2 h-56" : "h-48"
                } rounded-xl overflow-hidden shadow-sm bg-[#f0ede9] relative cursor-pointer group border border-[#e5e2dd]`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`Prewedding ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>

        {/* Cinematic Video Player / Mockup */}
        <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-sm border border-[#e5e2dd] flex flex-col items-center">
          <p className="text-[0.7rem] font-bold text-[#725b38] uppercase tracking-wider mb-2">
            Cinematic Teaser
          </p>
          {data.youtubeVideoUrl ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow">
              <iframe
                className="w-full h-full"
                src={data.youtubeVideoUrl.replace("watch?v=", "embed/")}
                title="Wedding Cinematic Teaser"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#ebe8e3] flex items-center justify-center group cursor-pointer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxDmdxe_YyPxWNPMOJBBquw0i4HcOyNUEoK73_ldQBjh6iTLhbD3VjvmSAx5WpE3fmoAq2aZ7Lf_AAYRjzoBCtkx4Zp_bsgHg_2iVGFjruGLmKibVHBovgu5u-ExB4qlLHfBBhdcRFodVcCNjAxuFhIX_ae-RAtLDFwpekdlSm25rtHApj549ltZtDSsmZhX1ULSJ2uxuXXnFDtsXMmIlHyD8BL7jM2N93hoRk1HonDKidupVpw6Xi"
                alt="Cinematic still"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px] flex items-center justify-center transition-all group-hover:bg-black/15">
                <div className="w-14 h-14 rounded-full bg-[#725b38] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
              </div>
            </div>
          )}
          <p className="text-xs text-[#4d463c] mt-2 text-center">
            Video teaser perjalanan cinta {coupleDisplayName}
          </p>
        </div>
      </section>

      {/* 7. DIGITAL GIFT & CASHLESS ANGPAO */}
      <section id="gift" className="w-full px-5 py-12 bg-[#f6f3ee] flex flex-col items-center">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-[#725b38] tracking-widest uppercase mb-1">
            Tanda Kasih
          </p>
          <h2 className="font-serif-playfair text-2xl sm:text-3xl text-[#1c1c19] font-normal">
            Kado Digital &amp; Angpao
          </h2>
          <p className="text-xs text-[#4d463c] max-w-sm mt-1.5 leading-relaxed">
            Doa restu Anda adalah kado terindah bagi kami. Namun jika ingin memberikan tanda
            kasih secara digital, Anda dapat melalui rekening berikut:
          </p>
        </div>

        <div className="w-full max-w-md flex flex-col gap-4">
          {data.bankAccounts && data.bankAccounts.length > 0 ? (
            data.bankAccounts.map((acc, idx) => (
              <div
                key={`bank-${idx}`}
                className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e2dd] flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif-playfair text-lg font-bold text-[#1c1c19]">
                    {acc.bankName}
                  </span>
                  <Package className="w-5 h-5 text-[#725b38]" />
                </div>
                <p className="text-xs text-[#4d463c]">Nomor Rekening:</p>
                <p className="font-serif-playfair text-lg font-semibold text-[#725b38] tracking-wider mb-1">
                  {acc.accountNumber}
                </p>
                <p className="text-xs text-[#4d463c] mb-4">a.n {acc.accountHolder}</p>
                <button
                  onClick={() => copyToClipboard(acc.accountNumber, `Nomor Rekening ${acc.bankName}`)}
                  className="w-full py-2 px-4 rounded-full bg-[#f0ede9] text-[#1c1c19] text-xs font-semibold uppercase flex items-center justify-center gap-1.5 active:bg-[#725b38] active:text-white transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Nomor Rekening</span>
                </button>
              </div>
            ))
          ) : (
            <>
              {/* Default BCA Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e2dd] flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif-playfair text-lg font-bold text-[#1c1c19]">BCA</span>
                  <Package className="w-5 h-5 text-[#725b38]" />
                </div>
                <p className="text-xs text-[#4d463c]">Nomor Rekening:</p>
                <p className="font-serif-playfair text-lg font-semibold text-[#725b38] tracking-wider mb-1">
                  8020192831
                </p>
                <p className="text-xs text-[#4d463c] mb-4">a.n {groomFullName}</p>
                <button
                  onClick={() => copyToClipboard("8020192831", "Nomor Rekening BCA")}
                  className="w-full py-2 px-4 rounded-full bg-[#f0ede9] text-[#1c1c19] text-xs font-semibold uppercase flex items-center justify-center gap-1.5 active:bg-[#725b38] active:text-white transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Nomor Rekening</span>
                </button>
              </div>

              {/* Default Mandiri Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e2dd] flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif-playfair text-lg font-bold text-[#1c1c19]">
                    Bank Mandiri
                  </span>
                  <Package className="w-5 h-5 text-[#725b38]" />
                </div>
                <p className="text-xs text-[#4d463c]">Nomor Rekening:</p>
                <p className="font-serif-playfair text-lg font-semibold text-[#725b38] tracking-wider mb-1">
                  133009281920
                </p>
                <p className="text-xs text-[#4d463c] mb-4">a.n {brideFullName}</p>
                <button
                  onClick={() => copyToClipboard("133009281920", "Nomor Rekening Mandiri")}
                  className="w-full py-2 px-4 rounded-full bg-[#f0ede9] text-[#1c1c19] text-xs font-semibold uppercase flex items-center justify-center gap-1.5 active:bg-[#725b38] active:text-white transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Nomor Rekening</span>
                </button>
              </div>
            </>
          )}

          {/* Physical Gift Delivery Address Accordion */}
          <details className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e2dd] group">
            <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-semibold text-[#1c1c19]">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#725b38]" />
                <span>Kirim Kado Fisik</span>
              </div>
              <span className="text-xs text-[#7f766a] transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div className="pt-4 text-left">
              <p className="text-xs text-[#4d463c] mb-1">Alamat Penerima:</p>
              <p className="text-sm font-semibold text-[#1c1c19]">
                Kediaman Mempelai ({coupleDisplayName})
              </p>
              <p className="text-xs text-[#4d463c] mb-3 leading-relaxed">
                Cluster Magnolia Blok B3 No. 12, Jl. Pajajaran Indah, Bogor Timur, Kota Bogor, 16143
                (No. HP: 0812-8920-1122)
              </p>
              <button
                onClick={() =>
                  copyToClipboard(
                    "Cluster Magnolia Blok B3 No. 12, Jl. Pajajaran Indah, Bogor Timur, Kota Bogor, 16143",
                    "Alamat Pengiriman"
                  )
                }
                className="w-full py-2 px-4 rounded-full bg-[#f0ede9] text-[#1c1c19] text-xs font-semibold uppercase flex items-center justify-center gap-1.5 active:bg-[#725b38] active:text-white transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Alamat Lengkap</span>
              </button>
            </div>
          </details>
        </div>
      </section>

      {/* 8. RSVP & WISHES WALL (UCAPAN & DOA) */}
      <section id="wishes" className="w-full px-5 py-12 bg-[#fcf9f4] flex flex-col items-center">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-[#725b38] tracking-widest uppercase mb-1">
            Konfirmasi Kehadiran
          </p>
          <h2 className="font-serif-playfair text-2xl sm:text-3xl text-[#1c1c19] font-normal">
            RSVP &amp; Ucapan Doa
          </h2>
          <p className="text-xs text-[#4d463c] max-w-sm mt-1.5 leading-relaxed">
            Kehadiran dan doa restu Anda merupakan kebahagiaan terbesar bagi kami.
          </p>
        </div>

        {/* RSVP Form Card */}
        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-[#e5e2dd] mb-10">
          <form onSubmit={handleRsvpSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.7rem] font-semibold text-[#7f766a] uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                placeholder="Contoh: Bpk. Rian Hidayat"
                className="w-full px-4 py-2.5 rounded-xl bg-[#f6f3ee] text-[#1c1c19] text-sm border border-[#e5e2dd] focus:outline-none focus:bg-[#f0ede9] focus:border-[#725b38]"
              />
            </div>

            <div>
              <label className="block text-[0.7rem] font-semibold text-[#7f766a] uppercase tracking-wider mb-1.5">
                Konfirmasi Kehadiran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Hadir", "Masih Ragu", "Tidak Hadir"] as const).map((status) => {
                  const isSelected = rsvpAttendance === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setRsvpAttendance(status)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center text-xs font-semibold transition-all border ${
                        isSelected
                          ? "bg-[#725b38] text-white border-[#725b38] shadow-sm"
                          : "bg-[#f6f3ee] text-[#4d463c] border-[#e5e2dd] hover:bg-[#f0ede9]"
                      }`}
                    >
                      {status === "Hadir" && "Hadir"}
                      {status === "Masih Ragu" && "Ragu"}
                      {status === "Tidak Hadir" && "Maaf, Tidak"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[0.7rem] font-semibold text-[#7f766a] uppercase tracking-wider mb-1.5">
                Jumlah Tamu
              </label>
              <select
                value={rsvpCount}
                onChange={(e) => setRsvpCount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#f6f3ee] text-[#1c1c19] text-sm border border-[#e5e2dd] focus:outline-none focus:bg-[#f0ede9]"
              >
                <option value="1 Orang">1 Orang</option>
                <option value="2 Orang">2 Orang</option>
                <option value="3 Orang">3 Orang</option>
              </select>
            </div>

            <div>
              <label className="block text-[0.7rem] font-semibold text-[#7f766a] uppercase tracking-wider mb-1.5">
                Ucapan &amp; Doa Restu
              </label>
              <textarea
                required
                rows={3}
                value={rsvpWishes}
                onChange={(e) => setRsvpWishes(e.target.value)}
                placeholder="Tuliskan ucapan selamat dan doa untuk kedua mempelai..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#f6f3ee] text-[#1c1c19] text-sm border border-[#e5e2dd] focus:outline-none focus:bg-[#f0ede9] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-[#725b38] text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all hover:bg-[#513d1d] cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Mengirim..." : "Kirim Ucapan & Konfirmasi"}</span>
            </button>
          </form>
        </div>

        {/* Live Wishes Feed */}
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="font-serif-playfair text-base font-semibold text-[#1c1c19]">
              Untaian Doa
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ebe8e3] text-xs text-[#725b38] font-bold">
              {wishesList.length} Ucapan
            </span>
          </div>

          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1 no-scrollbar">
            {wishesList.map((wish) => (
              <div
                key={wish.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-[#e5e2dd] flex flex-col gap-1 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1c1c19]">{wish.senderName}</span>
                  <span className="text-[0.7rem] text-[#7f766a]">{wish.timeAgo}</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    wish.attendance === "Hadir"
                      ? "text-[#725b38]"
                      : wish.attendance === "Masih Ragu"
                      ? "text-[#7f766a]"
                      : "text-rose-600"
                  }`}
                >
                  {wish.attendance === "Hadir" && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {wish.attendance === "Masih Ragu" && <HelpCircle className="w-3.5 h-3.5" />}
                  {wish.attendance} ({wish.guestCount})
                </span>
                <p className="text-xs text-[#4d463c] mt-1 leading-relaxed">{wish.message}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FOOTER & CLOSING */}
      <footer className="w-full px-6 py-12 bg-[#f0ede9] text-center flex flex-col items-center border-t border-[#e5e2dd]">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#725b38] mb-4 shadow-sm border border-[#d1c5b8]/30">
          <Heart className="w-5 h-5 fill-[#725b38]" />
        </div>
        <p className="text-sm text-[#4d463c] max-w-md leading-relaxed mb-6">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i
          berkenan hadir untuk memberikan doa restu kepada kedua mempelai.
        </p>
        <p className="text-xs text-[#7f766a] mb-1">Kami yang berbahagia,</p>
        <h3 className="font-serif-playfair text-2xl text-[#1c1c19] font-semibold mb-6">
          {coupleDisplayName}
        </h3>

        <div className="flex gap-3 mb-8">
          <a
            className="py-2.5 px-5 rounded-full bg-white text-[#1c1c19] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm hover:text-[#725b38] transition-colors border border-[#d1c5b8]/40"
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `Undangan Pernikahan ${coupleDisplayName}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Share2 className="w-4 h-4" />
            <span>Bagikan Undangan</span>
          </a>
        </div>

        <p className="text-[0.65rem] text-[#7f766a] uppercase tracking-widest">
          Designed with love by Fasaro Wedding © 2026
        </p>
      </footer>

      {/* LIGHTBOX MODAL PREVIEW */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImg}
            alt="Preview Prewedding"
            className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
          />
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white text-[#1c1c19] flex items-center justify-center hover:bg-[#f0ede9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1c1c19] text-white py-2.5 px-5 rounded-full text-xs font-medium shadow-xl transition-all duration-300 z-50 flex items-center gap-2 pointer-events-none ${
          toastMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};

export default BotanicalTheme;

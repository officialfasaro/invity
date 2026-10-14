import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { WeddingInvitationData, EventScheduleItem, BankAccountItem } from "@/types/wedding";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  QrCode,
  Volume2,
  VolumeX,
  Play,
  X,
  Mail,
  ChevronDown,
  Tv,
  Send,
  Camera,
  Navigation,
} from "lucide-react";
import GoogleMapEmbed from "../shared/GoogleMapEmbed";
import { isFeatureAvailable } from "@/utils/featureFlags";

interface GothicThemeProps {
  data: WeddingInvitationData;
  guestName?: string;
  showCover?: boolean;
  isEmbedded?: boolean;
}

interface LocalWish {
  id: string;
  senderName: string;
  timeAgo: string;
  attendance: "Hadir" | "Tidak Hadir";
  guestCount?: string;
  message: string;
}

const DEFAULT_GOTHIC_WISHES: LocalWish[] = [
  {
    id: "gw-1",
    senderName: "Bima Satria",
    timeAgo: "Baru saja",
    attendance: "Hadir",
    guestCount: "2 Orang",
    message: "Selamat menempuh hidup baru Putri dan Andika! Semoga senantiasa sakinah, mawaddah, warahmah.",
  },
  {
    id: "gw-2",
    senderName: "dr. Nabila Hapsari",
    timeAgo: "1 jam lalu",
    attendance: "Hadir",
    guestCount: "1 Orang",
    message: "Semoga pernikahan kalian diberkahi dengan limpahan kebahagiaan tak berujung. Congrats both!",
  },
  {
    id: "gw-3",
    senderName: "Farhan & Istri",
    timeAgo: "3 jam lalu",
    attendance: "Tidak Hadir",
    guestCount: "1 Orang",
    message: "Mohon maaf berhalangan hadir dari Surabaya, doa tulus kami menyertai langkah indah kalian.",
  },
];

const DEFAULT_GOTHIC_STORIES = [
  {
    yearTag: "2022 • FIRST SIGHT",
    title: "Pertemuan Pertama",
    story:
      "Takdir mempertemukan kami di sebuah pameran seni di Jakarta. Sebuah percakapan sederhana tentang karya monokrom membuka jalan bagi kisah panjang kami berdua.",
  },
  {
    yearTag: "2024 • THE JOURNEY",
    title: "Melewati Ribuan Cerita",
    story:
      "Dua tahun penuh pembelajaran, saling melengkapi mimpi masing-masing, dan memahami bahwa cinta adalah komitmen untuk terus tumbuh bersama dalam setiap musim.",
  },
  {
    yearTag: "2026 • THE PROPOSAL",
    title: "Sebuah Janji Suci",
    story:
      "Di bawah temaram lentera kota tua, Andika melingkarkan cincin komitmen dan Putri menjawab dengan senyuman penuh keyakinan untuk menyongsong selamanya.",
  },
];

export const GothicTheme: React.FC<GothicThemeProps> = ({
  data,
  guestName,
  showCover = true,
  isEmbedded = false,
}) => {
  // State
  const [isOpen, setIsOpen] = useState(!showCover);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [rsvpName, setRsvpName] = useState(guestName || "");
  const [rsvpAttendance, setRsvpAttendance] = useState<"Hadir" | "Tidak Hadir">("Hadir");
  const [rsvpCount, setRsvpCount] = useState("2");
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wishes List
  const [wishesList, setWishesList] = useState<LocalWish[]>(() => {
    if (data.wishes && data.wishes.length > 0) {
      return data.wishes.map((w, idx) => ({
        id: w.id || `wish-${idx}`,
        senderName: w.senderName,
        timeAgo: "Baru saja",
        attendance: "Hadir",
        guestCount: "1 Orang",
        message: w.message,
      }));
    }
    return DEFAULT_GOTHIC_WISHES;
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
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Names & Monogram
  const groomFullName = data.coupleInfo.groomName || "Putra Andika Pratama";
  const groomNick =
    data.coupleInfo.groomNickname || data.coupleInfo.groomName?.split(" ")[0] || "Andika";
  const brideFullName = data.coupleInfo.brideName || "Putri Cantika Sari";
  const brideNick =
    data.coupleInfo.brideNickname || data.coupleInfo.brideName?.split(" ")[0] || "Putri";
  const coupleDisplayName = `${brideNick} & ${groomNick}`;
  const coupleMonogram = `${brideNick[0] || "P"}&${groomNick[0] || "A"}`;

  const groomParents = useMemo(() => {
    if (data.coupleInfo.groomFather && data.coupleInfo.groomMother) {
      return `Bpk. ${data.coupleInfo.groomFather} & Ibu ${data.coupleInfo.groomMother}`;
    }
    return "Bpk. Deni Bastian & Ibu Aisha Dania";
  }, [data.coupleInfo.groomFather, data.coupleInfo.groomMother]);

  const brideParents = useMemo(() => {
    if (data.coupleInfo.brideFather && data.coupleInfo.brideMother) {
      return `Bpk. ${data.coupleInfo.brideFather} & Ibu ${data.coupleInfo.brideMother}`;
    }
    return "Bpk. Abdul Rozak & Ibu Adelia Marni";
  }, [data.coupleInfo.brideFather, data.coupleInfo.brideMother]);

  // Images
  const leftPanelImage = useMemo(() => {
    return (
      data.coupleInfo.desktopCoverImage ||
      data.galleries?.[0]?.imageUrl ||
      "/templates/gothic/desktop-left.jpg"
    );
  }, [data.coupleInfo.desktopCoverImage, data.galleries]);

  const coverImage = useMemo(() => {
    return (
      data.coupleInfo.backgroundImage ||
      data.coupleInfo.desktopCoverImage ||
      "/templates/gothic/cover.jpg"
    );
  }, [data.coupleInfo.backgroundImage, data.coupleInfo.desktopCoverImage]);

  const bridePhoto = useMemo(() => {
    return data.coupleInfo.bridePhoto || "/templates/gothic/bride.jpg";
  }, [data.coupleInfo.bridePhoto]);

  const groomPhoto = useMemo(() => {
    return data.coupleInfo.groomPhoto || "/templates/gothic/groom.jpg";
  }, [data.coupleInfo.groomPhoto]);

  const polaroidPhoto = useMemo(() => {
    return data.galleries?.[1]?.imageUrl || "/templates/gothic/polaroid.jpg";
  }, [data.galleries]);

  const closingPhoto = useMemo(() => {
    return (
      data.galleries?.[2]?.imageUrl ||
      data.coupleInfo.desktopCoverImage ||
      "/templates/gothic/closing.jpg"
    );
  }, [data.galleries, data.coupleInfo.desktopCoverImage]);

  // Event Schedules
  const schedules: EventScheduleItem[] = useMemo(() => {
    if (data.eventSchedules && data.eventSchedules.length > 0) {
      return data.eventSchedules;
    }
    return [
      {
        eventName: "Akad Nikah",
        date: "2027-12-28T08:00:00+07:00",
        startTime: "08:00 WIB",
        venueName: "Menara 165, Jakarta Selatan",
        address: "Jl. TB Simatupang Kav. 1, Cilandak, Jakarta Selatan",
        mapsUrl: "https://maps.google.com/?q=Menara+165+Jakarta",
      },
      {
        eventName: "Resepsi Pernikahan",
        date: "2027-12-28T11:00:00+07:00",
        startTime: "11:00",
        endTime: "14:00 WIB",
        venueName: "Grand Ballroom Menara 165",
        address: "Jl. TB Simatupang Kav. 1, Cilandak, Jakarta Selatan",
        mapsUrl: "https://maps.google.com/?q=Menara+165+Jakarta",
      },
    ];
  }, [data.eventSchedules]);

  // Primary event date & venue for header & chips
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
        return "Sabtu, 24 Oktober 2026";
      }
    }
    return "Sabtu, 24 Oktober 2026";
  }, [schedules]);

  const primaryEventVenue = useMemo(() => {
    return schedules[0]?.venueName || "Menara 165 - Granada Ballroom";
  }, [schedules]);

  // Primary event date for countdown
  const targetDateTimestamp = useMemo(() => {
    const firstDate = schedules[0]?.date;
    if (firstDate) {
      const parsed = new Date(firstDate).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    return new Date("2027-12-28T08:00:00+07:00").getTime();
  }, [schedules]);

  // Countdown timer
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

  // Gallery items
  const galleryItems = useMemo(() => {
    if (data.galleries && data.galleries.length >= 4) {
      return data.galleries.slice(0, 4);
    }
    return [
      { id: "g1", imageUrl: "/templates/gothic/gallery-1.jpg", sortOrder: 0 },
      { id: "g2", imageUrl: "/templates/gothic/gallery-2.jpg", sortOrder: 1 },
      { id: "g3", imageUrl: "/templates/gothic/gallery-3.jpg", sortOrder: 2 },
      { id: "g4", imageUrl: "/templates/gothic/gallery-4.jpg", sortOrder: 3 },
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
        bankName: "Bank BCA",
        accountNumber: "123123123",
        accountHolder: "Putri Cantika Sari",
      },
      {
        id: "ba-2",
        bankName: "Bank BRI",
        accountNumber: "321321321",
        accountHolder: "Putra Andika Pratama",
      },
    ];
  }, [data.bankAccounts]);

  const giftAddress =
    data.coupleInfo.giftAddress ||
    "Jl. Cilandak Barat No. 18, Cilandak, Jakarta Selatan, DKI Jakarta 12430 (Up. Putri Cantika)";

  // Toast feedback helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  // Copy to clipboard helper
  const handleCopy = useCallback(
    (text: string, label: string) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(() => showToast(`${label} tersalin!`))
          .catch(() => showToast("Gagal menyalin"));
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          showToast(`${label} tersalin!`);
        } catch {
          showToast("Gagal menyalin");
        }
        document.body.removeChild(textArea);
      }
    },
    [showToast]
  );

  // Audio Toggle
  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      showToast("Musik dijeda");
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          showToast("Musik diputar");
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [isPlaying, showToast]);

  // Open Invitation Action
  const handleOpenInvitation = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = "auto";

    // Play music
    if (isFeatureAvailable("music", { data, forcedThemeId: "gothic" }) && audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay blocked, keep paused
          setIsPlaying(false);
        });
    }
  }, [data]);

  // Submit RSVP
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim() || !rsvpMessage.trim()) return;

    setIsSubmitting(true);
    const newEntry: LocalWish = {
      id: `w-${Date.now()}`,
      senderName: rsvpName.trim(),
      attendance: rsvpAttendance,
      guestCount: `${rsvpCount} Orang`,
      message: rsvpMessage.trim(),
      timeAgo: "Baru saja",
    };

    // Optimistically update wish list
    setWishesList((prev) => [newEntry, ...prev]);

    // Send to public API if available
    try {
      await fetch(`/api/public/invitations/${data.slug || data.id}/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: rsvpName.trim(),
          message: rsvpMessage.trim(),
          attendance: rsvpAttendance,
          guestCount: parseInt(rsvpCount, 10) || 1,
        }),
      });
    } catch {
      // Graceful offline fallback
    }

    setIsSubmitting(false);
    setRsvpMessage("");
    showToast("Ucapan berhasil terkirim!");
  };

  return (
    <div className="min-h-screen w-full bg-[#131313] text-[#E5E2E1] font-sans antialiased selection:bg-[#700B0B] selection:text-[#FFFFFF]">
      {/* Hidden Audio Element */}
      {isFeatureAvailable("music", { data, forcedThemeId: "gothic" }) && (
        <audio
          ref={audioRef}
          src={data.musicUrl || "/music/wedding-romance.mp3"}
          loop
          preload="auto"
        />
      )}

      {/* Toast Notification */}
      <div
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-[#700B0B] text-[#FFFFFF] px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase shadow-2xl flex items-center gap-2 transition-all duration-300 pointer-events-none ${
          toastMessage ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95"
        }`}
      >
        <CheckCircle2 className="w-4 h-4 text-[#FFB4AB]" />
        <span>{toastMessage}</span>
      </div>

      {/* Floating Vinyl Music Disc Widget (Fixed Bottom Right) */}
      {isFeatureAvailable("music", { data, forcedThemeId: "gothic" }) && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#201F1F]/95 backdrop-blur-md p-1.5 pr-4 rounded-full border border-[#353534] shadow-2xl pointer-events-auto"
        >
          <button
            onClick={toggleAudio}
            aria-label={isPlaying ? "Jeda Musik" : "Putar Musik"}
            className="relative w-12 h-12 rounded-full bg-[#0E0E0E] border-2 border-[#58413F] hover:border-[#FFB4AB] flex items-center justify-center overflow-hidden shadow-md group transition-colors cursor-pointer"
          >
            <div
              className={`w-8 h-8 rounded-full bg-[#201F1F] flex items-center justify-center ${
                isPlaying ? "animate-vinyl-spin" : ""
              }`}
              style={{ animationPlayState: isPlaying ? "running" : "paused" }}
            >
              {/* Center Vinyl Label */}
              <div className="w-3 h-3 rounded-full bg-[#700B0B] flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#0E0E0E]" />
              </div>
            </div>
          </button>

          <span className="hidden sm:inline-block font-sans-space text-[10px] text-[#E5E2E1] tracking-wider uppercase font-medium">
            {isPlaying ? "Playing: Romantic Melody" : "Music Paused"}
          </span>

          {/* Glowing Equalizer Bars */}
          <div
            onClick={toggleAudio}
            className="flex items-end gap-0.5 h-4 px-1 cursor-pointer"
            title={isPlaying ? "Klik untuk jeda" : "Klik untuk putar"}
          >
            <span
              className={`w-0.5 rounded-full transition-all ${
                isPlaying ? "bg-[#00B894] h-3 animate-pulse" : "bg-[#58413F] h-1.5 opacity-40"
              }`}
            />
            <span
              className={`w-0.5 rounded-full transition-all ${
                isPlaying ? "bg-[#00B894] h-4 animate-pulse delay-75" : "bg-[#58413F] h-2.5 opacity-40"
              }`}
            />
            <span
              className={`w-0.5 rounded-full transition-all ${
                isPlaying ? "bg-[#00B894] h-2.5 animate-pulse delay-150" : "bg-[#58413F] h-1 opacity-40"
              }`}
            />
            <span
              className={`w-0.5 rounded-full transition-all ${
                isPlaying ? "bg-[#00B894] h-3.5 animate-pulse delay-200" : "bg-[#58413F] h-2 opacity-40"
              }`}
            />
          </div>
        </div>
      )}

      {/* Main Container: Split-Screen Desktop Architecture (60/40) */}
      <div className="min-h-screen flex flex-col lg:flex-row w-full max-w-[1680px] mx-auto shadow-2xl relative bg-[#131313] theme-wrapper no-scrollbar">
        {/* ========================================================================= */}
        {/* DESKTOP LEFT PANEL (Sticky 58-60%, 100vh)                                */}
        {/* ========================================================================= */}
        {!isEmbedded && (
          <aside className="hidden lg:flex lg:w-[58%] xl:w-[60%] h-screen sticky top-0 overflow-hidden flex-col justify-between p-12 xl:p-16 text-[#E5E2E1] z-10 select-none bg-[#0E0E0E]">
            {/* Radial & Linear Dark Vignettes */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0E0E0E]/60 to-[#0E0E0E] z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-[#0E0E0E]/40 to-transparent z-10 pointer-events-none" />

            {/* Grayscale Chiaroscuro Pre-Wedding Image */}
            <img
              src={leftPanelImage}
              alt={`${coupleDisplayName} Editorial`}
              className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125 brightness-75 scale-105 transition-transform duration-1000 ease-out hover:scale-100 z-0"
            />

            {/* Top Branding on Left Panel */}
            <div className="relative z-20 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-[1px] bg-[#FFB4AB]/60" />
                <span className="font-sans-space text-xs uppercase tracking-[0.3em] font-medium text-[#E5E2E1]/90">
                  Official Wedding Invitation
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border border-[#FFB4AB]/40 flex items-center justify-center font-serif-bodoni text-sm tracking-widest text-[#FFB4AB] backdrop-blur-sm bg-black/20">
                {coupleMonogram}
              </div>
            </div>

            {/* Center / Lower Editorial Title on Left Panel */}
            <div className="relative z-20 my-auto py-12 max-w-xl">
              <span className="font-sans-space text-xs uppercase tracking-[0.35em] text-[#FFB4AB] font-semibold mb-3 block">
                The Wedding Celebration Of
              </span>
              <h2 className="font-serif-bodoni text-5xl xl:text-6xl text-[#E5E2E1] font-normal tracking-tight mb-4">
                {coupleDisplayName}
              </h2>
              <div className="h-[1px] w-20 bg-[#FFB4AB]/60 mb-4" />
              <p className="font-serif italic text-lg xl:text-xl text-[#E5E2E1]/90 font-light leading-relaxed mb-6">
                &quot;Two souls with but a single thought, two hearts that beat as one.&quot;
              </p>

              {/* Wedding Date & Venue Chip */}
              <div className="inline-flex items-center gap-5 bg-[#201F1F]/70 backdrop-blur-md border border-white/15 px-5 py-3 rounded-full text-[#E5E2E1]/90 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FFB4AB]" />
                  <span className="font-medium tracking-wide">{primaryEventDateStr}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-[#E5E2E1]/40" />
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FFB4AB]" />
                  <span className="text-[#E5E2E1]/80">{primaryEventVenue}</span>
                </div>
              </div>
            </div>

            {/* Bottom Panel Note on Left Panel */}
            <div className="relative z-20 flex justify-between items-center border-t border-[#353534]/60 pt-4 text-xs text-[#B7B5AF] font-sans-space tracking-widest uppercase">
              <span>Gothic Tema 01</span>
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
          } bg-[#131313] flex flex-col justify-start items-center relative ${
            isOpen ? "overflow-y-auto lg:h-screen" : "overflow-hidden h-screen"
          } no-scrollbar shadow-inner`}
        >
          {/* Constrained Mobile Content Wrapper (Max width 480px on desktop) */}
          <div className="w-full max-w-[480px] min-h-screen bg-[#131313] flex flex-col relative pb-28">
            {/* Sticky Header Nav */}
            <header className="sticky top-0 w-full z-30 bg-[#131313]/90 backdrop-blur-md border-b border-[#2A2A2A] shadow-sm">
              <div className="h-16 w-full max-w-[480px] mx-auto px-4 sm:px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-serif-bodoni text-base font-bold text-[#FFB4AB] tracking-wider">
                    {coupleMonogram}
                  </span>
                  <span className="hidden sm:inline font-sans-space text-[11px] text-[#DFBFBB] uppercase tracking-[0.2em]">
                    DECEMBER 2027
                  </span>
                </div>
                <nav className="flex items-center gap-2 sm:gap-3 text-[11px] font-sans-space tracking-wider uppercase text-[#DFBFBB]">
                  <a href="#event" className="hover:text-[#E5E2E1] transition-colors py-1 px-2">
                    Acara
                  </a>
                  {isFeatureAvailable("love_story", { data, forcedThemeId: "gothic" }) && (
                    <a href="#story" className="hover:text-[#E5E2E1] transition-colors py-1 px-2">
                      Kisah
                    </a>
                  )}
                  {(isFeatureAvailable("digital_gift", { data, forcedThemeId: "gothic" }) ||
                    isFeatureAvailable("physical_gift", { data, forcedThemeId: "gothic" })) && (
                    <a href="#gift" className="hover:text-[#E5E2E1] transition-colors py-1 px-2">
                      Kado
                    </a>
                  )}
                  {(isFeatureAvailable("rsvp", { data, forcedThemeId: "gothic" }) ||
                    isFeatureAvailable("wishes", { data, forcedThemeId: "gothic" })) && (
                    <a href="#rsvp" className="hover:text-[#E5E2E1] transition-colors py-1 px-2">
                      RSVP
                    </a>
                  )}
                </nav>
                <div className="w-8 h-8 rounded-full bg-[#700B0B] text-[#FFB4AB] flex items-center justify-center font-serif text-xs font-bold shadow-inner">
                  {brideNick[0] || "P"}
                </div>
              </div>
            </header>

            {/* ======================================================================= */}
            {/* SECTION 1: COVER SCREEN (INITIAL LOCKED STATE OVERLAY)                   */}
            {/* ======================================================================= */}
            <div
              className={`fixed lg:absolute inset-0 z-50 flex items-center justify-center bg-[#131313] transition-all duration-1000 ease-in-out ${
                isOpen
                  ? "-translate-y-full opacity-0 pointer-events-none"
                  : "translate-y-0 opacity-100"
              }`}
            >
              <div className="relative w-full h-full max-w-[480px] mx-auto flex flex-col justify-between p-6 sm:p-8 bg-[#0E0E0E] overflow-hidden shadow-2xl">
              {/* Background Photo & Vignette */}
              <div className="absolute inset-0 z-0">
                <img
                  src={coverImage}
                  alt={`${coupleDisplayName} Cover`}
                  className="w-full h-full object-cover grayscale contrast-125 brightness-50 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-[#0E0E0E]/70 to-[#0E0E0E]/30" />
              </div>

              {/* Header Title */}
              <div className="relative z-10 pt-8 text-center flex flex-col items-center">
                <span className="font-sans-space text-[11px] font-semibold text-[#FFB4AB] tracking-[0.3em] uppercase mb-2">
                  THE WEDDING OF
                </span>
                <h1 className="font-serif-bodoni text-4xl sm:text-5xl text-[#E5E2E1] italic font-normal tracking-wide">
                  {coupleDisplayName}
                </h1>
                <div className="w-12 h-[1px] bg-[#58413F] my-3" />
                <span className="font-sans-space text-xs text-[#C9C6C0] tracking-widest uppercase">
                  28 . 12 . 2027
                </span>
              </div>

              {/* Guest Card & Open CTA */}
              <div className="relative z-10 pb-8 flex flex-col items-center w-full">
                <div className="w-full bg-[#201F1F]/90 backdrop-blur-md border border-[#353534] p-5 rounded-lg text-center mb-4 shadow-xl">
                  <p className="font-sans-space text-[10px] text-[#DFBFBB] uppercase tracking-[0.25em] mb-1.5 font-medium">
                    KEPADA YTH. BAPAK/IBU/SAUDARA/I
                  </p>
                  <p className="font-serif-bodoni text-xl text-[#E5E2E1] my-1 font-medium tracking-normal">
                    {guestName || "Tamu Undangan Terhormat"}
                  </p>
                  <p className="font-serif text-[12px] text-[#C9C6C0] italic opacity-85 mt-1.5">
                    *Mohon maaf jika ada kesalahan penulisan nama / gelar
                  </p>
                </div>

                <button
                  onClick={handleOpenInvitation}
                  className="w-full py-4 px-6 bg-[#700B0B] hover:bg-[#881E1A] text-[#FFFFFF] font-sans-space text-xs font-semibold uppercase tracking-[0.2em] rounded-lg shadow-xl hover:shadow-[0_0_24px_rgba(112,11,11,0.7)] active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-[#FFB4AB] transition-transform group-hover:scale-110" />
                  <span>Buka Undangan</span>
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* MAIN SCROLLABLE CONTENT (Mobile Container: max-w-480px)                 */}
          {/* ======================================================================= */}
          <main className="flex-1 w-full bg-[#131313]">
            <div className="w-full max-w-[480px] mx-auto px-4 sm:px-6 py-8 flex flex-col gap-14">
              {/* ===================================================================== */}
              {/* FEATURE: QR TICKET PASS BADGE                                         */}
              {/* ===================================================================== */}
              {isFeatureAvailable("qr_ticket", { data, forcedThemeId: "gothic" }) && (
                <div className="w-full bg-[#1C1B1B] border border-[#353534] p-4 rounded-lg flex items-center justify-between gap-3 shadow-lg">
                  <div>
                    <p className="font-sans-space text-[10px] uppercase tracking-[0.2em] text-[#FFB4AB] font-semibold">
                      TIKET MASUK RESEPSI
                    </p>
                    <h4 className="font-serif-bodoni text-lg font-medium text-[#E5E2E1] mt-0.5">
                      {guestName || "Tamu Undangan"}
                    </h4>
                    <p className="font-serif text-[11px] text-[#C9C6C0]">
                      Scan QR Code di meja resepsi acara
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQrTicketModal(true)}
                    className="px-3.5 py-2 rounded bg-[#700B0B] hover:bg-[#881E1A] text-[#FFFFFF] font-sans-space text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
                  >
                    <QrCode className="w-4 h-4 text-[#FFB4AB]" />
                    <span>Buka QR</span>
                  </button>
                </div>
              )}

              {/* ===================================================================== */}
              {/* SECTION 2: HERO ENVELOPE & OPENING QUOTE                              */}
              {/* ===================================================================== */}
              <section className="w-full flex flex-col items-center text-center animate-card-fade-up">
                {/* 3D Envelope Graphic & Slide-Out Polaroid */}
                <div className="relative w-64 h-72 sm:w-72 sm:h-80 flex items-center justify-center perspective-[1000px] mb-8">
                  {/* Red Envelope Pouch */}
                  <div className="absolute inset-0 bg-[#700B0B] border border-[#881E1A] rounded-lg shadow-2xl flex flex-col items-center justify-between p-4 overflow-hidden">
                    <div className="w-full flex justify-between items-center opacity-60">
                      <span className="font-sans-space text-[10px] text-[#FFB4AB] tracking-widest">
                        NO. 1042
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[#FFB4AB]" />
                    </div>

                    {/* Wax Seal Monogram */}
                    <div className="w-20 h-20 rounded-full bg-[#410002] border border-[#881E1A] flex items-center justify-center shadow-inner">
                      <span className="font-serif-bodoni text-xl font-bold text-[#FFB4AB]">
                        {coupleMonogram}
                      </span>
                    </div>

                    <div className="w-full text-center">
                      <span className="font-sans-space text-[10px] text-[#FFDAD5] tracking-[0.25em] uppercase">
                        EPISTOLARY MONOGRAPH
                      </span>
                    </div>
                  </div>

                  {/* Sliding Polaroid Photo Card */}
                  <div
                    className={`absolute w-52 h-64 bg-[#E5E2E1] text-[#313030] p-3 pb-8 rounded shadow-2xl flex flex-col items-center transition-all duration-1000 -translate-y-6 hover:-translate-y-12 rotate-[-2deg] ${
                      isOpen ? "animate-slide-out-photo" : ""
                    }`}
                  >
                    <div className="w-full h-44 bg-[#0E0E0E] overflow-hidden rounded-xs">
                      <img
                        src={polaroidPhoto}
                        alt="Vintage Polaroid Couple"
                        className="w-full h-full object-cover grayscale contrast-125"
                      />
                    </div>
                    <span className="font-serif text-lg italic text-[#313030] mt-3 font-normal">
                      Forever Yours
                    </span>
                  </div>
                </div>

                {/* Subheading & Title */}
                <div className="text-center max-w-sm px-2 mb-4">
                  <span className="font-sans-space text-[11px] font-semibold text-[#FFB4AB] tracking-[0.25em] uppercase">
                    IN THE NAME OF LOVE
                  </span>
                  <h2 className="font-serif-bodoni text-3xl text-[#E5E2E1] mt-1">
                    The Sacred Union
                  </h2>
                </div>

                {/* Scripture Quote Card */}
                <div className="w-full bg-[#1C1B1B] border border-[#2A2A2A] p-5 sm:p-6 rounded-lg relative overflow-hidden shadow-xl">
                  <div className="flex flex-col items-center text-center">
                    <p className="font-serif text-sm sm:text-base text-[#E5E2E1] italic mb-3 leading-relaxed opacity-90">
                      “Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.”
                    </p>
                    <span className="font-sans-space text-[11px] font-semibold text-[#FFB4AB] tracking-widest uppercase">
                      Q.S. AR-RUM : 21
                    </span>
                  </div>
                </div>

                {/* Animated Mouse Scroll Indicator */}
                <div className="flex flex-col items-center mt-8 gap-2 opacity-65">
                  <span className="font-sans-space text-[10px] font-medium tracking-[0.25em] text-[#C9C6C0] uppercase">
                    GULIR KE BAWAH
                  </span>
                  <div className="w-5 h-8 border border-[#58413F] rounded-full flex justify-center pt-1">
                    <div className="w-1 h-2 bg-[#FFB4AB] rounded-full animate-scroll-dot" />
                  </div>
                </div>
              </section>

              {/* ===================================================================== */}
              {/* SECTION 3: THE BRIDE & GROOM PROFILE                                  */}
              {/* ===================================================================== */}
              <section id="profile" className="w-full flex flex-col items-center">
                <div className="text-center mb-6">
                  <span className="font-sans-space text-[11px] font-semibold text-[#FFB4AB] tracking-[0.25em] uppercase">
                    THE WEDDING OF
                  </span>
                  <h3 className="font-serif-bodoni text-3xl text-[#E5E2E1] mt-1 font-medium">
                    Mempelai Pengantin
                  </h3>
                  <p className="font-serif text-sm text-[#C9C6C0] mt-1 max-w-xs mx-auto">
                    Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Anda untuk merayakan cinta kami.
                  </p>
                </div>

                <div className="w-full flex flex-col gap-4">
                  {/* Bride Card (Crisp Warm White Card with Dark Contrast) */}
                  <div className="w-full bg-[#E5E2E1] text-[#313030] p-6 rounded-lg shadow-2xl relative overflow-hidden border border-[#D5D2D1]">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative w-36 h-48 rounded-t-full overflow-hidden mb-4 shadow-md bg-[#201F1F]">
                        <img
                          src={bridePhoto}
                          alt={brideFullName}
                          className="w-full h-full object-cover grayscale contrast-125"
                        />
                      </div>
                      <span className="font-sans-space text-[11px] font-semibold text-[#700B0B] tracking-[0.2em] uppercase mb-1">
                        THE BRIDE
                      </span>
                      <h4 className="font-serif-bodoni text-2xl font-semibold text-[#111111]">
                        {brideFullName}
                      </h4>
                      <p className="font-serif text-sm text-[#474742] mt-1 max-w-xs leading-snug">
                        Putri pertama dari pasangan
                        <br />
                        <span className="font-semibold text-[#111111]">{brideParents}</span>
                      </p>
                      {data.coupleInfo.brideInstagram && (
                        <a
                          href={`https://instagram.com/${data.coupleInfo.brideInstagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#131313] text-[#E5E2E1] rounded-full font-sans-space text-[11px] font-medium tracking-wider hover:bg-[#700B0B] transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#FFB4AB]" />
                          <span>@{data.coupleInfo.brideInstagram.replace("@", "")}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Decorative Filigree Ampersand */}
                  <div className="flex items-center justify-center my-1">
                    <div className="w-12 h-[1px] bg-[#58413F]" />
                    <span className="font-serif-bodoni text-3xl text-[#FFB4AB] px-4 italic font-normal">
                      &
                    </span>
                    <div className="w-12 h-[1px] bg-[#58413F]" />
                  </div>

                  {/* Groom Card */}
                  <div className="w-full bg-[#E5E2E1] text-[#313030] p-6 rounded-lg shadow-2xl relative overflow-hidden border border-[#D5D2D1]">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative w-36 h-48 rounded-t-full overflow-hidden mb-4 shadow-md bg-[#201F1F]">
                        <img
                          src={groomPhoto}
                          alt={groomFullName}
                          className="w-full h-full object-cover grayscale contrast-125"
                        />
                      </div>
                      <span className="font-sans-space text-[11px] font-semibold text-[#700B0B] tracking-[0.2em] uppercase mb-1">
                        THE GROOM
                      </span>
                      <h4 className="font-serif-bodoni text-2xl font-semibold text-[#111111]">
                        {groomFullName}
                      </h4>
                      <p className="font-serif text-sm text-[#474742] mt-1 max-w-xs leading-snug">
                        Putra pertama dari pasangan
                        <br />
                        <span className="font-semibold text-[#111111]">{groomParents}</span>
                      </p>
                      {data.coupleInfo.groomInstagram && (
                        <a
                          href={`https://instagram.com/${data.coupleInfo.groomInstagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#131313] text-[#E5E2E1] rounded-full font-sans-space text-[11px] font-medium tracking-wider hover:bg-[#700B0B] transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#FFB4AB]" />
                          <span>@{data.coupleInfo.groomInstagram.replace("@", "")}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* ===================================================================== */}
              {/* SECTION 4: SAVE THE DATE & ORNATE COUNTDOWN                           */}
              {/* ===================================================================== */}
              {isFeatureAvailable("countdown", { data, forcedThemeId: "gothic" }) && (
                <section className="w-full">
                  <div className="bg-[#1C1B1B] border border-[#2A2A2A] p-6 sm:p-8 rounded-lg flex flex-col items-center text-center shadow-xl relative overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-[#700B0B] border border-[#881E1A] flex items-center justify-center mb-3 shadow-md">
                      <Clock className="w-5 h-5 text-[#FFB4AB]" />
                    </div>
                    <span className="font-sans-space text-[11px] font-semibold text-[#FFB4AB] tracking-[0.25em] uppercase">
                      SAVE THE DATE
                    </span>
                    <h3 className="font-serif-bodoni text-2xl text-[#E5E2E1] mt-1">
                      Menghitung Hari Bahagia
                    </h3>
                    <p className="font-serif text-sm text-[#C9C6C0] mt-1 mb-6">
                      Selasa, 28 Desember 2027
                    </p>

                    {/* 4 Countdown Blocks */}
                    <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-sm mb-6">
                      <div className="bg-[#201F1F] border border-[#353534] p-3 rounded flex flex-col items-center shadow-inner">
                        <span className="font-serif-bodoni text-2xl text-[#FFB4AB]">
                          {timeLeft.days}
                        </span>
                        <span className="font-sans-space text-[10px] text-[#C9C6C0] uppercase mt-0.5 tracking-wider">
                          HARI
                        </span>
                      </div>
                      <div className="bg-[#201F1F] border border-[#353534] p-3 rounded flex flex-col items-center shadow-inner">
                        <span className="font-serif-bodoni text-2xl text-[#FFB4AB]">
                          {timeLeft.hours}
                        </span>
                        <span className="font-sans-space text-[10px] text-[#C9C6C0] uppercase mt-0.5 tracking-wider">
                          JAM
                        </span>
                      </div>
                      <div className="bg-[#201F1F] border border-[#353534] p-3 rounded flex flex-col items-center shadow-inner">
                        <span className="font-serif-bodoni text-2xl text-[#FFB4AB]">
                          {timeLeft.minutes}
                        </span>
                        <span className="font-sans-space text-[10px] text-[#C9C6C0] uppercase mt-0.5 tracking-wider">
                          MENIT
                        </span>
                      </div>
                      <div className="bg-[#201F1F] border border-[#353534] p-3 rounded flex flex-col items-center shadow-inner">
                        <span className="font-serif-bodoni text-2xl text-[#FFB4AB]">
                          {timeLeft.seconds}
                        </span>
                        <span className="font-sans-space text-[10px] text-[#C9C6C0] uppercase mt-0.5 tracking-wider">
                          DETIK
                        </span>
                      </div>
                    </div>

                    {/* Google Calendar Link */}
                    <a
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                        `The Wedding of ${coupleDisplayName}`
                      )}&dates=20271228T010000Z/20271228T070000Z&details=${encodeURIComponent(
                        schedules[0]?.venueName || "Menara 165 Jakarta"
                      )}&location=${encodeURIComponent(
                        schedules[0]?.address || "Menara 165 Jakarta"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full max-w-xs py-3.5 px-4 bg-[#700B0B] hover:bg-[#881E1A] text-[#FFFFFF] rounded font-sans-space text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-[#FFB4AB]" />
                      <span>SIMPAN TANGGAL</span>
                    </a>
                  </div>
                </section>
              )}

              {/* ===================================================================== */}
              {/* SECTION 5: EVENT SCHEDULE & DETAILS                                   */}
              {/* ===================================================================== */}
              <section id="event" className="w-full flex flex-col gap-4">
                <div className="text-center mb-2">
                  <span className="font-sans-space text-[11px] font-semibold text-[#FFB4AB] tracking-[0.25em] uppercase">
                    SCHEDULE & VENUE
                  </span>
                  <h3 className="font-serif-bodoni text-3xl text-[#E5E2E1] mt-1">
                    Rangkaian Acara
                  </h3>
                </div>

                {/* Event Schedule Cards */}
                {schedules.map((schedule, idx) => {
                  const bannerImage =
                    idx === 0
                      ? "/templates/gothic/akad.jpg"
                      : "/templates/gothic/reception.jpg";

                  return (
                    <div
                      key={schedule.id || idx}
                      className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg overflow-hidden shadow-xl"
                    >
                      <div className="relative h-44 w-full">
                        <img
                          src={bannerImage}
                          alt={schedule.eventName}
                          className="w-full h-full object-cover grayscale contrast-125 brightness-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B1B] to-transparent" />
                        <div className="absolute bottom-3 left-4">
                          <span className="font-sans-space text-[10px] font-semibold bg-[#700B0B] text-[#FFFFFF] px-2.5 py-1 rounded uppercase tracking-wider">
                            SESI {String(idx + 1).padStart(2, "0")}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col items-center text-center">
                        <h4 className="font-serif-bodoni text-2xl text-[#E5E2E1] font-semibold">
                          {schedule.eventName}
                        </h4>
                        <p className="font-sans-space text-[11px] font-semibold text-[#FFB4AB] tracking-widest uppercase mt-1">
                          {idx === 0 ? "HOLY MATRIMONY" : "WEDDING CELEBRATION"}
                        </p>

                        <div className="flex items-center gap-2 text-[#C9C6C0] mt-4 text-sm font-serif">
                          <Clock className="w-4 h-4 text-[#FFB4AB]" />
                          <span>
                            {schedule.startTime}
                            {schedule.endTime ? ` – ${schedule.endTime}` : ""}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[#C9C6C0] mt-1.5 text-sm font-serif">
                          <MapPin className="w-4 h-4 text-[#FFB4AB]" />
                          <span>{schedule.venueName}</span>
                        </div>
                        <p className="text-xs text-[#DFBFBB] mt-1 max-w-xs font-serif opacity-80">
                          {schedule.address}
                        </p>

                        {isFeatureAvailable("google_maps", { data, forcedThemeId: "gothic" }) && schedule.mapsUrl && (
                          <a
                            href={schedule.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-[#2A2A2A] hover:bg-[#700B0B] text-[#E5E2E1] rounded font-sans-space text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer"
                          >
                            <Navigation className="w-4 h-4 text-[#FFB4AB]" />
                            <span>Petunjuk Lokasi</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Embedded Google Maps */}
                {isFeatureAvailable("google_maps", { data, forcedThemeId: "gothic" }) && (
                  <div className="overflow-hidden rounded-lg border border-[#353534] shadow-lg">
                    <GoogleMapEmbed
                      venueName={schedules[0]?.venueName || "Lokasi Acara"}
                      address={
                        schedules[0]?.address ||
                        "Menara 165 Cilandak Jakarta Selatan"
                      }
                      mapsUrl={schedules[0]?.mapsUrl}
                      latitude={schedules[0]?.latitude}
                      longitude={schedules[0]?.longitude}
                      heightClass="h-56 sm:h-64"
                    />
                  </div>
                )}

                {/* Dresscode Advisory Card */}
                <div className="bg-[#201F1F] border border-[#353534] p-5 rounded-lg flex flex-col items-center text-center shadow-lg">
                  <span className="font-sans-space text-[10px] font-semibold uppercase text-[#DFBFBB] tracking-widest mb-1">
                    ETIKET BERBUSANA
                  </span>
                  <h5 className="font-serif-bodoni text-lg text-[#E5E2E1]">
                    Dress Code: Formal Elegance
                  </h5>
                  <p className="font-serif text-sm text-[#C9C6C0] mt-1 mb-4">
                    Tamu undangan dihimbau mengenakan palet warna berikut:
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-8 h-8 rounded-full bg-[#000000] border border-[#58413F] shadow-md" />
                      <span className="font-sans-space text-[10px] text-[#C9C6C0] uppercase tracking-wider">
                        HITAM
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#D5D2D1] shadow-md" />
                      <span className="font-sans-space text-[10px] text-[#C9C6C0] uppercase tracking-wider">
                        PUTIH
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-8 h-8 rounded-full bg-[#800000] border border-[#881E1A] shadow-md" />
                      <span className="font-sans-space text-[10px] text-[#C9C6C0] uppercase tracking-wider">
                        MAROON
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Streaming Card */}
                {data.youtubeVideoUrl && (
                  <div className="bg-[#1C1B1B] border border-[#2A2A2A] p-4 rounded-lg flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-[#FFB4AB] animate-ping" />
                      <div className="flex flex-col text-left">
                        <span className="font-serif text-sm font-semibold text-[#E5E2E1]">
                          Live Streaming
                        </span>
                        <span className="text-xs text-[#C9C6C0]">
                          Bagi kerabat yang berhalangan hadir
                        </span>
                      </div>
                    </div>
                    <a
                      href={data.youtubeVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#700B0B] hover:bg-[#881E1A] text-[#FFFFFF] rounded font-sans-space text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>Tonton</span>
                    </a>
                  </div>
                )}
              </section>

              {/* ===================================================================== */}
              {/* SECTION 6: LOVE STORY TIMELINE                                        */}
              {/* ===================================================================== */}
              {isFeatureAvailable("love_story", { data, forcedThemeId: "gothic" }) && (
                <section id="story" className="w-full">
                  <div className="text-center mb-6">
                    <span className="font-sans-space text-[11px] font-semibold text-[#FFB4AB] tracking-[0.25em] uppercase">
                      CHRONICLE
                    </span>
                    <h3 className="font-serif-bodoni text-3xl text-[#E5E2E1] mt-1">
                      Our Love Story
                    </h3>
                  </div>

                  <div className="relative pl-6 space-y-6">
                    {/* Vertical Line */}
                    <div className="absolute left-2 top-3 bottom-3 w-[1px] bg-[#58413F]" />

                    {(data.coupleInfo.stories && data.coupleInfo.stories.length > 0
                      ? data.coupleInfo.stories.map((s, idx) => ({
                          yearTag: s.date || `BAB 0${idx + 1}`,
                          title: s.title,
                          story: s.story,
                        }))
                      : DEFAULT_GOTHIC_STORIES
                    ).map((item, idx) => (
                      <div key={idx} className="relative flex flex-col gap-1.5">
                        <div className="absolute -left-[21px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#700B0B] border border-[#FFB4AB] shadow-md" />
                        <span className="font-sans-space text-[10px] font-semibold text-[#FFB4AB] tracking-widest uppercase">
                          {item.yearTag}
                        </span>
                        <div className="bg-[#1C1B1B] border border-[#2A2A2A] p-4 rounded-lg shadow-md">
                          <h5 className="font-serif-bodoni text-base text-[#E5E2E1] font-semibold">
                            {item.title}
                          </h5>
                          <p className="font-serif text-sm text-[#C9C6C0] mt-1.5 leading-relaxed">
                            {item.story}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ===================================================================== */}
              {/* SECTION 7: GALLERY & MOMENTS                                          */}
              {/* ===================================================================== */}
              {isFeatureAvailable("gallery", { data, forcedThemeId: "gothic" }) && (
                <section id="gallery" className="w-full">
                  <div className="text-center mb-6">
                    <span className="font-sans-space text-[11px] font-semibold text-[#FFB4AB] tracking-[0.25em] uppercase">
                      GALLERY & MEMORIES
                    </span>
                    <h3 className="font-serif-bodoni text-3xl text-[#E5E2E1] mt-1">
                      Momen Bahagia
                    </h3>
                  </div>

                  {/* Teaser Video Banner */}
                  <div
                    onClick={() => setShowVideoModal(true)}
                    className="w-full h-56 bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg overflow-hidden relative mb-4 shadow-xl group cursor-pointer"
                  >
                    <img
                      src="/templates/gothic/teaser.jpg"
                      alt="Teaser Video Pre-Wedding"
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-[#0E0E0E]/40 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#700B0B] text-[#FFFFFF] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current pl-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-4">
                      <span className="font-sans-space text-[10px] text-[#FFFFFF] uppercase tracking-wider font-semibold">
                        TEASER VIDEO • PRE-WEDDING
                      </span>
                    </div>
                  </div>

                  {/* 4-Photo Monochrome Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {galleryItems.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        onClick={() => setLightboxImg(item.imageUrl)}
                        className="h-48 rounded overflow-hidden shadow-md group cursor-pointer relative bg-[#201F1F] border border-[#2A2A2A]"
                      >
                        <img
                          src={item.imageUrl}
                          alt={`Galeri ${idx + 1}`}
                          className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ===================================================================== */}
              {/* SECTION 8: DIGITAL GIFT / AMPLOP DIGITAL                              */}
              {/* ===================================================================== */}
              {(isFeatureAvailable("digital_gift", { data, forcedThemeId: "gothic" }) ||
                isFeatureAvailable("physical_gift", { data, forcedThemeId: "gothic" })) && (
                <section id="gift" className="w-full">
                  <div className="bg-[#1C1B1B] border border-[#2A2A2A] p-6 rounded-lg text-center shadow-xl">
                    <div className="w-12 h-12 rounded-full bg-[#700B0B] border border-[#881E1A] flex items-center justify-center mx-auto mb-3 shadow-md">
                      <Mail className="w-5 h-5 text-[#FFB4AB]" />
                    </div>
                    <span className="font-sans-space text-[11px] font-semibold text-[#FFB4AB] tracking-[0.25em] uppercase">
                      WEDDING GIFT
                    </span>
                    <h3 className="font-serif-bodoni text-2xl text-[#E5E2E1] mt-1 font-semibold">
                      Tanda Kasih
                    </h3>
                    <p className="font-serif text-sm text-[#C9C6C0] mt-1.5 mb-5 leading-relaxed">
                      Doa restu Anda adalah karunia terindah bagi kami. Bagi yang berkenan memberikan tanda kasih, dapat mengirimkan melalui:
                    </p>

                    <button
                      onClick={() => setIsGiftOpen((prev) => !prev)}
                      className="w-full py-3.5 px-4 bg-[#2A2A2A] hover:bg-[#353534] text-[#E5E2E1] rounded font-sans-space text-xs font-semibold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <span>Kirim Hadiah / Amplop Digital</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isGiftOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Accordion Drawer */}
                    <div
                      className={`transition-all duration-500 overflow-hidden flex flex-col gap-4 text-left ${
                        isGiftOpen ? "max-h-[600px] opacity-100 mt-5" : "max-h-0 opacity-0 mt-0 pointer-events-none"
                      }`}
                    >
                      {isFeatureAvailable("digital_gift", { data, forcedThemeId: "gothic" }) &&
                        bankAccounts.map((account, idx) => (
                          <div
                            key={account.id || idx}
                            className="p-4 bg-[#201F1F] border border-[#353534] rounded-lg shadow-inner"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-serif-bodoni text-base font-semibold text-[#E5E2E1]">
                                {account.bankName}
                              </span>
                              <span className="font-sans-space text-[10px] text-[#FFB4AB] font-semibold uppercase tracking-wider">
                                DIGITAL TRANSFER
                              </span>
                            </div>
                            <p className="font-serif text-xs text-[#C9C6C0]">
                              a/n {account.accountHolder}
                            </p>
                            <div className="flex items-center justify-between mt-3 bg-[#0E0E0E] p-2.5 rounded border border-[#2A2A2A]">
                              <span className="font-mono text-sm tracking-wider text-[#E5E2E1]">
                                {account.accountNumber}
                              </span>
                              <button
                                onClick={() =>
                                  handleCopy(account.accountNumber, `No. Rekening ${account.bankName}`)
                                }
                                className="px-3 py-1 bg-[#700B0B] hover:bg-[#881E1A] text-[#FFFFFF] font-sans-space text-xs font-medium rounded transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Salin</span>
                              </button>
                            </div>
                          </div>
                        ))}

                      {/* Physical Gift Card */}
                      {isFeatureAvailable("physical_gift", { data, forcedThemeId: "gothic" }) && (
                        <div className="p-4 bg-[#201F1F] border border-[#353534] rounded-lg shadow-inner">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-serif-bodoni text-base font-semibold text-[#E5E2E1]">
                              Kirim Kado Fisik
                            </span>
                            <span className="font-sans-space text-[10px] text-[#FFB4AB] font-semibold uppercase tracking-wider">
                              ALAMAT PENGIRIMAN
                            </span>
                          </div>
                          <p className="font-serif text-xs text-[#C9C6C0] leading-relaxed">
                            {giftAddress}
                          </p>
                          <button
                            onClick={() => handleCopy(giftAddress, "Alamat Pengiriman")}
                            className="mt-3 w-full py-2 bg-[#2A2A2A] hover:bg-[#700B0B] text-[#E5E2E1] font-sans-space text-xs font-semibold rounded transition-colors text-center uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Alamat</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* ===================================================================== */}
              {/* SECTION 9: RSVP & WISHES GUESTBOOK                                    */}
              {/* ===================================================================== */}
              {(isFeatureAvailable("rsvp", { data, forcedThemeId: "gothic" }) ||
                isFeatureAvailable("wishes", { data, forcedThemeId: "gothic" })) && (
                <section id="rsvp" className="w-full">
                  <div className="bg-[#1C1B1B] border border-[#2A2A2A] p-6 rounded-lg shadow-xl">
                    <div className="text-center mb-6">
                      <span className="font-sans-space text-[11px] font-semibold text-[#FFB4AB] tracking-[0.25em] uppercase">
                        RSVP & WISHES
                      </span>
                      <h3 className="font-serif-bodoni text-2xl text-[#E5E2E1] mt-1 font-semibold">
                        Konfirmasi Kehadiran
                      </h3>
                      <p className="font-serif text-sm text-[#C9C6C0] mt-1">
                        Mohon konfirmasi kesediaan kehadiran Anda serta titipkan untaian doa.
                      </p>
                    </div>

                    {isFeatureAvailable("rsvp", { data, forcedThemeId: "gothic" }) && (
                      <form onSubmit={handleRsvpSubmit} className="flex flex-col gap-4">
                        <div>
                          <label className="block font-sans-space text-[10px] text-[#C9C6C0] uppercase tracking-wider mb-1">
                            NAMA LENGKAP
                          </label>
                          <input
                            type="text"
                            value={rsvpName}
                            onChange={(e) => setRsvpName(e.target.value)}
                            placeholder="Contoh: Rian & Keluarga"
                            required
                            className="w-full bg-[#201F1F] border border-[#353534] p-3 rounded text-[#E5E2E1] text-sm focus:outline-none focus:border-[#FFB4AB] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block font-sans-space text-[10px] text-[#C9C6C0] uppercase tracking-wider mb-2">
                            KONFIRMASI KEHADIRAN
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center gap-2 p-3 rounded bg-[#201F1F] border border-[#353534] cursor-pointer hover:bg-[#2A2A2A] transition-colors">
                              <input
                                type="radio"
                                name="gothic-attendance"
                                value="Hadir"
                                checked={rsvpAttendance === "Hadir"}
                                onChange={() => setRsvpAttendance("Hadir")}
                                className="accent-[#700B0B]"
                              />
                              <span className="text-sm font-serif text-[#E5E2E1]">Hadir</span>
                            </label>
                            <label className="flex items-center gap-2 p-3 rounded bg-[#201F1F] border border-[#353534] cursor-pointer hover:bg-[#2A2A2A] transition-colors">
                              <input
                                type="radio"
                                name="gothic-attendance"
                                value="Tidak Hadir"
                                checked={rsvpAttendance === "Tidak Hadir"}
                                onChange={() => setRsvpAttendance("Tidak Hadir")}
                                className="accent-[#700B0B]"
                              />
                              <span className="text-sm font-serif text-[#E5E2E1]">Tidak Hadir</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block font-sans-space text-[10px] text-[#C9C6C0] uppercase tracking-wider mb-1">
                            JUMLAH TAMU
                          </label>
                          <select
                            value={rsvpCount}
                            onChange={(e) => setRsvpCount(e.target.value)}
                            className="w-full bg-[#201F1F] border border-[#353534] p-3 rounded text-[#E5E2E1] text-sm focus:outline-none focus:border-[#FFB4AB] transition-colors"
                          >
                            <option value="1">1 Orang</option>
                            <option value="2">2 Orang</option>
                            <option value="3">3 Orang</option>
                            <option value="4">4 Orang</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-sans-space text-[10px] text-[#C9C6C0] uppercase tracking-wider mb-1">
                            UCAPAN & DOA RESTU
                          </label>
                          <textarea
                            value={rsvpMessage}
                            onChange={(e) => setRsvpMessage(e.target.value)}
                            placeholder="Tuliskan doa restu untuk kedua mempelai..."
                            required
                            rows={3}
                            className="w-full bg-[#201F1F] border border-[#353534] p-3 rounded text-[#E5E2E1] text-sm focus:outline-none focus:border-[#FFB4AB] transition-colors"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3.5 bg-[#700B0B] hover:bg-[#881E1A] text-[#FFFFFF] rounded font-sans-space text-xs font-semibold uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          <Send className="w-4 h-4 text-[#FFB4AB]" />
                          <span>{isSubmitting ? "Mengirim..." : "Kirim Ucapan"}</span>
                        </button>
                      </form>
                    )}

                    {/* Wishes Feed */}
                    {isFeatureAvailable("wishes", { data, forcedThemeId: "gothic" }) && (
                      <div className="mt-8 pt-6 border-t border-[#2A2A2A]">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-sans-space text-[10px] font-semibold text-[#FFB4AB] uppercase tracking-widest">
                            GUESTBOOK FEED
                          </span>
                          <span className="font-sans-space text-[10px] text-[#C9C6C0] uppercase">
                            {wishesList.length} UCAPAN
                          </span>
                        </div>

                        <div className="space-y-3 max-h-64 overflow-y-auto pr-1 no-scrollbar">
                          {wishesList.map((wish) => (
                            <div
                              key={wish.id}
                              className="p-3 bg-[#201F1F] border border-[#2A2A2A] rounded shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-serif-bodoni text-sm font-semibold text-[#E5E2E1]">
                                  {wish.senderName}
                                </span>
                                <span
                                  className={`font-sans-space text-[9px] px-2 py-0.5 rounded font-semibold uppercase ${
                                    wish.attendance === "Hadir"
                                      ? "bg-[#700B0B] text-[#FFB4AB]"
                                      : "bg-[#2A2A2A] text-[#C9C6C0]"
                                  }`}
                                >
                                  {wish.attendance.toUpperCase()}
                                </span>
                              </div>
                              <p className="font-serif text-xs text-[#C9C6C0] italic leading-relaxed">
                                “{wish.message}”
                              </p>
                              <span className="font-sans-space text-[9px] text-[#58413F] mt-1 block">
                                {wish.timeAgo}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* ===================================================================== */}
              {/* SECTION 10: CLOSING & FOOTER                                          */}
              {/* ===================================================================== */}
              <section className="w-full pb-8 flex flex-col items-center text-center">
                <div className="relative w-44 h-56 rounded-t-full overflow-hidden shadow-2xl mb-4 bg-[#1C1B1B] border border-[#2A2A2A]">
                  <img
                    src={closingPhoto}
                    alt={coupleDisplayName}
                    className="w-full h-full object-cover grayscale contrast-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent" />
                </div>

                <span className="font-sans-space text-[11px] font-semibold text-[#FFB4AB] tracking-[0.25em] uppercase">
                  CLOSING BLESSINGS
                </span>
                <h3 className="font-serif-bodoni text-3xl text-[#E5E2E1] mt-1 font-semibold">
                  Terima Kasih
                </h3>
                <p className="font-serif text-sm text-[#C9C6C0] mt-2 max-w-xs leading-relaxed">
                  Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu bagi lembaran baru kehidupan kami.
                </p>

                <div className="mt-6">
                  <p className="font-sans-space text-[10px] uppercase text-[#C9C6C0] tracking-widest mb-1">
                    KAMI YANG BERBAHAGIA
                  </p>
                  <p className="font-serif-bodoni text-3xl text-[#E5E2E1] italic">
                    {coupleDisplayName}
                  </p>
                  <p className="font-serif text-xs text-[#DFBFBB] mt-1">
                    Beserta Seluruh Keluarga Besar
                  </p>
                </div>
              </section>
            </div>
          </main>

          {/* Footer Copyright */}
          <footer className="w-full bg-[#0E0E0E] border-t border-[#2A2A2A] py-6">
            <div className="max-w-[480px] mx-auto px-4 text-center flex flex-col items-center gap-1">
              <span className="font-sans-space text-xs font-semibold text-[#FFB4AB] uppercase tracking-widest">
                {coupleDisplayName}
              </span>
              <span className="font-sans-space text-[10px] text-[#DFBFBB] tracking-wider">
                MEMORANDUM • GOTHIC TEMA 01
              </span>
              <span className="font-sans-space text-[9px] text-[#58413F] mt-1 tracking-wider">
                © 2027 ALL RIGHTS RESERVED
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>

      {/* Guest QR Code Ticket Modal */}
      {showQrTicketModal && isFeatureAvailable("qr_ticket", { data, forcedThemeId: "gothic" }) && (
        <div
          onClick={() => setShowQrTicketModal(false)}
          className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1C1B1B] border border-[#58413F] max-w-xs w-full p-6 text-center space-y-4 shadow-2xl relative rounded-lg"
          >
            <button
              onClick={() => setShowQrTicketModal(false)}
              className="absolute top-3 right-3 text-[#C9C6C0] hover:text-[#FFFFFF] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-2 text-[#FFB4AB]">
              <QrCode className="w-5 h-5 text-[#FFB4AB]" />
              <span className="font-serif-bodoni text-xl tracking-wider font-semibold text-[#E5E2E1]">
                Tiket Tamu Resepsi
              </span>
            </div>
            <div>
              <p className="font-sans-space text-[10px] uppercase tracking-widest text-[#FFB4AB] font-semibold">
                Tamu Terhormat
              </p>
              <h4 className="font-serif-bodoni text-2xl text-[#E5E2E1] mt-1">
                {guestName || "Tamu Undangan"}
              </h4>
            </div>
            <div className="bg-[#FFFFFF] p-3 inline-block mx-auto rounded border border-[#FFB4AB]/40 shadow-sm">
              {qrTicketDataUrl ? (
                <img src={qrTicketDataUrl} alt="QR Code Tamu" className="w-40 h-40 mx-auto" />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-xs text-gray-500">
                  Membuat QR Code...
                </div>
              )}
            </div>
            <p className="font-serif text-[11px] text-[#C9C6C0] leading-relaxed">
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
          <div className="relative max-w-lg max-h-[85vh] rounded overflow-hidden">
            <img
              src={lightboxImg}
              alt="Enlarged"
              className="w-full h-full object-contain grayscale contrast-125"
            />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#700B0B] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div
          onClick={() => setShowVideoModal(false)}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#0E0E0E] rounded-lg overflow-hidden border border-[#353534] shadow-2xl p-1"
          >
            <div className="relative pt-[56.25%] bg-black">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={
                  data.youtubeVideoUrl
                    ? data.youtubeVideoUrl.replace("watch?v=", "embed/")
                    : "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                }
                title="Wedding Teaser"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-[#700B0B] transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GothicTheme;

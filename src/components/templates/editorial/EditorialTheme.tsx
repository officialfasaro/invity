"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { WeddingInvitationData } from "@/types/wedding";
import { downloadWeddingQrisCard } from "@/utils/downloadHelper";
import {
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Gift,
  Heart,
  Home,
  MailOpen,
  MapPin,
  Pause,
  Play,
  QrCode,
  Share2,
  Tv,
  X,
} from "lucide-react";
import InstagramIcon from "../shared/InstagramIcon";
import GoogleMapEmbed from "../shared/GoogleMapEmbed";
import { isFeatureAvailable } from "@/utils/featureFlags";

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
  attendance: "Hadir" | "Tidak Hadir";
  guestCount: string;
  message: string;
}

const DEFAULT_WISHES: LocalWish[] = [
  {
    id: "w-1",
    senderName: "Dimas Ramadhan & Partner",
    timeAgo: "2 jam lalu",
    attendance: "Hadir",
    guestCount: "2 Orang",
    message:
      "Barakallahu lakum wa baraka alaikum wa jama'a bainakuma fii khoir. Selamat menempuh hidup baru Putri dan Andika! Semoga langgeng dan selalu diliputi kebahagiaan.",
  },
  {
    id: "w-2",
    senderName: "Nadia Kusuma, S.Ars.",
    timeAgo: "5 jam lalu",
    attendance: "Hadir",
    guestCount: "1 Orang",
    message:
      "Cantik dan ganteng sekali, pasangan serasi arsitek idola! Lancar-lancar sampai hari H yaa Putri & Andika. Can't wait to see both of you on the aisle!",
  },
  {
    id: "w-3",
    senderName: "Rian Firmansyah",
    timeAgo: "1 hari lalu",
    attendance: "Tidak Hadir",
    guestCount: "1 Orang",
    message:
      "Selamat Bro Andika dan Sis Putri! Mohon maaf belum bisa hadir langsung karena dinas luar kota, tapi doa terbaik selalu menyertai perjalanan bahtera rumah tangga kalian.",
  },
  {
    id: "w-4",
    senderName: "dr. Clara & Keluarga",
    timeAgo: "2 hari lalu",
    attendance: "Hadir",
    guestCount: "2 Orang",
    message:
      "Doa terbaik kami haturkan untuk kalian berdua. Semoga menjadi keluarga sakinah mawaddah warahmah, berlimpah berkah dan sukacita.",
  },
];

const DEFAULT_GALLERY_IMAGES = [
  {
    url: "/templates/editorial/cover.jpg",
    title: "Editorial Moments in Desert Dunes",
    category: "Prewedding",
  },
  {
    url: "/templates/editorial/bride.jpg",
    title: "The Bride Serenade",
    category: "Detail Portofolio",
  },
  {
    url: "/templates/editorial/groom.jpg",
    title: "The Groom Portrait",
    category: "Detail Portofolio",
  },
  {
    url: "/templates/editorial/desktop-cover.jpg",
    title: "Two Souls in Harmony",
    category: "Prewedding",
  },
];

const DEFAULT_EDITORIAL_STORIES = [
  {
    year: "Tahun 2022",
    tagline: "Pertemuan Pertama",
    title: "A Simple Hello",
    story:
      "Pertama kali kami dipertemukan dalam proyek kolaborasi arsitektur di Bandung. Berawal dari diskusi desain dan secangkir kopi hangat, canda tawa sederhana menjadi awal sebuah cerita yang tak pernah kami bayangkan sebelumnya.",
  },
  {
    year: "Tahun 2024",
    tagline: "Satu Visi & Komitmen",
    title: "Growing Together",
    story:
      "Melewati berbagai dinamika kehidupan dan impian karier bersama. Kami menyadari bahwa cinta bukan sekadar tentang perasaan, melainkan komitmen untuk terus saling bertumbuh, menghargai, dan saling menguatkan dalam doa.",
  },
  {
    year: "Tahun 2026",
    tagline: "Lamaran & Ikrar",
    title: "She Said Yes!",
    story:
      "Di bawah langit senja dengan hembusan angin yang teduh, sebuah janji terucap untuk melangkah bersama seumur hidup. Dengan ketulusan hati dan restu kedua orang tua, kami mantap mengikat janji suci pernikahan ini.",
  },
];

const getYouTubeVideoId = (url?: string | null): string | null => {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : null;
};

export const EditorialTheme: React.FC<ThemeProps> = ({
  data,
  guestName,
  showCover = true,
  isEmbedded = false,
}) => {
  // State
  const [isOpen, setIsOpen] = useState(!showCover);
  const [isCoverSliding, setIsCoverSliding] = useState(false);
  const [isCoverDismissed, setIsCoverDismissed] = useState(!showCover);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showQrTicketModal, setShowQrTicketModal] = useState(false);
  const [qrTicketDataUrl, setQrTicketDataUrl] = useState<string>("");

  // Form State
  const [rsvpName, setRsvpName] = useState(guestName || "");
  const [rsvpAttendance, setRsvpAttendance] = useState<"Hadir" | "Tidak Hadir">("Hadir");
  const [rsvpCount, setRsvpCount] = useState("2 Orang");
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

  // Audio Reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heroSectionRef = useRef<HTMLElement | null>(null);

  // Dynamic Couple Info
  const groomFullName = data.coupleInfo.groomName || "Putra Andika Pratama, S.T.";
  const groomNick =
    data.coupleInfo.groomNickname || data.coupleInfo.groomName?.split(" ")[0] || "Andika";
  const brideFullName = data.coupleInfo.brideName || "Putri Cantika Sari, S.Ds.";
  const brideNick =
    data.coupleInfo.brideNickname || data.coupleInfo.brideName?.split(" ")[0] || "Putri";
  const coupleDisplayName = `${brideNick} & ${groomNick}`;
  const monogramText = `${brideNick[0] || "P"} & ${groomNick[0] || "A"}`;

  const groomParents = useMemo(() => {
    if (data.coupleInfo.groomFather && data.coupleInfo.groomMother) {
      return `${data.coupleInfo.groomFather} & ${data.coupleInfo.groomMother}`;
    }
    return "Bpk. Deni Bastian & Ibu Aisha Dania";
  }, [data.coupleInfo.groomFather, data.coupleInfo.groomMother]);

  const brideParents = useMemo(() => {
    if (data.coupleInfo.brideFather && data.coupleInfo.brideMother) {
      return `${data.coupleInfo.brideFather} & ${data.coupleInfo.brideMother}`;
    }
    return "Bpk. Abdul Rozak & Ibu Adelia Marni";
  }, [data.coupleInfo.brideFather, data.coupleInfo.brideMother]);

  // Images
  const coverImageSrc = useMemo(() => {
    return (
      data.coupleInfo.desktopCoverImage ||
      data.galleries?.[0]?.imageUrl ||
      "/templates/editorial/cover.jpg"
    );
  }, [data.coupleInfo.desktopCoverImage, data.galleries]);

  const leftPanelImageSrc = useMemo(() => {
    return (
      data.coupleInfo.desktopCoverImage ||
      data.galleries?.[3]?.imageUrl ||
      data.galleries?.[0]?.imageUrl ||
      "/templates/editorial/desktop-cover.jpg"
    );
  }, [data.coupleInfo.desktopCoverImage, data.galleries]);

  const bridePhotoSrc = useMemo(() => {
    return data.coupleInfo.bridePhoto || "/templates/editorial/bride.jpg";
  }, [data.coupleInfo.bridePhoto]);

  const groomPhotoSrc = useMemo(() => {
    return data.coupleInfo.groomPhoto || "/templates/editorial/groom.jpg";
  }, [data.coupleInfo.groomPhoto]);

  // Schedules (supports 1, 2, 3+ events)
  const schedules = useMemo(() => {
    if (data.eventSchedules && data.eventSchedules.length > 0) {
      return data.eventSchedules;
    }
    return [
      {
        eventName: "Akad Nikah",
        date: "2027-12-28",
        startTime: "08:00",
        endTime: "10:00 WIB",
        venueName: "Menara 165 - Granada Ballroom Lt. 2",
        address: "Jl. TB Simatupang Kav. 1, Cilandak, Jakarta Selatan",
        mapsUrl: "https://maps.google.com",
      },
      {
        eventName: "Resepsi Pernikahan",
        date: "2027-12-28",
        startTime: "11:00",
        endTime: "13:30 WIB",
        venueName: "Menara 165 - Grand Ballroom Utama",
        address: "Jl. TB Simatupang Kav. 1, Cilandak, Jakarta Selatan",
        mapsUrl: "https://maps.google.com",
      },
    ];
  }, [data.eventSchedules]);

  const primaryEvent = schedules[0];

  // Date Formatter
  const formatWeddingDate = useCallback((dateVal?: string | Date): string => {
    if (!dateVal) return "Minggu, 28 Desember 2027";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "Minggu, 28 Desember 2027";
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
    } catch {
      return "Minggu, 28 Desember 2027";
    }
  }, []);

  const primaryEventDateStr = useMemo(
    () => formatWeddingDate(primaryEvent?.date),
    [primaryEvent?.date, formatWeddingDate]
  );

  // Physical Gift Shipping Address
  const giftShippingAddress = useMemo(() => {
    return (
      data.coupleInfo.giftAddress ||
      primaryEvent?.address ||
      "Jl. Cempaka Putih Timur No. 18B, Kompleks Griya Asri, Jakarta Pusat 10510"
    );
  }, [data.coupleInfo.giftAddress, primaryEvent?.address]);

  const giftRecipientName = useMemo(() => {
    return data.coupleInfo.giftReceiver || coupleDisplayName;
  }, [data.coupleInfo.giftReceiver, coupleDisplayName]);

  const giftPhoneNumber = useMemo(() => {
    return data.coupleInfo.giftPhone || "0812-9876-5432";
  }, [data.coupleInfo.giftPhone]);

  // Bank Accounts
  const activeBankList = useMemo(() => {
    if (data.bankAccounts && data.bankAccounts.length > 0) {
      return data.bankAccounts;
    }
    return [
      {
        id: "default-bca",
        bankName: "Bank Central Asia (BCA)",
        accountNumber: "7380 9921 44",
        accountHolder: brideFullName,
      },
      {
        id: "default-mandiri",
        bankName: "Bank Mandiri",
        accountNumber: "1370 0192 8839 1",
        accountHolder: groomFullName,
      },
    ];
  }, [data.bankAccounts, brideFullName, groomFullName]);

  // Gallery List
  const galleryList = useMemo(() => {
    if (data.galleries && data.galleries.length > 0) {
      const valid = data.galleries
        .filter((g) => g.imageUrl && g.imageUrl.trim() !== "")
        .map((g, idx) => ({
          url: g.imageUrl,
          title: g.caption || `Editorial Prewedding Moment #${idx + 1}`,
          category: "Prewedding",
        }));
      if (valid.length > 0) return valid;
    }
    return DEFAULT_GALLERY_IMAGES;
  }, [data.galleries]);

  // Video URL
  const rawYoutubeUrl = data.youtubeVideoUrl || data.coupleInfo?.youtubeVideoUrl;
  const youtubeCoverId = getYouTubeVideoId(rawYoutubeUrl);

  // Live Countdown Effect
  useEffect(() => {
    const targetDateStr = primaryEvent?.date
      ? new Date(primaryEvent.date).toISOString()
      : "2027-12-28T08:00:00+07:00";
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
 
  // Generate QR Code for Guest Reception Check-in
  useEffect(() => {
    if (guestName && typeof window !== "undefined") {
      const payload = JSON.stringify({
        guestName,
        invitationSlug: data.slug || "editorial",
        date: primaryEvent?.date || "2027-12-28",
      });
      QRCode.toDataURL(payload, { width: 220, margin: 1 })
        .then(setQrTicketDataUrl)
        .catch(() => {});
    }
  }, [guestName, data.slug, primaryEvent?.date]);

  // Toast Helper
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

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
        .catch((err) => {
          console.warn("Audio play prevented:", err);
          setIsPlaying(false);
          showToast("Sentuh layar untuk memutar musik");
        });
    }
  }, [isPlaying, showToast]);

  // Lock body scroll while full-screen cover is active
  useEffect(() => {
    if (isEmbedded) return;
    if (!isCoverDismissed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCoverDismissed, isEmbedded]);

  // Open Invitation Action with Slide-Up Curtain Animation
  const handleOpenInvitation = () => {
    setIsCoverSliding(true);
    setIsOpen(true);

    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }

    // Dismiss cover overlay after 950ms slide-up transition finishes
    setTimeout(() => {
      setIsCoverDismissed(true);
    }, 950);
  };

  // Copy Helper
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

  // RSVP Submission Handler
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = rsvpName.trim();
    if (!name) return;
    setIsSubmitting(true);

    const newWishItem: LocalWish = {
      id: `wish-${Date.now()}`,
      senderName: name,
      timeAgo: "Baru saja",
      attendance: rsvpAttendance,
      guestCount: rsvpCount,
      message: rsvpMessage.trim() || "Selamat menempuh hidup baru Putri & Andika!",
    };

    setWishesList((prev) => [newWishItem, ...prev]);

    try {
      await fetch("/api/public/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: data.id || data.slug,
          guestName: name,
          status: rsvpAttendance === "Hadir" ? "attending" : "declined",
          attendeeCount: parseInt(rsvpCount, 10) || 1,
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
          }),
        });
      }
    } catch {
      // Ignored for demo
    } finally {
      setIsSubmitting(false);
      setRsvpMessage("");
      showToast("Konfirmasi kehadiran Anda telah tercatat!");
    }
  };

  const audioSource = data.musicUrl || "/music/wedding-romance.mp3";

  return (
    <div className="bg-[#ECE9E2] text-[#1E1C1A] font-sans antialiased selection:bg-[#B8926A]/20 selection:text-[#1E1C1A] min-h-screen">
      {/* Background Audio */}
      <audio
        ref={audioRef}
        src={audioSource}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          console.warn("Audio load error, fallback to wedding romance");
          if (audioRef.current && !audioRef.current.src.includes("/music/wedding-romance.mp3")) {
            audioRef.current.src = "/music/wedding-romance.mp3";
            audioRef.current.load();
            if (isOpen) {
              audioRef.current.play().catch(() => {});
            }
          }
        }}
      />

      {/* ========================================================================= */}
      {/* MAIN WRAPPER: Responsive Split Screen Desktop (60/40) & Mobile Continuous */}
      {/* ========================================================================= */}
      <div className="min-h-screen flex flex-col lg:flex-row w-full max-w-[1680px] mx-auto shadow-2xl relative bg-[#F5F2EB] theme-wrapper no-scrollbar">
        {/* ----------------------------------------------------------------------- */}
        {/* DESKTOP LEFT PANEL: 58-60% Width Sticky Editorial Gallery & Title        */}
        {/* ----------------------------------------------------------------------- */}
        {!isEmbedded && (
          <aside className="hidden lg:flex lg:w-[58%] xl:w-[60%] h-screen sticky top-0 overflow-hidden flex-col justify-between p-12 xl:p-16 text-[#F5F2EB] z-10">
            {/* Background Editorial Image with Warm Vignette */}
            <div className="absolute inset-0 z-0">
              {youtubeCoverId ? (
                <div className="w-full h-full relative overflow-hidden">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeCoverId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeCoverId}&playsinline=1&modestbranding=1&rel=0`}
                    title="Editorial Background Video"
                    className="absolute top-1/2 left-1/2 w-[300%] h-[300%] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none filter blur-[1px] scale-105"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                  <div className="absolute inset-0 bg-[#22201E]/75 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#22201E]/90 via-[#22201E]/30 to-[#22201E]/60" />
                </div>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={leftPanelImageSrc}
                    alt={`${coupleDisplayName} Editorial Prewedding`}
                    className="w-full h-full object-cover object-center filter brightness-[0.82] contrast-[1.05]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/templates/editorial/desktop-cover.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#22201E]/90 via-[#22201E]/30 to-[#22201E]/60 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/40" />
                </>
              )}
            </div>

            {/* Top Branding on Left Panel */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-[1px] bg-[#F5F2EB]/60" />
                <span className="text-xs uppercase tracking-[0.3em] font-medium text-[#F5F2EB]/90">
                  Official Wedding Invitation
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border border-[#F5F2EB]/40 flex items-center justify-center font-serif text-sm tracking-widest text-[#F5F2EB]/90 backdrop-blur-sm bg-black/10">
                {monogramText}
              </div>
            </div>

            {/* Center / Lower Editorial Title on Left Panel */}
            <div className="relative z-10 my-auto py-12 max-w-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-[#B8926A] font-semibold mb-4">
                The Wedding Celebration Of
              </p>
              <h1 className="font-serif text-6xl xl:text-7xl 2xl:text-8xl font-light leading-[1.05] tracking-tight text-white mb-6">
                {brideNick} <span className="font-serif italic font-normal text-[#F5F2EB]/80">&amp;</span> {groomNick}
              </h1>
              <div className="h-[1px] w-24 bg-[#B8926A]/80 mb-6" />
              <p className="font-serif italic text-xl xl:text-2xl text-[#F5F2EB]/90 font-light leading-relaxed mb-8">
                &quot;Two souls with but a single thought, two hearts that beat as one.&quot;
              </p>

              {/* Wedding Date & Venue Chip */}
              <div className="inline-flex items-center gap-6 bg-[#22201E]/60 backdrop-blur-md border border-white/15 px-6 py-3.5 rounded-full text-[#F5F2EB]/90 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#B8926A]" />
                  <span className="font-medium tracking-wide">{primaryEventDateStr}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-[#F5F2EB]/40" />
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#B8926A]" />
                  <span className="text-[#F5F2EB]/80">{primaryEvent?.venueName || "Jakarta, Indonesia"}</span>
                </div>
              </div>
            </div>

            {/* Bottom Panel Note on Left Panel */}
            <div className="relative z-10 flex items-center justify-between text-xs text-[#F5F2EB]/70 tracking-widest uppercase border-t border-white/15 pt-6">
              <span>Editorial Tema 01</span>
              <span>Scroll Right to Explore Invitation ↓</span>
            </div>
          </aside>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT PANEL: 40-42% Width on Desktop / 100% on Mobile Frame              */}
        {/* ----------------------------------------------------------------------- */}
        <main
          className={`w-full ${
            !isEmbedded ? "lg:w-[42%] xl:w-[40%]" : "max-w-[480px] mx-auto"
          } bg-[#22201E] lg:bg-[#F5F2EB] flex flex-col justify-start items-center relative ${
            isCoverDismissed ? "overflow-y-auto lg:h-screen" : "overflow-hidden h-screen"
          } no-scrollbar shadow-inner`}
        >
          {/* =================================================================== */}
          {/* FULL SCREEN / RIGHT-PANEL COVER OVERLAY                             */}
          {/* =================================================================== */}
          {!isCoverDismissed && (
            <div
              className={`fixed lg:absolute inset-0 z-50 w-full h-[100dvh] lg:h-full bg-[#FAF8F5] flex flex-col justify-between items-center px-4 py-5 sm:py-6 select-none overflow-hidden shadow-2xl transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                isCoverSliding ? "-translate-y-full" : "translate-y-0"
              }`}
              style={{
                backgroundImage: `radial-gradient(circle at 50% 15%, rgba(184, 146, 106, 0.08) 0%, transparent 60%)`,
              }}
            >
              {/* Top Monogram Badge & Title */}
              <div className="z-10 pt-2 sm:pt-4 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#F5F2EB] border border-[#E2DDD4] monogram-ring flex items-center justify-center mb-3 shadow-soft">
                  <span className="font-serif italic font-bold text-base tracking-wider text-[#22201E]">
                    {monogramText}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#6B6760] font-medium">
                  The Wedding Celebration Of
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#22201E] tracking-tight mt-1">
                  {brideNick} <span className="italic font-light text-[#9E9688]">&amp;</span> {groomNick}
                </h1>
              </div>

              {/* Cover Center Arch Image */}
              <div className="z-10 my-auto py-2 px-4 w-full flex justify-center">
                <div className="relative w-44 sm:w-52 h-56 sm:h-64 arch-mask overflow-hidden border border-[#E2DDD4] shadow-soft bg-[#F5F2EB] p-1.5 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImageSrc}
                    alt={`${coupleDisplayName} Portrait`}
                    className="w-full h-full object-cover arch-mask filter contrast-[1.03]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/templates/editorial/cover.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent arch-mask pointer-events-none" />
                  <div className="absolute bottom-3 inset-x-0 text-center text-white/95 text-[11px] tracking-[0.2em] uppercase font-light">
                    {primaryEventDateStr}
                  </div>
                </div>
              </div>

              {/* Recipient Greeting Card & Buka Undangan CTA Button */}
              <div className="z-10 w-full max-w-sm bg-[#F5F2EB]/95 border border-[#E2DDD4] rounded-2xl p-4 sm:p-5 text-center shadow-soft">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#6B6760] font-medium mb-1">
                  Kepada Yth. Bapak/Ibu/Saudara/i:
                </p>
                <div className="my-2 py-2 px-3 bg-white/90 rounded-xl border border-[#E2DDD4]/80 inline-block w-full">
                  <h3 id="guestName" className="font-serif text-xl sm:text-2xl font-semibold text-[#22201E]">
                    {guestName || "Tamu Undangan Terhormat"}
                  </h3>
                  <p className="text-[11px] text-[#6B6760] mt-0.5">di Tempat</p>
                </div>
                <p className="text-[10px] text-[#6B6760]/85 italic mb-4 leading-relaxed">
                  *Merupakan suatu kehormatan dan kebahagiaan bagi kami atas kehadiran dan doa restu Anda.
                </p>

                {/* CTA: Open Invitation Button */}
                <button
                  type="button"
                  id="openInvitationBtn"
                  onClick={handleOpenInvitation}
                  className="w-full bg-[#22201E] hover:bg-[#3A3632] active:scale-[0.98] text-[#F5F2EB] py-3.5 px-6 rounded-full text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  <MailOpen className="w-4 h-4 text-[#B8926A] transition-transform group-hover:scale-110" />
                  <span>Buka Undangan</span>
                </button>
              </div>

              {/* Watermark at bottom */}
              <div className="z-10 pt-2 shrink-0 text-center">
                <span className="text-[9px] text-[#9E9688] uppercase tracking-widest font-sans">
                  Invity by Fasaro • Editorial Collection
                </span>
              </div>
            </div>
          )}

          {/* Constrained Mobile Content Wrapper (Max width 480px on desktop) */}
          <div
            id="invitationContent"
            className="w-full max-w-[480px] min-h-screen bg-[#F5F2EB] border-x border-[#E2DDD4]/60 flex flex-col relative pb-28"
          >
            {/* Mobile Sticky Top Bar */}
            <header className="sticky top-0 left-0 right-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E2DDD4] px-4 py-2.5 flex items-center justify-between w-full shadow-xs">
              <div className="flex items-center gap-2">
                <span className="font-serif italic font-bold text-sm text-[#22201E]">{monogramText}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#6B6760] font-medium border-l border-[#E2DDD4] pl-2">
                  The Wedding of {brideNick} &amp; {groomNick}
                </span>
              </div>
              {isFeatureAvailable("qr_ticket", { data, forcedThemeId: "editorial" }) && (
                <button
                  type="button"
                  onClick={() => setShowQrTicketModal(true)}
                  className="px-2.5 py-1 rounded-full bg-[#22201E] text-white text-[10px] uppercase tracking-wider font-medium flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-[#3A3632] transition-colors"
                >
                  <QrCode className="w-3 h-3 text-[#B8926A]" />
                  <span>Buka QR</span>
                </button>
              )}
            </header>

            {/* SECTION 1: WELCOME HERO (REVEALED WHEN COVER IS OPENED) */}
            <section
              id="home"
              className="w-full flex flex-col items-center justify-center text-center px-6 pt-8 pb-10 bg-[#FAF8F5] relative overflow-hidden border-b border-[#E2DDD4]"
            >
              <div className="w-12 h-12 rounded-full bg-[#F5F2EB] border border-[#E2DDD4] monogram-ring flex items-center justify-center mb-4 shadow-soft">
                <span className="font-serif italic font-bold text-base text-[#22201E]">
                  {monogramText}
                </span>
              </div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#6B6760] font-medium mb-1">
                The Wedding Celebration Of
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#22201E] tracking-tight leading-tight mb-3">
                {brideNick} <span className="italic font-light text-[#9E9688]">&amp;</span> {groomNick}
              </h1>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5F2EB] border border-[#E2DDD4] mb-6 shadow-xs text-xs text-[#22201E]">
                <Calendar className="w-3.5 h-3.5 text-[#B8926A]" />
                <span className="font-medium">{primaryEventDateStr}</span>
              </div>

              {/* Arch Mask Hero Couple Portrait */}
              <div className="relative mx-auto w-52 sm:w-60 h-68 sm:h-76 arch-mask overflow-hidden border border-[#E2DDD4] shadow-soft bg-[#F5F2EB] p-2 mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImageSrc}
                  alt={`${coupleDisplayName} Portrait`}
                  className="w-full h-full object-cover arch-mask filter contrast-[1.03]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/templates/editorial/cover.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent arch-mask pointer-events-none" />
                <div className="absolute bottom-3 inset-x-0 text-center text-white/90 text-xs tracking-[0.2em] uppercase font-light">
                  {primaryEventDateStr}
                </div>
              </div>

              <p className="font-serif italic text-base sm:text-lg text-[#22201E]/80 max-w-xs mx-auto leading-relaxed font-light">
                &quot;Two souls with but a single thought, two hearts that beat as one.&quot;
              </p>
            </section>

            {/* FEATURE: QR TICKET PASS BADGE */}
            {isFeatureAvailable("qr_ticket", { data, forcedThemeId: "editorial" }) && (
              <div className="p-4 sm:p-5 border-b border-[#E2DDD4] bg-[#FAF8F5]">
                <div className="bg-[#F5F2EB] border border-[#B8926A]/40 rounded-xl p-4 flex items-center justify-between gap-3 shadow-soft">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8926A] font-semibold">Tiket Masuk Resepsi</p>
                    <h4 className="font-serif text-lg font-bold text-[#22201E]">{guestName || "Tamu Undangan"}</h4>
                    <p className="text-[11px] text-[#6B6760]">Tunjukkan QR Code di meja resepsi</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQrTicketModal(true)}
                    className="px-3.5 py-2 rounded-full bg-[#22201E] hover:bg-[#3A3632] text-white text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#B8926A]" />
                    <span>Buka QR</span>
                  </button>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 2: HERO HEADER & REAL-TIME LIVE COUNTDOWN                   */}
            {/* =================================================================== */}
            {isFeatureAvailable("countdown", { data, forcedThemeId: "editorial" }) && (
              <section
                ref={heroSectionRef}
                id="heroSection"
                className="p-8 sm:p-10 text-center border-b border-[#E2DDD4] bg-[#F5F2EB] relative"
              >
                <div className="max-w-md mx-auto space-y-3">
                  <span className="text-[11px] uppercase tracking-[0.3em] text-[#B8926A] font-semibold">
                    Hitung Mundur Hari Bahagia
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#22201E]">
                    Menuju Ikrar Suci
                  </h2>
                  <p className="text-xs text-[#6B6760]">
                    Setiap detik berharga menghitung langkah menuju hari bahagia kami:
                  </p>

                  {/* Real-time Live Countdown Cards */}
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 pt-4">
                    <div className="bg-[#FAF8F5] border border-[#E2DDD4] rounded-xl p-3 shadow-soft">
                      <span className="font-serif text-2xl sm:text-3xl font-bold text-[#22201E] block">
                        {timeLeft.days}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-[#6B6760] font-medium">
                        Hari
                      </span>
                    </div>
                    <div className="bg-[#FAF8F5] border border-[#E2DDD4] rounded-xl p-3 shadow-soft">
                      <span className="font-serif text-2xl sm:text-3xl font-bold text-[#22201E] block">
                        {timeLeft.hours}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-[#6B6760] font-medium">
                        Jam
                      </span>
                    </div>
                    <div className="bg-[#FAF8F5] border border-[#E2DDD4] rounded-xl p-3 shadow-soft">
                      <span className="font-serif text-2xl sm:text-3xl font-bold text-[#22201E] block">
                        {timeLeft.minutes}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-[#6B6760] font-medium">
                        Menit
                      </span>
                    </div>
                    <div className="bg-[#FAF8F5] border border-[#E2DDD4] rounded-xl p-3 shadow-soft">
                      <span className="font-serif text-2xl sm:text-3xl font-bold text-[#B8926A] block">
                        {timeLeft.seconds}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-[#6B6760] font-medium">
                        Detik
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================================== */}
            {/* SECTION 3: MONOGRAM & SCRIPTURE (QUOTE)                             */}
            {/* =================================================================== */}
            <section className="p-8 sm:p-10 text-center border-b border-[#E2DDD4] bg-[#F5F2EB] relative">
              {/* Monogram Ring */}
              <div className="inline-flex w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#E2DDD4] monogram-ring items-center justify-center mx-auto mb-6">
                <span className="font-serif italic font-bold text-base text-[#22201E]">
                  {monogramText}
                </span>
              </div>

              <div className="max-w-md mx-auto">
                <p className="font-serif text-lg sm:text-xl text-[#22201E] tracking-wide leading-loose mb-3 max-w-md mx-auto" dir="rtl">
                  وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعELَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً
                </p>
                <p className="font-serif italic text-base sm:text-lg text-[#1E1C1A]/90 leading-relaxed font-normal">
                  &quot;{data.coupleInfo.greetingMessage ||
                    "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."}&quot;
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <span className="w-8 h-[1px] bg-[#9E9688]/40" />
                  <span className="text-xs tracking-[0.25em] uppercase font-semibold text-[#6B6760]">
                    QS. Ar-Rum: 21
                  </span>
                  <span className="w-8 h-[1px] bg-[#9E9688]/40" />
                </div>
              </div>
            </section>

            {/* =================================================================== */}
            {/* SECTION 4: BRIDE & GROOM PROFILE                                    */}
            {/* =================================================================== */}
            <section id="mempelai" className="p-6 sm:p-8 border-b border-[#E2DDD4] bg-[#FAF8F5]">
              <div className="text-center mb-10">
                <span className="text-[11px] uppercase tracking-[0.3em] text-[#B8926A] font-semibold">
                  Groom &amp; Bride
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#22201E] mt-1">
                  Mempelai Bahagia
                </h2>
                <p className="text-xs text-[#6B6760] mt-2 max-w-xs mx-auto leading-relaxed">
                  Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud melangsungkan pernikahan putra-putri kami:
                </p>
              </div>

              {/* The Bride Card */}
              <div className="bg-[#F5F2EB] border border-[#E2DDD4] rounded-2xl p-6 text-center shadow-soft mb-8 transition-transform hover:shadow-md">
                <div className="w-44 h-56 mx-auto arch-mask overflow-hidden border border-[#E2DDD4] shadow-soft bg-[#FAF8F5] p-1.5 mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bridePhotoSrc}
                    alt={brideFullName}
                    className="w-full h-full object-cover arch-mask filter contrast-[1.02]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/templates/editorial/bride.jpg";
                    }}
                  />
                </div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#9E9688] font-semibold bg-[#9E9688]/10 px-3 py-1 rounded-full inline-block mb-2">
                  The Bride
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#22201E]">
                  {brideFullName}
                </h3>
                <p className="text-xs text-[#6B6760] mt-2 leading-relaxed font-light">
                  Putri Pertama dari<br />
                  <strong className="font-medium text-[#1E1C1A]">{brideParents}</strong>
                </p>
                {data.coupleInfo.brideInstagram && (
                  <div className="mt-4 pt-4 border-t border-[#E2DDD4] flex justify-center">
                    <a
                      href={`https://instagram.com/${data.coupleInfo.brideInstagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E2DDD4] bg-[#FAF8F5] text-xs text-[#6B6760] hover:text-[#22201E] hover:border-[#9E9688] transition-colors"
                    >
                      <InstagramIcon className="w-3.5 h-3.5 text-[#9E9688]" />
                      <span>@{data.coupleInfo.brideInstagram.replace("@", "")}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Center Delicate Ampersand Divider */}
              <div className="flex items-center justify-center my-6">
                <span className="w-16 h-[1px] bg-[#E2DDD4]" />
                <span className="mx-4 font-serif italic text-3xl text-[#9E9688] font-light">&amp;</span>
                <span className="w-16 h-[1px] bg-[#E2DDD4]" />
              </div>

              {/* The Groom Card */}
              <div className="bg-[#F5F2EB] border border-[#E2DDD4] rounded-2xl p-6 text-center shadow-soft transition-transform hover:shadow-md">
                <div className="w-44 h-56 mx-auto arch-mask overflow-hidden border border-[#E2DDD4] shadow-soft bg-[#FAF8F5] p-1.5 mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={groomPhotoSrc}
                    alt={groomFullName}
                    className="w-full h-full object-cover arch-mask filter contrast-[1.02]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/templates/editorial/groom.jpg";
                    }}
                  />
                </div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#9E9688] font-semibold bg-[#9E9688]/10 px-3 py-1 rounded-full inline-block mb-2">
                  The Groom
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#22201E]">
                  {groomFullName}
                </h3>
                <p className="text-xs text-[#6B6760] mt-2 leading-relaxed font-light">
                  Putra Pertama dari<br />
                  <strong className="font-medium text-[#1E1C1A]">{groomParents}</strong>
                </p>
                {data.coupleInfo.groomInstagram && (
                  <div className="mt-4 pt-4 border-t border-[#E2DDD4] flex justify-center">
                    <a
                      href={`https://instagram.com/${data.coupleInfo.groomInstagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E2DDD4] bg-[#FAF8F5] text-xs text-[#6B6760] hover:text-[#22201E] hover:border-[#9E9688] transition-colors"
                    >
                      <InstagramIcon className="w-3.5 h-3.5 text-[#9E9688]" />
                      <span>@{data.coupleInfo.groomInstagram.replace("@", "")}</span>
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================================== */}
            {/* SECTION 5: EVENT DETAILS & SCHEDULE                                 */}
            {/* =================================================================== */}
            <section id="acara" className="p-6 sm:p-8 border-b border-[#E2DDD4] bg-[#F5F2EB]">
              <div className="text-center mb-8">
                <span className="text-[11px] uppercase tracking-[0.3em] text-[#B8926A] font-semibold">
                  Waktu &amp; Lokasi
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#22201E] mt-1">
                  Rangkaian Acara
                </h2>
                <p className="text-xs text-[#6B6760] mt-2">
                  Kebahagiaan kami akan terasa lebih lengkap dengan kehadiran Anda
                </p>
              </div>

              {/* Event Cards (Dynamic: supports 1, 2, 3+ events) */}
              {schedules.map((ev, idx) => {
                const sessionDateStr = formatWeddingDate(ev.date);

                return (
                  <div
                    key={`ev-${idx}`}
                    className="bg-[#FAF8F5] border border-[#E2DDD4] rounded-2xl p-6 mb-6 shadow-soft relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-[#E2DDD4] mb-4">
                      <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#9E9688]">
                        Acara 0{idx + 1}
                      </span>
                      <span className="text-xs font-mono text-[#6B6760]">
                        {ev.startTime || "08:00"} — {ev.endTime || "Selesai"}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#22201E]">
                      {ev.eventName}
                    </h3>
                    <p className="text-xs text-[#6B6760] mt-1">{sessionDateStr}</p>

                    <div className="mt-4 bg-[#F5F2EB]/70 rounded-xl p-3.5 border border-[#E2DDD4] text-xs">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#B8926A] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#1E1C1A]">
                            {ev.venueName || "Lokasi Acara"}
                          </p>
                          <p className="text-[11px] text-[#6B6760] mt-0.5 leading-relaxed">
                            {ev.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <a
                        href={ev.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${ev.venueName} ${ev.address}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-[#9E9688] text-[#9E9688] hover:bg-[#9E9688] hover:text-white text-xs uppercase tracking-wider font-medium transition-all"
                      >
                        <span>Buka Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {isFeatureAvailable("google_maps", { data, forcedThemeId: "editorial" }) && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-[#E2DDD4]">
                        <GoogleMapEmbed
                          venueName={ev.venueName || "Lokasi Acara"}
                          address={ev.address || "Jakarta, Indonesia"}
                          mapsUrl={ev.mapsUrl}
                          latitude={ev.latitude}
                          longitude={ev.longitude}
                          heightClass="h-48 sm:h-52"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Dress Code Advisory & Swatches */}
              <div className="bg-[#F5F2EB] border border-[#E2DDD4] rounded-2xl p-5 mb-4 text-center">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#6B6760] font-medium">
                  Dress Code Guide
                </span>
                <h4 className="font-serif text-lg font-medium text-[#22201E] mt-0.5">
                  Earthy &amp; Neutral Formal
                </h4>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-7 h-7 rounded-full bg-[#22201E] border border-[#E2DDD4] shadow-inner" />
                    <span className="text-[9px] text-[#6B6760]">Charcoal</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-7 h-7 rounded-full bg-[#9E9688] border border-[#E2DDD4] shadow-inner" />
                    <span className="text-[9px] text-[#6B6760]">Taupe</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-7 h-7 rounded-full bg-[#B8926A] border border-[#E2DDD4] shadow-inner" />
                    <span className="text-[9px] text-[#6B6760]">Champagne</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-7 h-7 rounded-full bg-[#ECE9E2] border border-[#E2DDD4] shadow-inner" />
                    <span className="text-[9px] text-[#6B6760]">Linen</span>
                  </div>
                </div>
              </div>

              {/* Live Streaming Card */}
              {rawYoutubeUrl && (
                <div className="bg-[#22201E] text-[#F5F2EB] rounded-2xl p-5 border border-[#3A3632] text-center">
                  <div className="w-9 h-9 rounded-full bg-[#B8926A]/20 text-[#B8926A] mx-auto flex items-center justify-center mb-3">
                    <Tv className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif text-lg text-white">Live Streaming Pernikahan</h4>
                  <p className="text-xs text-[#F5F2EB]/70 mt-1 max-w-xs mx-auto">
                    Bagi keluarga &amp; sahabat yang berhalangan hadir secara langsung, silakan saksikan siaran langsung pernikahan kami.
                  </p>
                  <a
                    href={rawYoutubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 py-2 px-5 rounded-full bg-[#B8926A] text-[#22201E] font-semibold text-xs uppercase tracking-wider hover:bg-[#B8926A]/90 transition-colors"
                  >
                    <span>Ikuti Live Streaming</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </section>

            {/* =================================================================== */}
            {/* SECTION 6: SAVE THE DATE & ADD TO CALENDAR                          */}
            {/* =================================================================== */}
            <section className="p-6 sm:p-8 border-b border-[#E2DDD4] bg-[#FAF8F5] text-center">
              <div className="bg-[#F5F2EB] border border-[#E2DDD4] rounded-2xl p-6 shadow-soft">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#9E9688] font-semibold">
                  Pengingat Tanggal
                </span>
                <h3 className="font-serif text-3xl font-light text-[#22201E] mt-1">
                  Simpan di Kalender
                </h3>
                <p className="text-xs text-[#6B6760] mt-2 max-w-xs mx-auto">
                  Jangan lewatkan momen istimewa kami. Tambahkan tanggal pernikahan ke Google Calendar Anda.
                </p>

                <a
                  href={generateGoogleCalendarUrl(
                    `Pernikahan ${coupleDisplayName}`,
                    primaryEvent?.date || "2027-12-28",
                    primaryEvent?.startTime || "08:00",
                    primaryEvent?.venueName || "Jakarta"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center gap-2 bg-[#22201E] hover:bg-[#2C2927] text-[#F5F2EB] py-3 px-6 rounded-full text-xs uppercase tracking-wider font-medium transition-all shadow-md active:scale-95"
                >
                  <Calendar className="w-4 h-4 text-[#B8926A]" />
                  <span>+ Tambahkan ke Google Calendar</span>
                </a>
              </div>
            </section>

            {/* =================================================================== */}
            {/* SECTION 7: LOVE STORY TIMELINE                                      */}
            {/* =================================================================== */}
            {isFeatureAvailable("love_story", { data, forcedThemeId: "editorial" }) && (
              <section className="p-6 sm:p-8 border-b border-[#E2DDD4] bg-[#F5F2EB]">
                <div className="text-center mb-10">
                  <span className="text-[11px] uppercase tracking-[0.3em] text-[#B8926A] font-semibold">
                    Perjalanan Kasih
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#22201E] mt-1">
                    Our Love Story
                  </h2>
                  <p className="text-xs text-[#6B6760] mt-2">
                    Sepenggal kisah yang membawa kami hingga ke titik ini
                  </p>
                </div>

                {/* Vertical Stepper Timeline */}
                <div className="relative pl-6 sm:pl-8 border-l border-[#9E9688]/30 space-y-8 ml-3">
                  {(data.coupleInfo.stories && data.coupleInfo.stories.length > 0
                    ? data.coupleInfo.stories.map((st) => ({
                        year: st.date || "Kisah Kasih",
                        tagline: "Momen Bahagia",
                        title: st.title,
                        story: st.story,
                      }))
                    : DEFAULT_EDITORIAL_STORIES
                  ).map((milestone, idx) => (
                    <div key={`ms-${idx}`} className="relative">
                      <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#FAF8F5] border-2 border-[#9E9688] shadow-sm" />
                      <div className="bg-[#FAF8F5] border border-[#E2DDD4] rounded-2xl p-5 shadow-soft">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] tracking-widest uppercase font-bold text-[#9E9688]">
                            {milestone.year}
                          </span>
                          <span className="text-xs font-serif italic text-[#6B6760]">
                            {milestone.tagline}
                          </span>
                        </div>
                        <h4 className="font-serif text-xl font-semibold text-[#22201E]">
                          {milestone.title}
                        </h4>
                        <p className="text-xs text-[#6B6760] mt-2 leading-relaxed">
                          {milestone.story}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* =================================================================== */}
            {/* SECTION 8: MEDIA & PHOTO GALLERY                                    */}
            {/* =================================================================== */}
            {isFeatureAvailable("gallery", { data, forcedThemeId: "editorial" }) && (
              <section id="galeri" className="p-6 sm:p-8 border-b border-[#E2DDD4] bg-[#FAF8F5]">
                <div className="text-center mb-8">
                  <span className="text-[11px] uppercase tracking-[0.3em] text-[#B8926A] font-semibold">
                    Galeri Kenangan
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#22201E] mt-1">
                    Prewedding Moments
                  </h2>
                  <p className="text-xs text-[#6B6760] mt-2">
                    Momen-momen indah yang kami abadikan dalam kehangatan cinta
                  </p>
                </div>

                {/* Video Showcase Embed Container */}
                {youtubeCoverId ? (
                  <div className="mb-6 rounded-2xl overflow-hidden border border-[#E2DDD4] shadow-soft bg-[#22201E] relative">
                    <div className="aspect-video w-full relative">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${youtubeCoverId}?rel=0`}
                        title="Wedding Video Showcase"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : null}

                {/* Photo Masonry Preview Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {galleryList.slice(0, 4).map((photo, idx) => {
                    const isWide = idx === 2 || idx === 3;
                    return (
                      <div
                        key={`gal-${idx}`}
                        onClick={() => setLightboxImg(photo.url)}
                        className={`${
                          isWide ? "col-span-2 rounded-2xl h-48" : "arch-mask h-48"
                        } overflow-hidden border border-[#E2DDD4] shadow-sm bg-[#F5F2EB] cursor-pointer group`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/templates/editorial/cover.jpg";
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-[11px] text-[#6B6760] italic">
                  Sentuh foto untuk memperbesar tampilan
                </p>
              </section>
            )}

            {/* =================================================================== */}
            {/* SECTION 9: DIGITAL GIFT (WEDDING GIFT)                              */}
            {/* =================================================================== */}
            {Boolean(
              isFeatureAvailable("digital_gift", { data, forcedThemeId: "editorial" }) ||
                (giftShippingAddress && isFeatureAvailable("physical_gift", { data, forcedThemeId: "editorial" }))
            ) && (
              <section id="hadiah" className="p-6 sm:p-8 border-b border-[#E2DDD4] bg-[#F5F2EB]">
                <div className="text-center mb-8">
                  <span className="text-[11px] uppercase tracking-[0.3em] text-[#B8926A] font-semibold">
                    Tanda Kasih
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#22201E] mt-1">
                    Wedding Gift
                  </h2>
                  <p className="text-xs text-[#6B6760] mt-2 max-w-xs mx-auto leading-relaxed">
                    Doa restu Anda merupakan karunia terindah bagi kami. Namun jika ingin memberikan tanda kasih secara digital, Anda dapat melalui rekening di bawah ini:
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Bank Account Cards */}
                  {isFeatureAvailable("digital_gift", { data, forcedThemeId: "editorial" }) && (
                    <>
                      {activeBankList.map((acc, idx) => (
                        <div
                          key={acc.id || `bank-${idx}`}
                          className="bg-[#FAF8F5] border border-[#E2DDD4] rounded-2xl p-5 shadow-soft"
                        >
                          <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD4]">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-[#B8926A]/10 flex items-center justify-center font-bold text-xs text-[#B8926A]">
                                {acc.bankName.slice(0, 3).toUpperCase()}
                              </div>
                              <span className="text-xs font-semibold text-[#22201E]">{acc.bankName}</span>
                            </div>
                            <span className="text-[10px] text-[#6B6760] tracking-wider uppercase">
                              Transfer Bank
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div>
                              <p className="text-[11px] text-[#6B6760]">Nomor Rekening:</p>
                              <p className="font-mono text-base font-bold text-[#1E1C1A] tracking-wider">
                                {acc.accountNumber}
                              </p>
                              <p className="text-xs text-[#6B6760] mt-0.5">a.n {acc.accountHolder}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(acc.accountNumber, "Nomor Rekening")}
                              className="px-3.5 py-1.5 rounded-full border border-[#E2DDD4] bg-[#F5F2EB] hover:bg-[#9E9688] hover:text-white text-xs text-[#6B6760] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Physical Gift Address */}
                  {giftShippingAddress && isFeatureAvailable("physical_gift", { data, forcedThemeId: "editorial" }) && (
                    <div className="bg-[#FAF8F5] border border-[#E2DDD4] rounded-2xl p-5 shadow-soft">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD4]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#9E9688]/10 flex items-center justify-center text-[#9E9688]">
                            <Heart className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-semibold text-[#22201E]">Kirim Kado Fisik</span>
                        </div>
                        <span className="text-[10px] text-[#6B6760] tracking-wider uppercase">
                          Alamat Penerima
                        </span>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-[#1E1C1A] leading-relaxed">
                          {giftShippingAddress} (Penerima: {giftRecipientName} / {giftPhoneNumber})
                        </p>
                        <div className="mt-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                `${giftShippingAddress} (Penerima: ${giftRecipientName} / ${giftPhoneNumber})`,
                                "Alamat Kado"
                              )
                            }
                            className="px-3.5 py-1.5 rounded-full border border-[#E2DDD4] bg-[#F5F2EB] hover:bg-[#9E9688] hover:text-white text-xs text-[#6B6760] transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Alamat</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* =================================================================== */}
            {/* SECTION 10: RSVP & WISHES GUESTBOOK                                 */}
            {/* =================================================================== */}
            {Boolean(
              isFeatureAvailable("rsvp", { data, forcedThemeId: "editorial" }) ||
                isFeatureAvailable("wishes", { data, forcedThemeId: "editorial" })
            ) && (
              <section id="rsvp" className="p-6 sm:p-8 border-b border-[#E2DDD4] bg-[#FAF8F5]">
                <div className="text-center mb-8">
                  <span className="text-[11px] uppercase tracking-[0.3em] text-[#B8926A] font-semibold">
                    Konfirmasi Kehadiran
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#22201E] mt-1">
                    RSVP &amp; Ucapan
                  </h2>
                  <p className="text-xs text-[#6B6760] mt-2">
                    Mohon konfirmasi kehadiran Anda demi kelancaran persiapan acara
                  </p>
                </div>

                {/* RSVP Form */}
                {isFeatureAvailable("rsvp", { data, forcedThemeId: "editorial" }) && (
                  <form
                    onSubmit={handleRsvpSubmit}
                    className="bg-[#F5F2EB] border border-[#E2DDD4] rounded-2xl p-6 shadow-soft space-y-4 mb-8"
                  >
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#6B6760] font-semibold mb-1.5">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        required
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        placeholder="Masukkan nama lengkap Anda"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E2DDD4] bg-[#FAF8F5] text-xs text-[#1E1C1A] focus:outline-none focus:border-[#9E9688] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#6B6760] font-semibold mb-1.5">
                        Konfirmasi Kehadiran
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label
                          className={`cursor-pointer border border-[#E2DDD4] rounded-xl p-3 flex items-center justify-center gap-2 transition-all text-xs ${
                            rsvpAttendance === "Hadir"
                              ? "bg-[#9E9688] text-white border-[#9E9688]"
                              : "bg-[#FAF8F5] text-[#1E1C1A]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="attendance"
                            value="Hadir"
                            checked={rsvpAttendance === "Hadir"}
                            onChange={() => setRsvpAttendance("Hadir")}
                            className="hidden"
                          />
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-medium">Ya, Saya Hadir</span>
                        </label>
                        <label
                          className={`cursor-pointer border border-[#E2DDD4] rounded-xl p-3 flex items-center justify-center gap-2 transition-all text-xs ${
                            rsvpAttendance === "Tidak Hadir"
                              ? "bg-[#22201E] text-white border-[#22201E]"
                              : "bg-[#FAF8F5] text-[#1E1C1A]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="attendance"
                            value="Tidak Hadir"
                            checked={rsvpAttendance === "Tidak Hadir"}
                            onChange={() => setRsvpAttendance("Tidak Hadir")}
                            className="hidden"
                          />
                          <X className="w-4 h-4" />
                          <span className="font-medium">Maaf, Berhalangan</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#6B6760] font-semibold mb-1.5">
                        Jumlah Kehadiran
                      </label>
                      <select
                        value={rsvpCount}
                        onChange={(e) => setRsvpCount(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E2DDD4] bg-[#FAF8F5] text-xs text-[#1E1C1A] focus:outline-none focus:border-[#9E9688] transition-colors"
                      >
                        <option value="1 Orang">1 Orang</option>
                        <option value="2 Orang">2 Orang</option>
                        <option value="3 Orang">3 Orang</option>
                        <option value="4 Orang">4 Orang</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#6B6760] font-semibold mb-1.5">
                        Ucapan &amp; Doa Restu
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={rsvpMessage}
                        onChange={(e) => setRsvpMessage(e.target.value)}
                        placeholder="Tuliskan pesan & doa restu untuk kedua mempelai..."
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E2DDD4] bg-[#FAF8F5] text-xs text-[#1E1C1A] focus:outline-none focus:border-[#9E9688] transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#9E9688] hover:bg-[#857D70] text-white py-3 rounded-full text-xs uppercase tracking-widest font-semibold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSubmitting ? "Mengirim..." : "Kirim Konfirmasi & Doa"}</span>
                    </button>
                  </form>
                )}

                {/* Guestbook Wishes Feed */}
                {isFeatureAvailable("wishes", { data, forcedThemeId: "editorial" }) && (
                  <div className="border-t border-[#E2DDD4] pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-serif text-lg text-[#22201E] font-semibold">Doa Restu Tamu</h4>
                      <span className="text-xs text-[#6B6760] font-mono bg-[#F5F2EB] px-2.5 py-0.5 rounded-full border border-[#E2DDD4]">
                        {wishesList.length} Doa Terkirim
                      </span>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1 no-scrollbar">
                      {wishesList.map((w) => {
                        const initials =
                          w.senderName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase() || "TU";

                        return (
                          <div
                            key={w.id}
                            className="bg-[#F5F2EB] border border-[#E2DDD4] rounded-xl p-4 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#B8926A]/20 text-[#B8926A] flex items-center justify-center text-xs font-bold">
                                  {initials}
                                </div>
                                <span className="text-xs font-semibold text-[#22201E]">
                                  {w.senderName}{" "}
                                  <span className="text-[10px] text-[#6B6760] font-normal">
                                    ({w.guestCount})
                                  </span>
                                </span>
                              </div>
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                                  w.attendance === "Hadir"
                                    ? "bg-[#9E9688]/15 text-[#9E9688]"
                                    : "bg-[#6B6760]/20 text-[#6B6760]"
                                }`}
                              >
                                {w.attendance}
                              </span>
                            </div>
                            <p className="text-xs text-[#1E1C1A]/90 pl-9 font-light leading-relaxed">
                              &quot;{w.message}&quot;
                            </p>
                            <div className="text-[10px] text-[#6B6760]/70 text-right mt-1">
                              {w.timeAgo}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* =================================================================== */}
            {/* SECTION 11: CLOSING & FOOTER                                        */}
            {/* =================================================================== */}
            <footer className="bg-[#22201E] text-[#F5F2EB] p-8 text-center border-t border-[#3A3632] relative overflow-hidden">
              <div className="w-14 h-14 rounded-full bg-[#2C2927] border border-[#3A3632] mx-auto flex items-center justify-center mb-6">
                <span className="font-serif italic font-bold text-lg text-[#B8926A]">
                  {monogramText}
                </span>
              </div>

              <h3 className="font-serif text-3xl font-light text-white mb-2">Terima Kasih</h3>
              <p className="text-xs text-[#F5F2EB]/70 max-w-xs mx-auto leading-relaxed mb-6 font-light">
                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu bagi kami berdua.
              </p>

              <div className="h-[1px] w-20 bg-[#B8926A]/40 mx-auto mb-6" />

              <p className="text-[10px] tracking-[0.3em] uppercase text-[#B8926A] mb-1 font-semibold">
                Kami Yang Berbahagia
              </p>
              <h4 className="font-serif text-2xl text-white font-medium">{coupleDisplayName}</h4>
              <p className="text-xs text-[#F5F2EB]/60 mt-1">Beserta Keluarga Besar Kedua Mempelai</p>

              <div className="mt-10 pt-6 border-t border-[#3A3632]/60 flex flex-col items-center justify-center gap-2 text-[10px] text-[#F5F2EB]/50 tracking-widest uppercase">
                <span>© 2027 {coupleDisplayName} Wedding Invitation</span>
                <span className="text-[#F5F2EB]/30">
                  Invity by Fasaro • Editorial Tema 01
                </span>
              </div>
            </footer>
          </div>

        {/* Mobile Sticky Bottom Nav (Visible when opened) */}
        {isCoverDismissed && (
          <nav
            className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 lg:hidden bg-[#FAF8F5]/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#E2DDD4] shadow-xl flex items-center gap-4 text-xs font-medium text-[#6B6760] animate-in fade-in duration-500"
            aria-label="Navigasi Undangan"
          >
            <a
              href="#home"
              className="flex flex-col items-center p-1 hover:text-[#22201E] transition-colors"
            >
              <Home className="w-4 h-4 text-[#B8926A]" />
              <span className="text-[9px] mt-0.5 font-medium">Beranda</span>
            </a>
            <a
              href="#mempelai"
              className="flex flex-col items-center p-1 hover:text-[#22201E] transition-colors"
            >
              <Heart className="w-4 h-4 text-[#22201E]" />
              <span className="text-[9px] mt-0.5 font-medium">Mempelai</span>
            </a>
            <a
              href="#acara"
              className="flex flex-col items-center p-1 hover:text-[#22201E] transition-colors"
            >
              <Calendar className="w-4 h-4 text-[#B8926A]" />
              <span className="text-[9px] mt-0.5 font-medium">Acara</span>
            </a>
            <a
              href="#galeri"
              className="flex flex-col items-center p-1 hover:text-[#22201E] transition-colors"
            >
              <Camera className="w-4 h-4 text-[#22201E]" />
              <span className="text-[9px] mt-0.5 font-medium">Galeri</span>
            </a>
            <a
              href="#hadiah"
              className="flex flex-col items-center p-1 hover:text-[#22201E] transition-colors"
            >
              <Gift className="w-4 h-4 text-[#B8926A]" />
              <span className="text-[9px] mt-0.5 font-medium">Hadiah</span>
            </a>
            <a
              href="#rsvp"
              className="flex flex-col items-center p-1 hover:text-[#22201E] transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-[#22201E]" />
              <span className="text-[9px] mt-0.5 font-medium">RSVP</span>
            </a>
          </nav>
        )}

        {/* =================================================================== */}
        {/* SECTION 12: FLOATING AUDIO PLAYER WIDGET                            */}
        {/* =================================================================== */}
        {isCoverDismissed && isFeatureAvailable("music", { data, forcedThemeId: "editorial" }) && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 pointer-events-auto">
            <button
              type="button"
              onClick={toggleAudio}
              title={isPlaying ? "Jeda Musik" : "Putar Musik"}
              className="w-12 h-12 rounded-full bg-[#22201E]/95 hover:bg-[#22201E] text-[#B8926A] border border-[#B8926A]/30 shadow-2xl backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer group"
            >
              {/* Spinning Vinyl Disc */}
              <div
                className={`w-8 h-8 rounded-full border border-[#B8926A]/40 flex items-center justify-center ${
                  isPlaying ? "animate-spin-slow" : "paused"
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#B8926A]" />
              </div>
            </button>
            <span className="hidden sm:inline-block bg-[#22201E]/90 text-[#F5F2EB] text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-[#3A3632] backdrop-blur-md shadow-lg font-sans">
              {isPlaying ? "Playing: Romantic Melody" : "Music Paused"}
            </span>
          </div>
        )}
      </main>
      </div>

      {/* ========================================================================= */}
      {/* GUEST QR CODE TICKET MODAL                                               */}
      {/* ========================================================================= */}
      {showQrTicketModal && isFeatureAvailable("qr_ticket", { data, forcedThemeId: "editorial" }) && (
        <div
          onClick={() => setShowQrTicketModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] border border-[#B8926A]/40 rounded-2xl max-w-xs w-full p-6 text-center space-y-4 shadow-2xl relative"
          >
            <button
              onClick={() => setShowQrTicketModal(false)}
              className="absolute top-4 right-4 text-[#6B6760] hover:text-[#22201E] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-2 text-[#22201E]">
              <QrCode className="w-5 h-5 text-[#B8926A]" />
              <span className="font-serif text-xl tracking-wider font-semibold">Tiket Masuk Resepsi</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#B8926A] font-semibold">Tamu Terhormat</p>
              <h4 className="font-serif text-2xl text-[#22201E] mt-1">{guestName || "Tamu Undangan"}</h4>
            </div>
            <div className="bg-white p-3 inline-block mx-auto border border-[#E2DDD4] rounded-xl shadow-soft">
              {qrTicketDataUrl ? (
                <img src={qrTicketDataUrl} alt="QR Code Tamu" className="w-40 h-40 mx-auto" />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-xs text-stone-400">
                  Membuat QR Code...
                </div>
              )}
            </div>
            <p className="text-[11px] text-[#6B6760] leading-relaxed">
              Tunjukkan kode QR ini kepada petugas resepsi di pintu masuk untuk check-in kehadiran.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX MODAL PREVIEW                                                    */}
      {/* ========================================================================= */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImg}
            alt="Preview Galeri"
            className="max-w-full max-h-[85vh] rounded-none object-contain shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white text-[#22201E] flex items-center justify-center hover:bg-[#FAF8F5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING TOAST NOTIFICATION                                               */}
      {/* ========================================================================= */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#22201E] text-white py-2.5 px-5 rounded-none text-xs font-medium shadow-xl transition-all duration-300 z-50 flex items-center gap-2 pointer-events-none ${
          toastMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <CheckCircle2 className="w-4 h-4 text-[#B8926A]" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};

export default EditorialTheme;

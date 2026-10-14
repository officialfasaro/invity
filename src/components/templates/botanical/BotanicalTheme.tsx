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
  Heart,
  Home,
  MapPin,
  Package,
  Palette,
  Pause,
  Play,
  QrCode,
  Share2,
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
  attendance: "Hadir" | "Masih Ragu" | "Tidak Hadir";
  guestCount: string;
  message: string;
}

const DEFAULT_WISHES: LocalWish[] = [
  {
    id: "w-1",
    senderName: "Dimas & Anindya",
    timeAgo: "10 menit lalu",
    attendance: "Hadir",
    guestCount: "2 Orang",
    message:
      "Selamat menempuh hidup baru Mekar & Versa! Semoga cinta kasih selalu membimbing langkah rumah tangga kalian berdua selamanya.",
  },
  {
    id: "w-2",
    senderName: "Rafi Aditya, S.T.",
    timeAgo: "1 jam lalu",
    attendance: "Hadir",
    guestCount: "1 Orang",
    message:
      "Barakallahu lakuma! Sahabat seperjuangan arsitektur akhirnya berlabuh di pelaminan. Sangat berbahagia untuk kalian berdua!",
  },
  {
    id: "w-3",
    senderName: "dr. Clara & Keluarga",
    timeAgo: "3 jam lalu",
    attendance: "Hadir",
    guestCount: "2 Orang",
    message:
      "Doa terbaik kami haturkan untuk Mekar & Versa. Semoga menjadi keluarga sakinah mawaddah warahmah, berlimpah berkah dan sukacita.",
  },
  {
    id: "w-4",
    senderName: "Nabila & Kevin",
    timeAgo: "5 jam lalu",
    attendance: "Masih Ragu",
    guestCount: "1 Orang",
    message:
      "Happy wedding Mekar cantik! Semoga acaranya berjalan lancar tanpa hambatan. Doa terbaik untuk kalian berdua yaa!",
  },
];

const DEFAULT_GALLERY_IMAGES = [
  {
    url: "/templates/botanical/gallery/gallery-1.jpg",
    title: "Ruang Temu & Secangkir Kopi",
    category: "Bandung, Jawa Barat",
  },
  {
    url: "/templates/botanical/gallery/gallery-2.jpg",
    title: "Simbol Ikrar Abadi",
    category: "Cincin Suci",
  },
  {
    url: "/templates/botanical/gallery/gallery-3.jpg",
    title: "Tawa & Bahagia",
    category: "Momen Manis",
  },
  {
    url: "/templates/botanical/gallery/gallery-4.jpg",
    title: "Hutan Pinus Cikole",
    category: "Lembang, Bandung",
  },
  {
    url: "/templates/botanical/gallery/gallery-5.jpg",
    title: "Merajut Asa & Bertumbuh",
    category: "Perjalanan Kasih",
  },
  {
    url: "/templates/botanical/gallery/gallery-6.jpg",
    title: "Satu Janji Selamanya",
    category: "Ikrar Hati",
  },
  {
    url: "/templates/botanical/gallery/gallery-7.jpg",
    title: "Keanggunan Suasana",
    category: "Potret Pengantin",
  },
  {
    url: "/templates/botanical/gallery/gallery-8.jpg",
    title: "Harmoni Langkah Bersama",
    category: "Potret Pengantin",
  },
  {
    url: "/templates/botanical/gallery/gallery-9.jpg",
    title: "Harmoni Alam & Asmara",
    category: "Lanskap Cinta",
  },
  {
    url: "/templates/botanical/gallery/gallery-10.jpg",
    title: "Menatap Hari Bahagia",
    category: "Menuju Pelaminan",
  },
];

interface BotanicalStory {
  date: string;
  title: string;
  story: string;
  imageUrl: string;
  quote: string;
  location: string;
}

const DEFAULT_STORIES: BotanicalStory[] = [
  {
    date: "Bab I • 2020",
    title: "Ruang Temu & Secangkir Kopi",
    story:
      "Bermula dari sebuah proyek kolaborasi desain dan teknik arsitektur di Bandung. Di sela lembar sketsa dan diskusi gagasan, sebuah percakapan hangat membuka ruang bagi dua jiwa yang saling melengkapi.",
    imageUrl: "/templates/botanical/gallery/gallery-1.jpg",
    quote: "“Dari sekadar saling menyapa, hingga menyadari dunia terasa jauh lebih teduh bersama.”",
    location: "Bandung, Jawa Barat",
  },
  {
    date: "Bab II • 2021",
    title: "Menapaki Jejak & Tawa",
    story:
      "Berbagi cerita di bawah rindangnya pepohonan Pinus Cikole. Kami menyadari bahwa kebahagiaan sejati hadir bukan dari kemewahan, melainkan dari tulusnya tawa di setiap langkah kebersamaan.",
    imageUrl: "/templates/botanical/gallery/gallery-4.jpg",
    quote: "“Bersamamu, setiap jalan berkelok terasa seperti petualangan yang penuh rasa syukur.”",
    location: "Cikole, Lembang",
  },
  {
    date: "Bab III • 2022",
    title: "Ujian Jarak & Keteguhan",
    story:
      "Tuntutan pekerjaan sempat memisahkan kami dalam hitungan kilometer. Namun jarak justru menjadi guru terbaik yang mengajarkan arti saling percaya, menjaga doa di setiap sujud, dan merawat rindu.",
    imageUrl: "/templates/botanical/gallery/gallery-3.jpg",
    quote: "“Jarak hanya menguji seberapa jauh kita terpisah, namun doa mendekatkan dua hati yang berpasrah.”",
    location: "Antara Dua Kota",
  },
  {
    date: "Bab IV • 2023",
    title: "Merajut Asa & Bertumbuh",
    story:
      "Melalui dinamika cita-cita dan kedewasaan pikiran. Belajar mendengarkan serta meneguhkan hati dalam setiap langkah karier dan pendewasaan diri bersama untuk masa depan yang berkah.",
    imageUrl: "/templates/botanical/gallery/gallery-5.jpg",
    quote: "“Dua langkah yang menyelaraskan ritme detak, berjalan beriringan menuju satu tujuan abadi.”",
    location: "Perjalanan Kasih",
  },
  {
    date: "Bab V • 2024",
    title: "Pertemuan Dua Keluarga",
    story:
      "Momen sakral ketika kedua keluarga besar duduk melingkar dalam kehangatan silaturahmi. Senyuman restu dari ayah dan ibu menjadi gerbang restu semesta yang paling menenteramkan sanubari kami.",
    imageUrl: "/templates/botanical/gallery/gallery-2.jpg",
    quote: "“Cinta kami tidak hanya menyatukan dua insan, melainkan merajut dua keluarga dalam ikatan suci.”",
    location: "Silaturahmi Keluarga",
  },
  {
    date: "Bab VI • 2025",
    title: "Satu Janji Selamanya",
    story:
      "Di bawah semburat hangat lembayung senja, sebuah cincin tersemat sebagai ikrar tulus untuk melangkah memasuki gerbang pernikahan suci, berpayung doa restu kedua orang tua tercinta.",
    imageUrl: "/templates/botanical/gallery/gallery-6.jpg",
    quote: "“Bismillah, dengan penuh kerendahan hati kami memilih satu sama lain untuk selamanya.”",
    location: "Lamaran & Janji Suci",
  },
  {
    date: "Bab VII • 2026",
    title: "Menuju Gerbang Ijab Suci",
    story:
      "Hari demi hari kami lalui dengan penuh rasa syukur dan doa yang tak putus. Menyiapkan hari bahagia di mana dua janji terucap di hadapan Sang Maha Kuasa, memulai lembaran ibadah terpanjang dalam hidup kami.",
    imageUrl: "/templates/botanical/gallery/gallery-10.jpg",
    quote: "“Menghitung hari menuju detik terindah, di mana ‘aku’ dan ‘kamu’ bermutasi menjadi ‘kita’.”",
    location: "Ijab Qabul & Walimah",
  },
  {
    date: "Bab VIII • Masa Depan",
    title: "Menua Bersama dalam Ridho-Nya",
    story:
      "Perjalanan ini adalah awal dari kisah abadi kami. Lembaran masa depan telah menanti untuk kita rangkai bersama dalam keteduhan cinta, kesabaran, dan keberkahan hingga ke jannah.",
    imageUrl: "/templates/botanical/gallery/gallery-7.jpg",
    quote: "“Menua bersamamu adalah doa yang kupanjatkan di setiap sujud panjangku.”",
    location: "Selamanya Bersama",
  },
];

interface FloralCornerProps {
  color: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

const BotanicalFloralCorner: React.FC<FloralCornerProps> = ({
  color,
  position,
  className = "",
}) => {
  if (!color || color === "transparent") return null;

  const transform =
    position === "top-right"
      ? "scale(-1, 1)"
      : position === "bottom-left"
      ? "scale(1, -1)"
      : position === "bottom-right"
      ? "scale(-1, -1)"
      : undefined;

  const positionClasses =
    position === "top-left"
      ? "top-0 left-0"
      : position === "top-right"
      ? "top-0 right-0"
      : position === "bottom-left"
      ? "bottom-0 left-0"
      : "bottom-0 right-0";

  return (
    <svg
      className={`absolute ${positionClasses} pointer-events-none z-0 select-none ${className}`}
      viewBox="0 0 300 300"
      fill="none"
      stroke={color}
      style={{ transform }}
    >
      {/* Primary Vine / Botanical Branch */}
      <path
        d="M 5 5 C 45 40 100 70 170 85 C 220 95 265 85 295 65"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M 5 5 C 40 45 70 100 85 170 C 95 220 85 265 65 295"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M 85 85 C 130 130 185 160 240 170"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />

      {/* Leaves along Top Branch */}
      <path
        d="M 60 48 C 50 25 75 15 95 25 C 90 45 75 52 60 48 Z"
        fill={color}
        fillOpacity="0.32"
        strokeWidth="1"
      />
      <path d="M 60 48 Q 78 30 95 25" strokeWidth="0.8" opacity="0.6" />

      <path
        d="M 120 72 C 125 45 155 42 165 58 C 152 75 132 80 120 72 Z"
        fill={color}
        fillOpacity="0.28"
        strokeWidth="1"
      />
      <path d="M 120 72 Q 142 56 165 58" strokeWidth="0.8" opacity="0.6" />

      <path
        d="M 195 88 C 215 70 242 75 245 92 C 228 102 208 98 195 88 Z"
        fill={color}
        fillOpacity="0.26"
        strokeWidth="1"
      />

      <path
        d="M 260 76 C 278 60 295 70 292 85 C 278 90 268 85 260 76 Z"
        fill={color}
        fillOpacity="0.24"
        strokeWidth="0.8"
      />

      {/* Leaves along Left Branch */}
      <path
        d="M 48 60 C 25 50 15 75 25 95 C 45 90 52 75 48 60 Z"
        fill={color}
        fillOpacity="0.32"
        strokeWidth="1"
      />
      <path d="M 48 60 Q 30 78 25 95" strokeWidth="0.8" opacity="0.6" />

      <path
        d="M 72 120 C 45 125 42 155 58 165 C 75 152 80 132 72 120 Z"
        fill={color}
        fillOpacity="0.28"
        strokeWidth="1"
      />
      <path d="M 72 120 Q 56 142 58 165" strokeWidth="0.8" opacity="0.6" />

      <path
        d="M 88 195 C 70 215 75 242 92 245 C 102 228 98 208 88 195 Z"
        fill={color}
        fillOpacity="0.26"
        strokeWidth="1"
      />

      <path
        d="M 76 260 C 60 278 70 295 85 292 C 90 278 85 268 76 260 Z"
        fill={color}
        fillOpacity="0.24"
        strokeWidth="0.8"
      />

      {/* Center Garden Rose Blossom (Detailed blooming petals) */}
      <g transform="translate(105, 105)">
        {/* Calyx & Base */}
        <circle cx="0" cy="0" r="14" fill={color} fillOpacity="0.45" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="24" fill={color} fillOpacity="0.18" strokeWidth="1" />
        
        {/* Layer 1: Outer Petals */}
        <path d="M 0 -26 C -18 -48 18 -48 0 -26 Z" fill={color} fillOpacity="0.32" strokeWidth="1" />
        <path d="M 26 0 C 48 -18 48 18 26 0 Z" fill={color} fillOpacity="0.32" strokeWidth="1" />
        <path d="M 0 26 C 18 48 -18 48 0 26 Z" fill={color} fillOpacity="0.32" strokeWidth="1" />
        <path d="M -26 0 C -48 18 -48 -18 -26 0 Z" fill={color} fillOpacity="0.32" strokeWidth="1" />

        {/* Diagonal Petals */}
        <path d="M 18 -18 C 42 -35 48 -8 18 -18 Z" fill={color} fillOpacity="0.28" strokeWidth="0.9" />
        <path d="M 18 18 C 48 8 35 42 18 18 Z" fill={color} fillOpacity="0.28" strokeWidth="0.9" />
        <path d="M -18 18 C -42 35 -48 8 -18 18 Z" fill={color} fillOpacity="0.28" strokeWidth="0.9" />
        <path d="M -18 -18 C -48 -8 -35 -42 -18 -18 Z" fill={color} fillOpacity="0.28" strokeWidth="0.9" />

        {/* Layer 2: Mid Petals */}
        <path d="M -8 -12 C -4 -22 14 -20 12 -10 C 20 -4 18 12 8 12 C -2 18 -16 10 -14 0 C -20 -4 -16 -12 -8 -12 Z" fill={color} fillOpacity="0.36" strokeWidth="1" />
        
        {/* Center Rose Core Swirl */}
        <path d="M -4 -4 C 0 -8 8 -4 6 2 C 4 8 -4 6 -5 1 C -6 -2 -2 -5 1 -4" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="0" cy="0" r="3.5" fill={color} fillOpacity="0.6" />
      </g>

      {/* Secondary Flower: Peony Blossom on Top Right */}
      <g transform="translate(205, 55)">
        <circle cx="0" cy="0" r="9" fill={color} fillOpacity="0.45" strokeWidth="1" />
        <circle cx="0" cy="0" r="16" fill={color} fillOpacity="0.2" strokeWidth="0.8" />
        <path d="M 0 -16 C -12 -30 12 -30 0 -16 Z" fill={color} fillOpacity="0.3" strokeWidth="0.8" />
        <path d="M 16 0 C 30 -12 30 12 16 0 Z" fill={color} fillOpacity="0.3" strokeWidth="0.8" />
        <path d="M 0 16 C 12 30 -12 30 0 16 Z" fill={color} fillOpacity="0.3" strokeWidth="0.8" />
        <path d="M -16 0 C -30 12 -30 -12 -16 0 Z" fill={color} fillOpacity="0.3" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="2.5" fill={color} fillOpacity="0.65" />
      </g>

      {/* Tertiary Flower: Rosebud on Bottom Left */}
      <g transform="translate(55, 205)">
        <circle cx="0" cy="0" r="9" fill={color} fillOpacity="0.45" strokeWidth="1" />
        <circle cx="0" cy="0" r="16" fill={color} fillOpacity="0.2" strokeWidth="0.8" />
        <path d="M 0 -16 C -12 -30 12 -30 0 -16 Z" fill={color} fillOpacity="0.3" strokeWidth="0.8" />
        <path d="M 16 0 C 30 -12 30 12 16 0 Z" fill={color} fillOpacity="0.3" strokeWidth="0.8" />
        <path d="M 0 16 C 12 30 -12 30 0 16 Z" fill={color} fillOpacity="0.3" strokeWidth="0.8" />
        <path d="M -16 0 C -30 12 -30 -12 -16 0 Z" fill={color} fillOpacity="0.3" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="2.5" fill={color} fillOpacity="0.65" />
      </g>

      {/* Delicate Tendrils & Starlight Flakes */}
      <path d="M 15 15 Q 40 5 65 15 T 85 40" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
      <path d="M 15 15 Q 5 40 15 65 T 40 85" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
      <circle cx="45" cy="45" r="2" fill={color} opacity="0.6" />
      <circle cx="160" cy="30" r="2.5" fill={color} opacity="0.5" />
      <circle cx="30" cy="160" r="2.5" fill={color} opacity="0.5" />
      <circle cx="270" cy="115" r="2" fill={color} opacity="0.4" />
      <circle cx="115" cy="270" r="2" fill={color} opacity="0.4" />
    </svg>
  );
};

interface DressCodePaletteColor {
  name: string;
  hex: string;
}

interface DressCodeInfo {
  theme: string;
  colors: DressCodePaletteColor[];
}

const getDressCodePalette = (eventName: string, _idx?: number): DressCodeInfo => {
  const lower = (eventName || "").toLowerCase();
  if (lower.includes("akad") || lower.includes("pemberkatan")) {
    return {
      theme: "Formal / Sopan Bernuansa Netral & Earthy Pastel",
      colors: [
        { name: "Sage Green", hex: "#7E8E76" },
        { name: "Champagne Gold", hex: "#C5A880" },
        { name: "Ivory White", hex: "#F5F2EB" },
        { name: "Warm Taupe", hex: "#A89F91" },
      ],
    };
  }
  if (lower.includes("sesi 2") || lower.includes("malam")) {
    return {
      theme: "Evening Glamour / Gaun & Setelan Elegan",
      colors: [
        { name: "Midnight Navy", hex: "#1C2A39" },
        { name: "Deep Maroon", hex: "#6C1D28" },
        { name: "Warm Gold", hex: "#C5A880" },
        { name: "Soft Ivory", hex: "#F5F2EB" },
      ],
    };
  }
  if (lower.includes("ngunduh") || lower.includes("mantu")) {
    return {
      theme: "Tradisional Adat / Batik Mewah & Earth Tone",
      colors: [
        { name: "Batik Sogan", hex: "#5C3A21" },
        { name: "Terracotta", hex: "#B85D38" },
        { name: "Classic Gold", hex: "#C5A880" },
        { name: "Soft Cream", hex: "#F4ECE0" },
      ],
    };
  }
  return {
    theme: "Batik Mewah / Busana Pesta Elegan Botanical",
    colors: [
      { name: "Emerald Sage", hex: "#5A7360" },
      { name: "Dusty Rose", hex: "#C28876" },
      { name: "Warm Gold", hex: "#C5A880" },
      { name: "Ivory Cream", hex: "#F4ECE0" },
    ],
  };
};

const getYouTubeVideoId = (url?: string | null): string | null => {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

const LuxuryBotanicalDivider: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center justify-center my-8 py-1 ${className}`}>
    <div className="w-20 sm:w-28 h-[1px] bg-gradient-to-r from-transparent via-[#c5a880]/70 to-transparent" />
    <div className="mx-3.5 flex items-center gap-2 text-[#c5a880]">
      <svg className="w-5 h-5 text-[#c5a880]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fillOpacity="0.8" />
      </svg>
    </div>
    <div className="w-20 sm:w-28 h-[1px] bg-gradient-to-l from-transparent via-[#c5a880]/70 to-transparent" />
  </div>
);

const DressCodeGuide: React.FC<{
  info: DressCodeInfo;
}> = ({ info }) => {
  return (
    <div className="bg-[#fcfaf7] border border-[#c5a880]/30 p-3 sm:p-3.5 rounded-none flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider font-bold text-[#6c1d28]">
        <Palette className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
        <span>Panduan Warna Dress Code</span>
      </div>
      <p className="text-[11px] text-[#6b615b] italic leading-snug">
        {info.theme}
      </p>
      <div className="flex items-center gap-2 pt-1 border-t border-[#c5a880]/15 flex-wrap">
        <span className="text-[10px] font-semibold text-[#8c6b3f] uppercase tracking-wider shrink-0 mr-0.5">
          Palet Pilihan:
        </span>
        {info.colors.map((c) => (
          <div
            key={c.name}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#c5a880]/35 shadow-2xs"
          >
            <span
              className="w-3 h-3 rounded-full border border-black/15 shadow-2xs shrink-0"
              style={{ backgroundColor: c.hex }}
              aria-hidden="true"
            />
            <span className="text-[10.5px] text-[#2a2421] font-medium">
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BotanicalTheme: React.FC<ThemeProps> = ({
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

  // Doa & Ucapan Pagination State (Newest first, per-page view)
  const [mobileWishPage, setMobileWishPage] = useState(1);

  // Form State
  const [rsvpName, setRsvpName] = useState(guestName || "");
  const [rsvpAttendance, setRsvpAttendance] = useState<"Hadir" | "Masih Ragu" | "Tidak Hadir">("Hadir");
  const [rsvpCount, setRsvpCount] = useState("2");
  const [rsvpSession, setRsvpSession] = useState("Semua Sesi Acara");
  const [rsvpWishes, setRsvpWishes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

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
    return DEFAULT_WISHES;
  });

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({
    days: "240",
    hours: "14",
    minutes: "35",
    seconds: "50",
  });

  // Audio Reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Full list of Event Schedules with graceful fallbacks (supports 1, 2, 3, 4+ events)
  const schedules = useMemo(() => {
    if (data.eventSchedules && data.eventSchedules.length > 0) {
      return data.eventSchedules;
    }
    return [
      {
        eventName: "Akad Nikah",
        date: "2026-10-24",
        startTime: "08:00",
        endTime: "10:00 WIB",
        venueName: "Masjid Agung Al-Azhar, Jakarta",
        address: "Jl. Sisingamangaraja No.1, Selong, Kebayoran Baru, Jakarta Selatan",
        mapsUrl: "",
      },
      {
        eventName: "Resepsi Pernikahan",
        date: "2026-10-24",
        startTime: "11:00",
        endTime: "14:00 WIB",
        venueName: "Grand Ballroom Hotel Santika Bogor",
        address: "Jl. Raya Padjadjaran, Tegallega, Kota Bogor, Jawa Barat",
        mapsUrl: "",
      },
    ];
  }, [data.eventSchedules]);

  // Primary & Secondary Event pointers
  const primaryEvent = schedules[0];
  const secondaryEvent = schedules[1] || schedules[0];

  const getSessionSubheading = useCallback((eventName: string, idx: number) => {
    const lower = (eventName || "").toLowerCase();
    if (lower.includes("akad") || lower.includes("pemberkatan")) return "Ijab Qabul • Sacred Union";
    if (lower.includes("sesi 1") || lower.includes("siang")) return "Jamuan Kasih Sesi Siang";
    if (lower.includes("sesi 2") || lower.includes("malam")) return "Jamuan Kasih Sesi Malam";
    if (lower.includes("ngunduh") || lower.includes("mantu")) return "Prosesi Ngunduh Mantu";
    if (lower.includes("resepsi")) return `Jamuan Resepsi ${idx > 0 ? `Sesi ${idx}` : ""}`.trim();
    return `Perayaan Acara Sesi ${idx + 1}`;
  }, []);

  const getDressCode = useCallback((eventName: string, idx: number) => {
    return getDressCodePalette(eventName, idx).theme;
  }, []);

  // Dynamic Couple Info
  const groomFullName = data.coupleInfo.groomName || "Versa Pratama, S.T.";
  const groomNick = data.coupleInfo.groomNickname || data.coupleInfo.groomName?.split(" ")[0] || "Versa";
  const brideFullName = data.coupleInfo.brideName || "Mekar Anggraini, S.Ds.";
  const brideNick = data.coupleInfo.brideNickname || data.coupleInfo.brideName?.split(" ")[0] || "Mekar";
  const coupleDisplayName = `${groomNick} & ${brideNick}`;

  const groomParents = useMemo(() => {
    if (data.coupleInfo.groomFather && data.coupleInfo.groomMother) {
      return `${data.coupleInfo.groomFather} & ${data.coupleInfo.groomMother}`;
    }
    return "Bpk. Bambang Wijaya & Ibu Sri Wahyuni";
  }, [data.coupleInfo.groomFather, data.coupleInfo.groomMother]);

  const brideParents = useMemo(() => {
    if (data.coupleInfo.brideFather && data.coupleInfo.brideMother) {
      return `${data.coupleInfo.brideFather} & ${data.coupleInfo.brideMother}`;
    }
    return "Bpk. Herman Santoso & Ibu Dewi Lestari";
  }, [data.coupleInfo.brideFather, data.coupleInfo.brideMother]);

  // Date Formatter
  const formatWeddingDate = useCallback((dateVal?: string | Date): string => {
    if (!dateVal) return "Sabtu, 24 Oktober 2026";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "Sabtu, 24 Oktober 2026";
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
    } catch {
      return "Sabtu, 24 Oktober 2026";
    }
  }, []);

  const primaryEventDateStr = useMemo(
    () => formatWeddingDate(primaryEvent?.date),
    [primaryEvent?.date, formatWeddingDate]
  );

  const secondaryEventDateStr = useMemo(
    () => formatWeddingDate(secondaryEvent?.date || primaryEvent?.date),
    [secondaryEvent?.date, primaryEvent?.date, formatWeddingDate]
  );

  // Cover & Profile Images
  const coverImageSrc = useMemo(() => {
    return (
      data.coupleInfo.desktopCoverImage ||
      "/templates/botanical/couple-center.jpg"
    );
  }, [data.coupleInfo.desktopCoverImage]);

  const groomPhotoSrc = useMemo(() => {
    return (
      data.coupleInfo.groomPhoto ||
      "/templates/botanical/groom-versa.jpg"
    );
  }, [data.coupleInfo.groomPhoto]);

  const bridePhotoSrc = useMemo(() => {
    return (
      data.coupleInfo.bridePhoto ||
      "/templates/botanical/bride-mekar.jpg"
    );
  }, [data.coupleInfo.bridePhoto]);

  // Physical Gift Address
  const giftShippingAddress = useMemo(() => {
    return (
      data.coupleInfo.giftAddress ||
      secondaryEvent?.address ||
      primaryEvent?.address ||
      "Jl. Taman Cempaka No. 18, Kebayoran Baru, Jakarta Selatan 12180"
    );
  }, [data.coupleInfo.giftAddress, secondaryEvent?.address, primaryEvent?.address]);

  const giftRecipientName = useMemo(() => {
    return data.coupleInfo.giftReceiver || coupleDisplayName;
  }, [data.coupleInfo.giftReceiver, coupleDisplayName]);

  const giftPhoneNumber = useMemo(() => {
    return data.coupleInfo.giftPhone || "0812-3456-7890";
  }, [data.coupleInfo.giftPhone]);

  const fullShippingText = useMemo(() => {
    return `${giftShippingAddress} (Penerima: ${giftRecipientName} / ${giftPhoneNumber})`;
  }, [giftShippingAddress, giftRecipientName, giftPhoneNumber]);

  // Background Image & Floral Ornaments
  const customBgImage = useMemo(() => {
    return data.coupleInfo?.backgroundImage || "";
  }, [data.coupleInfo.backgroundImage]);

  const floralStyle = useMemo(() => {
    return data.coupleInfo?.floralOrnament || "gold";
  }, [data.coupleInfo.floralOrnament]);

  const floralColor = useMemo(() => {
    switch (floralStyle) {
      case "burgundy":
        return "#6c1d28";
      case "sage":
        return "#7a8c7b";
      case "none":
        return "transparent";
      case "gold":
      default:
        return "#c5a880";
    }
  }, [floralStyle]);

  // Bank Accounts & QRIS
  const activeBankList = useMemo(() => {
    if (data.bankAccounts && data.bankAccounts.length > 0) {
      return data.bankAccounts;
    }
    return [
      {
        id: "default-bca",
        bankName: "BCA",
        accountNumber: "7410 8829 1100",
        accountHolder: groomFullName,
        qrisImageUrl: undefined,
      },
      {
        id: "default-mandiri",
        bankName: "Bank Mandiri",
        accountNumber: "1370 0289 4432",
        accountHolder: brideFullName,
        qrisImageUrl: undefined,
      },
    ];
  }, [data.bankAccounts, groomFullName, brideFullName]);

  const customQrisUrl = useMemo(() => {
    return data.bankAccounts?.find((b) => b.qrisImageUrl && b.qrisImageUrl.trim() !== "")?.qrisImageUrl || null;
  }, [data.bankAccounts]);

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
    if (!isCoverDismissed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCoverDismissed]);

  // Open Invitation Action with Slide-Up Curtain Animation
  const handleOpenInvitation = () => {
    setIsCoverSliding(true);
    setIsOpen(true);

    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {});
    }

    // Dismiss cover overlay after 950ms slide-up transition finishes
    setTimeout(() => {
      setIsCoverDismissed(true);
    }, 950);
  };

  // Copy to Clipboard
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

  // Generate QR Code Ticket for Guest
  useEffect(() => {
    if (guestName && typeof window !== "undefined") {
      const payload = JSON.stringify({
        guestName,
        invitationSlug: data.slug || "botanical",
        date: "2026-10-24",
      });
      QRCode.toDataURL(payload, { width: 240, margin: 1 })
        .then(setQrTicketDataUrl)
        .catch(() => {});
    }
  }, [guestName, data.slug]);

  // Download QRIS Image (Failsafe with Blob fetch, Backend proxy, and Real Canvas QR Generation)
  const handleDownloadQris = async () => {
    try {
      showToast("Sedang menyiapkan unduhan QRIS...");
      await downloadWeddingQrisCard({
        url: customQrisUrl,
        coupleName: coupleDisplayName,
        invitationSlug: data.slug || "wedding",
      });
      showToast("Gambar QRIS berhasil diunduh ke perangkat Anda!");
    } catch (err) {
      console.error("Gagal mengunduh QRIS:", err);
      showToast("Gagal mengunduh QRIS. Silakan coba lagi.");
    }
  };

  // Live Countdown Effect
  useEffect(() => {
    const targetDateStr = primaryEvent?.date
      ? new Date(primaryEvent.date).toISOString()
      : "2026-10-24T08:00:00+07:00";
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
    if (!name) return;
    setIsSubmitting(true);

    const newWishItem: LocalWish = {
      id: `wish-${Date.now()}`,
      senderName: name,
      timeAgo: "Baru saja",
      attendance: rsvpAttendance,
      guestCount: `${rsvpCount} Orang`,
      message: rsvpWishes.trim() || "Semoga menjadi keluarga sakinah mawaddah warahmah.",
    };

    setWishesList((prev) => [newWishItem, ...prev]);
    setMobileWishPage(1);

    try {
      await fetch("/api/public/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: data.id || data.slug,
          guestName: name,
          status: rsvpAttendance === "Hadir" ? "attending" : rsvpAttendance === "Tidak Hadir" ? "declined" : "tentative",
          attendeeCount: parseInt(rsvpCount, 10) || 1,
          sessionChosen: rsvpSession || null,
        }),
      });

      if (rsvpWishes.trim()) {
        await fetch("/api/public/wishes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invitationId: data.id || data.slug,
            senderName: name,
            message: rsvpWishes.trim(),
            reaction: "💐",
          }),
        });
      }
    } catch {
      // Ignored for demo
    } finally {
      setIsSubmitting(false);
      setRsvpSuccess(true);
      setRsvpWishes("");
      showToast("Konfirmasi kehadiran Anda telah tercatat!");
      setTimeout(() => setRsvpSuccess(false), 5000);
    }
  };

  // Love Story data
  const stories: BotanicalStory[] = useMemo(() => {
    if (data.coupleInfo.stories && data.coupleInfo.stories.length >= 7) {
      return data.coupleInfo.stories.map((st, idx) => ({
        date: st.date || `Bab ${idx + 1}`,
        title: st.title,
        story: st.story,
        imageUrl: st.imageUrl || DEFAULT_STORIES[idx % DEFAULT_STORIES.length].imageUrl,
        quote: "“Dua langkah yang menyelaraskan ritme detak, berjalan beriringan menuju satu tujuan abadi.”",
        location: "Kisah Kasih",
      }));
    }
    return DEFAULT_STORIES;
  }, [data.coupleInfo.stories]);

  // Gallery items - ensure valid URLs and fallback to DEFAULT_GALLERY_IMAGES if empty or invalid
  const galleryList = useMemo(() => {
    if (data.galleries && data.galleries.length > 0) {
      const valid = data.galleries
        .filter((g) => g.imageUrl && g.imageUrl.trim() !== "")
        .map((g, idx) => ({
          url: g.imageUrl,
          title: g.caption || `Momen Kenangan #${idx + 1}`,
          category: "Prewedding",
        }));
      if (valid.length > 0) return valid;
    }
    return DEFAULT_GALLERY_IMAGES;
  }, [data.galleries]);

  // Hardware-accelerated Scroll Reveal Observer (Zero window onscroll overhead)
  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    if (!("IntersectionObserver" in window)) {
      document
        .querySelectorAll(".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right")
        .forEach((el) => el.classList.add("revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(
        ".scroll-reveal:not(.revealed), .scroll-reveal-left:not(.revealed), .scroll-reveal-right:not(.revealed)"
      );
      elements.forEach((el) => observer.observe(el));
    }, 60);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [isOpen]);

  const audioSource = data.musicUrl || "/music/wedding-romance.mp3";

  // Ambient Desktop Media (Video first, fallback to gallery image)
  const rawYoutubeUrl = data.youtubeVideoUrl || data.coupleInfo?.youtubeVideoUrl;
  const youtubeCoverId = getYouTubeVideoId(rawYoutubeUrl);
  const directVideoUrl = useMemo(() => {
    if (!rawYoutubeUrl) return null;
    if (youtubeCoverId) return null;
    if (/\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(rawYoutubeUrl) || rawYoutubeUrl.startsWith("/video/")) {
      return rawYoutubeUrl;
    }
    return null;
  }, [rawYoutubeUrl, youtubeCoverId]);

  const ambientGalleryBg = useMemo(() => {
    const fromGallery = data.galleries?.find((g) => g.imageUrl && g.imageUrl.trim() !== "")?.imageUrl;
    return (
      fromGallery ||
      data.coupleInfo?.desktopCoverImage ||
      data.coupleInfo?.backgroundImage ||
      coverImageSrc ||
      "/templates/botanical/gallery/gallery-1.jpg"
    );
  }, [data.galleries, data.coupleInfo, coverImageSrc]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full max-w-[1680px] mx-auto shadow-2xl relative bg-[#fcf9f4] text-[#2a2421] antialiased theme-wrapper no-scrollbar">
      {/* Background Audio */}
      <audio
        ref={audioRef}
        src={audioSource}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          console.warn("Audio load error, using local wedding music fallback");
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
      {/* DESKTOP LEFT PANEL: 58-60% Width Sticky Botanical Gallery & Title        */}
      {/* ========================================================================= */}
      {!isEmbedded && (
        <aside className="hidden lg:flex lg:w-[58%] xl:w-[60%] h-screen sticky top-0 overflow-hidden flex-col justify-between p-12 xl:p-16 text-[#fcf9f4] z-10 select-none">
          {/* Background Editorial / Botanical Photo or Video with Warm Vignette */}
          <div className="absolute inset-0 z-0">
            {youtubeCoverId ? (
              <div className="w-full h-full relative overflow-hidden">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeCoverId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeCoverId}&playsinline=1&modestbranding=1&rel=0`}
                  title="Botanical Background Video"
                  className="absolute top-1/2 left-1/2 w-[300%] h-[300%] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none filter blur-[1px] scale-105"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
                <div className="absolute inset-0 bg-[#1c1612]/75 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1612]/95 via-[#1c1612]/40 to-[#1c1612]/60" />
              </div>
            ) : directVideoUrl ? (
              <div className="w-full h-full relative overflow-hidden">
                <video
                  src={directVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute top-1/2 left-1/2 w-full h-full min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none filter blur-[1px] scale-105"
                />
                <div className="absolute inset-0 bg-[#1c1612]/70 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1612]/95 via-[#1c1612]/40 to-[#1c1612]/60" />
              </div>
            ) : (
              <>
                <img
                  src={coverImageSrc || "/templates/botanical/couple-center.jpg"}
                  alt={`${coupleDisplayName} Botanical Prewedding`}
                  className="w-full h-full object-cover object-center filter brightness-[0.82] contrast-[1.05]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/templates/botanical/couple-center.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1612]/95 via-[#1c1612]/30 to-[#1c1612]/60 mix-blend-multiply" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/40" />
              </>
            )}
          </div>

          {/* Top Branding on Left Panel */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[1px] bg-[#fcf9f4]/60" />
              <span className="text-xs uppercase tracking-[0.3em] font-medium text-[#fcf9f4]/90 font-serif">
                Official Wedding Invitation
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border border-[#fcf9f4]/40 flex items-center justify-center font-serif-eb text-sm tracking-widest text-[#fcf9f4]/90 backdrop-blur-sm bg-black/10">
              {groomNick[0] || "V"} &amp; {brideNick[0] || "M"}
            </div>
          </div>

          {/* Center / Lower Editorial Title on Left Panel */}
          <div className="relative z-10 my-auto py-12 max-w-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c5a880] font-semibold mb-4">
              The Wedding Celebration Of
            </p>
            <h1 className="font-serif-eb text-6xl xl:text-7xl 2xl:text-8xl font-normal leading-[1.05] tracking-tight text-white mb-6">
              {groomNick} <span className="font-serif italic font-normal text-[#fcf9f4]/80">&amp;</span> {brideNick}
            </h1>
            <div className="h-[1px] w-24 bg-[#c5a880]/80 mb-6" />
            <p className="font-serif italic text-xl xl:text-2xl text-[#fcf9f4]/90 font-light leading-relaxed mb-8">
              &quot;Two souls with but a single thought, two hearts that beat as one.&quot;
            </p>

            {/* Wedding Date & Venue Chip */}
            <div className="inline-flex items-center gap-6 bg-[#1c1612]/60 backdrop-blur-md border border-white/15 px-6 py-3.5 rounded-full text-[#fcf9f4]/90 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#c5a880]" />
                <span className="font-medium tracking-wide">
                  {primaryEventDateStr}
                </span>
              </div>
              <span className="w-1 h-1 rounded-full bg-[#fcf9f4]/40" />
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#c5a880]" />
                <span className="text-[#fcf9f4]/80">
                  {primaryEvent?.venueName || "Grand Ballroom Hotel Santika Bogor"}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Panel Note on Left Panel */}
          <div className="relative z-10 flex items-center justify-between text-xs text-[#fcf9f4]/70 tracking-widest uppercase border-t border-white/15 pt-6 font-serif">
            <span>Botanical Tema 01</span>
            <span>Scroll Right to Explore Invitation ↓</span>
          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* RIGHT PANEL: 40-42% Width on Desktop / 100% on Mobile Frame              */}
      {/* ========================================================================= */}
      <div
        className={`w-full ${
          !isEmbedded ? "lg:w-[42%] xl:w-[40%]" : "max-w-[480px] mx-auto"
        } bg-[#1c1612] lg:bg-[#fcf9f4] flex flex-col justify-start items-center relative ${
          isCoverDismissed ? "overflow-y-auto lg:h-screen" : "overflow-hidden h-screen"
        } no-scrollbar shadow-inner`}
      >
        {/* FULL SCREEN / RIGHT-PANEL COVER OVERLAY */}
        {!isCoverDismissed && (
          <div
            className={`fixed lg:absolute inset-0 z-50 w-full h-[100dvh] lg:h-full bg-[#fcf9f4] flex flex-col justify-between items-center px-4 py-4 sm:py-6 select-none overflow-hidden shadow-2xl transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] ${
              isCoverSliding ? "-translate-y-full" : "translate-y-0"
            }`}
          style={{
            backgroundImage: `radial-gradient(circle at 50% 15%, rgba(197, 168, 128, 0.12) 0%, transparent 55%), radial-gradient(circle at 50% 85%, rgba(108, 29, 40, 0.05) 0%, transparent 60%)`,
          }}
        >
          {/* Background Image Layer */}
          {customBgImage && (
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-20 mix-blend-multiply"
              style={{ backgroundImage: `url(${customBgImage})` }}
            />
          )}

          {/* Botanical Floral Corner Ornaments */}
          <BotanicalFloralCorner
            color={floralColor}
            position="top-left"
            className="w-56 h-56 sm:w-72 sm:h-72 opacity-50 -top-6 -left-6"
          />
          <BotanicalFloralCorner
            color={floralColor}
            position="bottom-right"
            className="w-56 h-56 sm:w-72 sm:h-72 opacity-50 -bottom-6 -right-6"
          />

          {/* Center Main Hero Block */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 w-full max-w-md my-auto z-10 space-y-2.5 sm:space-y-3">
            <div className="w-9 h-9 rounded-full bg-[#f0ede9] border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880] shadow-inner">
              <Heart className="w-4 h-4 fill-current opacity-80" />
            </div>

            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#6c1d28] uppercase">
              THE WEDDING CELEBRATION OF
            </p>

            <h1 className="font-serif-eb text-3xl sm:text-4xl lg:text-5xl text-[#2a2421] font-normal tracking-wide leading-tight">
              {groomNick} &amp; {brideNick}
            </h1>

            {/* Couple Oval Image */}
            <div className="relative w-40 h-52 sm:w-48 sm:h-64 rounded-none overflow-hidden shadow-2xl p-1 bg-[#ebe8e3] border-4 border-white my-1 shrink-0">
              <div className="relative w-full h-full rounded-none overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImageSrc}
                  alt={coupleDisplayName}
                  className="w-full h-full object-cover rounded-none"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/templates/botanical/couple-center.jpg";
                  }}
                />
              </div>
            </div>

            {/* Guest Personalization Card */}
            <div className="w-full max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md rounded-none p-3 sm:p-4 shadow-sm border border-[#c5a880]/35 text-center">
              <p className="text-[11px] sm:text-xs text-[#6b615b]">Kepada Yth. Bapak/Ibu/Saudara/i</p>
              <p className="font-serif-eb text-base sm:text-lg font-bold text-[#2a2421] my-0.5">
                {guestName || "Tamu Undangan Terhormat"}
              </p>
              <p className="text-[9px] sm:text-[10px] text-[#c5a880] tracking-widest uppercase font-semibold">
                di Tempat
              </p>
            </div>

            {/* Buka Undangan Button */}
            <button
              type="button"
              onClick={handleOpenInvitation}
              className="w-full max-w-xs sm:max-w-sm py-3.5 px-6 rounded-none bg-[#6c1d28] hover:bg-[#4e0514] text-white text-xs font-semibold tracking-[0.2em] uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Heart className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>Buka Undangan</span>
            </button>
          </div>

          {/* Bottom subtle watermarking */}
          <div className="z-10 shrink-0 pb-1 text-center">
            <span className="text-[9px] text-[#8c6b3f]/70 uppercase tracking-widest font-serif">
              Invity by Fasaro • 2026
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CENTERED MOBILE-FIRST INVITATION CONTAINER (MOBILE & DESKTOP)             */}
      {/* ========================================================================= */}
      <main className="w-full max-w-[460px] min-h-screen bg-[#ebe6dd] text-[#2a2421] font-sans-montserrat shadow-2xl relative z-10 overflow-x-hidden flex flex-col items-center border-x border-[#c5a880]/30 selection:bg-[#6c1d28] selection:text-white">
        {/* Mobile Card Custom Background Image Layer */}
        {customBgImage && (
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-20 mix-blend-multiply"
            style={{ backgroundImage: `url(${customBgImage})` }}
          />
        )}

        {/* Mobile Sticky Top Header */}
        <header className="sticky top-0 left-0 right-0 z-40 bg-[#f9f6f0]/95 backdrop-blur-md border-b border-[#c5a880]/30 px-4 py-2.5 flex items-center justify-between w-full shadow-xs">
          <div className="flex items-center gap-2">
            <span className="font-serif-eb text-xs font-semibold text-[#6c1d28] tracking-[0.2em] uppercase">
              Undangan Pernikahan
            </span>
          </div>

          <div className="flex items-center gap-2">
            {guestName && isFeatureAvailable("qr_ticket", { data, forcedThemeId: "botanical" }) && (
              <button
                onClick={() => setShowQrTicketModal(true)}
                className="p-1.5 rounded-full bg-white text-[#6c1d28] border border-[#c5a880]/30 shadow-xs cursor-pointer"
                title="Tiket Masuk Tamu"
              >
                <QrCode className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* SECTION 1: WELCOME HERO (MOBILE) */}
        <section
          id="mobile-home"
          className="w-full flex flex-col items-center justify-center text-center px-6 pt-10 pb-12 bg-[#fcf9f4] relative overflow-hidden border-b border-[#c5a880]/20"
        >
          {/* Mobile Top Botanical Floral Corners */}
          <BotanicalFloralCorner
            color={floralColor}
            position="top-left"
            className="w-40 h-40 opacity-40 -top-3 -left-3"
          />
          <BotanicalFloralCorner
            color={floralColor}
            position="top-right"
            className="w-40 h-40 opacity-40 -top-3 -right-3"
          />
          <div className="w-10 h-10 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#c5a880] mb-2 shadow-inner">
            <Heart className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold tracking-[0.25em] text-[#6c1d28] uppercase mb-1">
            Walimatul &apos;Ursy
          </p>
          <h1 className="font-serif-eb text-4xl text-[#2a2421] font-normal tracking-wide leading-tight mb-2">
            {groomNick} &amp; {brideNick}
          </h1>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-none bg-[#f2ecdf] mb-6 border border-[#c5a880]/30 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#6c1d28]" />
            <span className="text-xs text-[#2a2421] font-medium">{primaryEventDateStr}</span>
          </div>

          {/* Couple Image Oval */}
          <div className="relative w-52 h-68 rounded-full overflow-hidden shadow-xl p-1.5 bg-[#ebe8e3] border-4 border-white mb-2">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src={coverImageSrc}
                alt={coupleDisplayName}
                fill
                priority
                className="object-cover rounded-full"
                sizes="208px"
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: SPIRITUAL VERSE */}
        <section className="w-full px-6 py-14 sm:py-16 bg-[#f9f6f0] text-center flex flex-col items-center border-y border-[#c5a880]/20">
          <div className="scroll-reveal max-w-md flex flex-col items-center">
            <Heart className="w-5 h-5 text-[#c5a880] mb-3 fill-current opacity-70" />
            <p className="font-serif-eb text-lg sm:text-xl text-[#6c1d28] tracking-wide leading-loose mb-3 max-w-md" dir="rtl">
              وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً
            </p>
            <p className="text-xs sm:text-sm text-[#6b615b] leading-relaxed italic max-w-md mb-2 font-serif-cormorant">
              &quot;{data.coupleInfo.greetingMessage || "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."}&quot;
            </p>
            <p className="text-[10px] sm:text-[11px] text-[#6c1d28] uppercase font-bold tracking-widest">
              (QS. Ar-Rum: 21)
            </p>
          </div>
        </section>

        {/* SECTION 3: MEMPELAI (BRIDE & GROOM PROFILE) */}
        <section className="w-full px-5 sm:px-8 py-14 sm:py-16 bg-[#fcf9f4] flex flex-col items-center">
          <div className="text-center mb-8 scroll-reveal">
            <div className="inline-flex items-center justify-center gap-3 mb-2 text-[#c5a880]">
              <span className="w-8 h-[1px] bg-[#c5a880]/50" />
              <Heart className="w-3.5 h-3.5 text-[#6c1d28] fill-current" />
              <span className="w-8 h-[1px] bg-[#c5a880]/50" />
            </div>
            <h2 className="font-serif-eb text-3xl text-[#2a2421] font-normal tracking-wide">
              {groomNick} &amp; {brideNick}
            </h2>
          </div>

          {/* Groom Card */}
          <div className="scroll-reveal w-full max-w-md bg-white rounded-none p-6 shadow-sm border border-[#c5a880]/30 flex flex-col items-center text-center mb-4 transition-all hover:shadow-md">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-[#f0ede9] mb-3 shadow-inner relative border-2 border-[#c5a880]/50">
              <Image
                src={data.coupleInfo.groomPhoto || "/templates/botanical/groom.jpg"}
                alt={groomFullName}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
            <h3 className="font-serif-eb text-xl text-[#2a2421] font-semibold mb-1">
              {groomFullName}
            </h3>
            <p className="text-xs text-[#6b615b] mb-3 leading-relaxed">
              Putra pertama dari
              <br />
              <strong className="text-[#2a2421]">{groomParents}</strong>
            </p>
            {data.coupleInfo.groomInstagram && (
              <a
                href={`https://instagram.com/${data.coupleInfo.groomInstagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-[#f9f6f0] text-xs text-[#2a2421] hover:text-[#6c1d28] transition-colors"
              >
                <InstagramIcon className="w-3 h-3" />
                <span>@{data.coupleInfo.groomInstagram.replace("@", "")}</span>
              </a>
            )}
          </div>

          <div className="my-1 flex items-center justify-center w-10 h-10 rounded-full bg-[#f4ece0] text-[#6c1d28] font-serif-eb text-lg font-bold shadow-xs border border-[#c5a880]/30">
            &amp;
          </div>

          {/* Bride Card */}
          <div className="scroll-reveal w-full max-w-md bg-white rounded-none p-6 shadow-sm border border-[#c5a880]/30 flex flex-col items-center text-center mt-4 transition-all hover:shadow-md">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-[#f0ede9] mb-3 shadow-inner relative border-2 border-[#c5a880]/50">
              <Image
                src={data.coupleInfo.bridePhoto || "/templates/botanical/bride.jpg"}
                alt={brideFullName}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
            <h3 className="font-serif-eb text-xl text-[#2a2421] font-semibold mb-1">
              {brideFullName}
            </h3>
            <p className="text-xs text-[#6b615b] mb-3 leading-relaxed">
              Putri kedua dari
              <br />
              <strong className="text-[#2a2421]">{brideParents}</strong>
            </p>
            {data.coupleInfo.brideInstagram && (
              <a
                href={`https://instagram.com/${data.coupleInfo.brideInstagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-[#f9f6f0] text-xs text-[#2a2421] hover:text-[#6c1d28] transition-colors"
              >
                <InstagramIcon className="w-3 h-3" />
                <span>@{data.coupleInfo.brideInstagram.replace("@", "")}</span>
              </a>
            )}
          </div>
        </section>

        {/* SECTION 4: KISAH KAMI (PERJALANAN CINTA) */}
        {isFeatureAvailable("love_story", { data, forcedThemeId: "botanical" }) && (
          <section id="mobile-kisah" className="w-full px-5 sm:px-8 py-14 sm:py-16 bg-[#f9f6f0] flex flex-col items-center">
            <div className="text-center mb-8 scroll-reveal">
              <h2 className="font-serif-eb text-2xl sm:text-3xl text-[#2a2421] font-normal">
                Perjalanan Cinta Kami
              </h2>
            </div>

            <div className="w-full max-w-md flex flex-col gap-6 overflow-hidden">
              {stories.map((st, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={`m-ch-${idx}`}
                    className={`bg-white rounded-none p-5 sm:p-6 shadow-sm border border-[#c5a880]/30 flex flex-col hover:shadow-md ${
                      isEven ? "scroll-reveal-left" : "scroll-reveal-right"
                    }`}
                  >
                  <div className="w-full h-40 sm:h-44 rounded-none overflow-hidden relative mb-3.5 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={st.imageUrl}
                      alt={st.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/templates/botanical/gallery/gallery-1.jpg";
                      }}
                    />
                  </div>
                  <h3 className="font-serif-eb text-lg font-semibold text-[#2a2421] mb-1.5">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#6b615b] leading-relaxed">{st.story}</p>
                </div>
              );
            })}
            </div>
          </section>
        )}

        {/* SECTION 5: ACARA & COUNTDOWN */}
        <section
          id="mobile-acara"
          className="w-full px-5 sm:px-8 py-16 sm:py-20 flex flex-col items-center relative overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 50% 12%, rgba(197, 168, 128, 0.15) 0%, transparent 65%), linear-gradient(180deg, #fdfbf7 0%, #f6f0e4 50%, #fdfbf7 100%)",
          }}
        >
          {/* Subtle Botanical Corner Accents for Luxury Event Frame */}
          <BotanicalFloralCorner
            color={floralColor}
            position="top-left"
            className="w-36 h-36 opacity-35 -top-3 -left-3"
          />
          <BotanicalFloralCorner
            color={floralColor}
            position="bottom-right"
            className="w-36 h-36 opacity-35 -bottom-3 -right-3"
          />

          <div className="text-center mb-8 relative z-10 scroll-reveal">
            <h2 className="font-serif-eb text-2xl sm:text-3xl text-[#2a2421] font-normal tracking-wide">
              Rangkaian Acara Pernikahan
            </h2>
          </div>

          {/* Countdown Blocks */}
          {isFeatureAvailable("countdown", { data, forcedThemeId: "botanical" }) && (
            <div className="scroll-reveal w-full max-w-md grid grid-cols-4 gap-2.5 sm:gap-3 mb-8 text-center relative z-10">
              <div className="bg-white/95 backdrop-blur-xs rounded-none p-3 shadow-sm border border-[#c5a880]/35">
                <span className="font-serif-eb text-xl sm:text-2xl font-bold text-[#6c1d28] block">
                  {timeLeft.days}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#6b615b] font-semibold">
                  Hari
                </span>
              </div>
              <div className="bg-white/95 backdrop-blur-xs rounded-none p-3 shadow-sm border border-[#c5a880]/35">
                <span className="font-serif-eb text-xl sm:text-2xl font-bold text-[#6c1d28] block">
                  {timeLeft.hours}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#6b615b] font-semibold">
                  Jam
                </span>
              </div>
              <div className="bg-white/95 backdrop-blur-xs rounded-none p-3 shadow-sm border border-[#c5a880]/35">
                <span className="font-serif-eb text-xl sm:text-2xl font-bold text-[#6c1d28] block">
                  {timeLeft.minutes}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#6b615b] font-semibold">
                  Menit
                </span>
              </div>
              <div className="bg-white/95 backdrop-blur-xs rounded-none p-3 shadow-sm border border-[#c5a880]/35">
                <span className="font-serif-eb text-xl sm:text-2xl font-bold text-[#c5a880] block">
                  {timeLeft.seconds}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#6b615b] font-semibold">
                  Detik
                </span>
              </div>
            </div>
          )}

          {/* Event Cards (Dynamic: supports 1, 2, 3, 4+ schedules) */}
          <div className="w-full max-w-md flex flex-col gap-6 relative z-10">
            {schedules.map((ev, idx) => {
              const sessionDateStr = formatWeddingDate(ev.date);

              return (
                <React.Fragment key={`m-ev-${idx}`}>
                  {/* Luxury Botanical Divider between multiple events */}
                  {idx > 0 && <LuxuryBotanicalDivider />}

                  <div className="scroll-reveal bg-white/95 backdrop-blur-xs rounded-none p-6 shadow-md border border-[#c5a880]/40 transition-all hover:shadow-lg">
                    <div className="w-16 h-[2px] bg-[#c5a880] mx-auto mb-4" />
                    <h3 className="font-serif-eb text-2xl text-[#6c1d28] font-normal tracking-wide mb-1 text-center">
                      {ev.eventName}
                    </h3>
                    <p className="text-xs text-[#6b615b] uppercase tracking-wider mb-4 text-center">
                      {sessionDateStr}
                    </p>
                    <div className="flex items-center justify-center gap-2 mb-4 text-xs font-semibold text-[#6c1d28] bg-[#fdfbf7] py-1.5 px-3 border border-[#c5a880]/20">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pukul {ev.startTime || "08.00"} — {ev.endTime || "Selesai"}</span>
                    </div>

                    <div className="bg-[#f9f6f0] rounded-none p-3.5 mb-4 border border-[#c5a880]/20 text-left">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#6c1d28] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-[#2a2421]">
                            {ev.venueName || "Lokasi Acara"}
                          </p>
                          <p className="text-[11px] text-[#6b615b] mt-1 leading-relaxed">
                            {ev.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <DressCodeGuide
                        info={getDressCodePalette(ev.eventName, idx)}
                      />
                    </div>

                    {isFeatureAvailable("google_maps", { data, forcedThemeId: "botanical" }) && (
                      <GoogleMapEmbed
                        venueName={ev.venueName || "Lokasi Acara"}
                        address={ev.address}
                        mapsUrl={ev.mapsUrl}
                        latitude={ev.latitude}
                        longitude={ev.longitude}
                        heightClass="h-48 sm:h-52"
                        themeStyle={{
                          mapContainerClass: "border-[#c5a880]/30 bg-[#f7f2ea]",
                          badgeClass: "bg-[#2a2421]/80 text-[#f9f6f0]",
                        }}
                      />
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </section>

        {/* SECTION 6: GALERI */}
        {isFeatureAvailable("gallery", { data, forcedThemeId: "botanical" }) && (
          <section id="mobile-galeri" className="w-full px-5 sm:px-8 py-14 sm:py-16 bg-[#f9f6f0] flex flex-col items-center">
            <div className="text-center mb-8 scroll-reveal">
              <h2 className="font-serif-eb text-2xl sm:text-3xl text-[#2a2421] font-normal">
                Galeri Kenangan
              </h2>
            </div>

            {/* Natural Aspect Ratio Gallery: Columns layout, NO text, respects vertical / horizontal orientation */}
            <div className="scroll-reveal w-full max-w-md columns-2 gap-3 space-y-3 px-1">
              {galleryList.map((item, idx) => (
                <div
                  key={`m-gal-${idx}`}
                  onClick={() => setLightboxImg(item.url)}
                  className="break-inside-avoid relative overflow-hidden shadow-xs border border-[#c5a880]/30 cursor-pointer group bg-stone-50 mb-3 hover:shadow-md transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-500 rounded-none"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/templates/botanical/gallery/gallery-1.jpg";
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 7: HADIAH & KADO */}
        {Boolean(
          isFeatureAvailable("digital_gift", { data, forcedThemeId: "botanical" }) ||
            (giftShippingAddress && isFeatureAvailable("physical_gift", { data, forcedThemeId: "botanical" }))
        ) && (
          <section id="mobile-hadiah" className="w-full px-5 sm:px-8 py-14 sm:py-16 bg-[#fcf9f4] flex flex-col items-center">
            <div className="text-center mb-8 scroll-reveal">
              <h2 className="font-serif-eb text-2xl sm:text-3xl text-[#2a2421] font-normal">
                Kado Digital &amp; Amplop
              </h2>
            </div>

            <div className="w-full max-w-md flex flex-col gap-4">
              {/* Bank Accounts List & QRIS */}
              {isFeatureAvailable("digital_gift", { data, forcedThemeId: "botanical" }) && (
                <>
                  {activeBankList.map((account, bIdx) => (
                    <div key={`m-bank-${bIdx}`} className="scroll-reveal bg-white rounded-none p-5 sm:p-6 shadow-sm border border-[#c5a880]/30 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-[#2a2421]">{account.bankName}</span>
                        <span className="text-[11px] text-[#6c1d28] font-semibold tracking-wider uppercase font-serif">
                          Transfer Bank
                        </span>
                      </div>
                      <p className="font-mono text-lg font-bold text-[#6c1d28] select-all my-1.5">
                        {account.accountNumber}
                      </p>
                      <p className="text-xs text-[#6b615b] mb-4">
                        a.n. <strong className="text-[#2a2421]">{account.accountHolder}</strong>
                      </p>
                      <button
                        onClick={() => copyToClipboard(account.accountNumber, `No. Rekening ${account.bankName}`)}
                        className="w-full py-2.5 px-3 rounded-none bg-[#f0eae0] text-[#2a2421] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:bg-[#6c1d28] active:text-white transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Nomor Rekening</span>
                      </button>
                    </div>
                  ))}

                  {/* QRIS / E-Wallet Card */}
                  <div className="scroll-reveal bg-white rounded-none p-5 sm:p-6 shadow-sm border border-[#c5a880]/30 flex flex-col items-center text-center hover:shadow-md transition-all">
                    <span className="text-[11px] text-[#6c1d28] font-semibold tracking-wider uppercase font-serif mb-3">
                      QRIS Pembayaran Digital
                    </span>
                    <div className="w-44 h-44 bg-[#fcf9f4] p-2.5 rounded-none border border-[#c5a880]/30 shadow-inner flex items-center justify-center mb-3">
                      {customQrisUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={customQrisUrl} alt="QRIS Amplop Digital" className="w-full h-full object-contain" />
                      ) : (
                        <svg className="w-full h-full text-[#6c1d28]" viewBox="0 0 100 100" fill="currentColor">
                          <rect x="10" y="10" width="25" height="25" fill="#6c1d28" rx="3" />
                          <rect x="15" y="15" width="15" height="15" fill="white" rx="2" />
                          <rect x="18" y="18" width="9" height="9" fill="#6c1d28" />
                          <rect x="65" y="10" width="25" height="25" fill="#6c1d28" rx="3" />
                          <rect x="70" y="15" width="15" height="15" fill="white" rx="2" />
                          <rect x="73" y="18" width="9" height="9" fill="#6c1d28" />
                          <rect x="10" y="65" width="25" height="25" fill="#6c1d28" rx="3" />
                          <rect x="15" y="70" width="15" height="15" fill="white" rx="2" />
                          <rect x="18" y="73" width="9" height="9" fill="#6c1d28" />
                          <rect x="45" y="15" width="10" height="10" fill="#c5a880" />
                          <rect x="45" y="35" width="10" height="20" fill="#6c1d28" />
                          <rect x="40" y="65" width="15" height="10" fill="#6c1d28" />
                          <rect x="65" y="45" width="20" height="10" fill="#c5a880" />
                          <rect x="65" y="65" width="15" height="20" fill="#6c1d28" />
                          <text x="50" y="54" fontSize="7" textAnchor="middle" fill="#6c1d28" fontWeight="bold">
                            QRIS
                          </text>
                        </svg>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6b615b] leading-relaxed mb-3">
                      Pindai dengan aplikasi m-Banking atau e-Wallet (BCA, Mandiri, BRI, GoPay, OVO, Dana).
                    </p>
                    <button
                      type="button"
                      onClick={handleDownloadQris}
                      className="w-full py-2.5 px-3 rounded-none bg-[#f0eae0] hover:bg-[#6c1d28] hover:text-white text-[#2a2421] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Gambar QRIS</span>
                    </button>
                  </div>
                </>
              )}

              {/* Kirim Kado Fisik */}
              {giftShippingAddress && isFeatureAvailable("physical_gift", { data, forcedThemeId: "botanical" }) && (
                <details className="scroll-reveal bg-white rounded-none p-5 sm:p-6 shadow-sm border border-[#c5a880]/30 group">
                  <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-semibold text-[#2a2421]">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#6c1d28]" />
                      <span>Kirim Kado Fisik</span>
                    </div>
                    <span className="text-[10px] text-[#6b615b] transition-transform group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <div className="pt-3 text-left">
                    <p className="text-[11px] text-[#6b615b] mb-1">Alamat Penerima:</p>
                    <p className="text-xs font-semibold text-[#2a2421]">
                      Penerima: {giftRecipientName} {giftPhoneNumber ? `(${giftPhoneNumber})` : ""}
                    </p>
                    <p className="text-[11px] text-[#6b615b] my-2 leading-relaxed bg-[#f9f6f0] p-2.5 rounded-none border border-[#c5a880]/20">
                      {giftShippingAddress}
                    </p>
                    <button
                      onClick={() => copyToClipboard(fullShippingText, "Alamat Pengiriman")}
                      className="w-full py-2.5 px-3 rounded-none bg-[#f0eae0] text-[#2a2421] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:bg-[#6c1d28] active:text-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Alamat Lengkap</span>
                    </button>
                  </div>
                </details>
              )}
            </div>
          </section>
        )}

        {/* SECTION 8: BUKU TAMU & RSVP */}
        {Boolean(
          isFeatureAvailable("rsvp", { data, forcedThemeId: "botanical" }) ||
            isFeatureAvailable("wishes", { data, forcedThemeId: "botanical" })
        ) && (
          <section id="mobile-buku-tamu" className="w-full px-5 sm:px-8 py-14 sm:py-16 bg-[#f9f6f0] flex flex-col items-center relative overflow-hidden">
            {/* Mobile Bottom Botanical Floral Corners */}
            <BotanicalFloralCorner
              color={floralColor}
              position="bottom-left"
              className="w-36 h-36 opacity-35 -bottom-3 -left-3"
            />
            <BotanicalFloralCorner
              color={floralColor}
              position="bottom-right"
              className="w-36 h-36 opacity-35 -bottom-3 -right-3"
            />
            <div className="text-center mb-8 relative z-10 scroll-reveal">
              <h2 className="font-serif-eb text-2xl sm:text-3xl text-[#2a2421] font-normal">
                RSVP &amp; Ucapan Doa
              </h2>
            </div>

            {isFeatureAvailable("rsvp", { data, forcedThemeId: "botanical" }) && (
              <div className="scroll-reveal w-full max-w-md bg-white rounded-none p-5 sm:p-6 shadow-sm border border-[#c5a880]/30 mb-8 relative z-10">
                <form onSubmit={handleRsvpSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6b615b] uppercase tracking-wider mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      placeholder="Nama Tamu"
                      className="w-full px-3 py-2 rounded-none bg-[#f9f6f0] text-xs border border-[#c5a880]/30 outline-none focus:border-[#6c1d28]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#6b615b] uppercase tracking-wider mb-1">
                      Kehadiran
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRsvpAttendance("Hadir")}
                        className={`py-2 rounded-none text-xs font-semibold ${
                          rsvpAttendance === "Hadir"
                            ? "bg-[#6c1d28] text-white"
                            : "bg-[#f9f6f0] text-[#6b615b]"
                        }`}
                      >
                        Hadir Sukacita
                      </button>
                      <button
                        type="button"
                        onClick={() => setRsvpAttendance("Tidak Hadir")}
                        className={`py-2 rounded-none text-xs font-semibold ${
                          rsvpAttendance === "Tidak Hadir"
                            ? "bg-[#6c1d28] text-white"
                            : "bg-[#f9f6f0] text-[#6b615b]"
                        }`}
                      >
                        Berhalangan
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#6b615b] uppercase tracking-wider mb-1">
                        Jumlah Tamu
                      </label>
                      <select
                        value={rsvpCount}
                        onChange={(e) => setRsvpCount(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-none bg-[#f9f6f0] text-xs border border-[#c5a880]/30 outline-none"
                      >
                        <option value="1">1 Orang</option>
                        <option value="2">2 Orang</option>
                        <option value="3">3 Orang</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#6b615b] uppercase tracking-wider mb-1">
                        Sesi Acara
                      </label>
                      <select
                        value={rsvpSession}
                        onChange={(e) => setRsvpSession(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-none bg-[#f9f6f0] text-xs border border-[#c5a880]/30 outline-none"
                      >
                        <option value="Semua Sesi Acara">Semua Sesi</option>
                        {schedules.map((sch, i) => (
                          <option key={i} value={sch.eventName}>
                            {sch.eventName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#6b615b] uppercase tracking-wider mb-1">
                      Doa &amp; Ucapan Restu
                    </label>
                    <textarea
                      rows={2}
                      value={rsvpWishes}
                      onChange={(e) => setRsvpWishes(e.target.value)}
                      placeholder="Tuliskan ucapan selamat..."
                      className="w-full px-3 py-2 rounded-none bg-[#f9f6f0] text-xs border border-[#c5a880]/30 outline-none focus:border-[#6c1d28] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-none bg-[#6c1d28] hover:bg-[#4e0514] text-white text-xs font-semibold uppercase tracking-wider shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Reservasi & Doa"}
                  </button>
                </form>
              </div>
            )}

            {/* Wishes Stream Feed (Fixed solid height, non-flexible) */}
            {isFeatureAvailable("wishes", { data, forcedThemeId: "botanical" }) && (
              <div className="scroll-reveal w-full max-w-md bg-white rounded-none p-5 sm:p-6 shadow-sm border border-[#c5a880]/30 min-h-[360px] h-[360px] flex flex-col justify-between relative z-10">
                <div className="flex items-center justify-between pb-2 border-b border-[#c5a880]/20 shrink-0">
                  <span className="font-serif-eb text-base font-semibold text-[#2a2421]">
                    Doa &amp; Ucapan
                  </span>
                  <span className="text-[11px] font-bold text-[#6c1d28] bg-[#f4ece0] px-2.5 py-0.5 rounded-none">
                    {wishesList.length} Doa
                  </span>
                </div>

                {(() => {
                  const MOBILE_PER_PAGE = 3;
                  const totalMobilePages = Math.max(1, Math.ceil(wishesList.length / MOBILE_PER_PAGE));
                  const pageWishes = wishesList.slice((mobileWishPage - 1) * MOBILE_PER_PAGE, mobileWishPage * MOBILE_PER_PAGE);

                  return (
                    <>
                      <div className="h-[235px] min-h-[235px] max-h-[235px] flex flex-col justify-start gap-2 overflow-hidden my-auto">
                        {pageWishes.map((wish) => (
                          <div
                            key={`m-wish-${wish.id}`}
                            className="p-2.5 rounded-none bg-[#f9f6f0] border border-[#c5a880]/20 shrink-0"
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs font-bold text-[#2a2421] truncate">{wish.senderName}</span>
                              <span className="text-[10px] text-[#6b615b] shrink-0">{wish.timeAgo}</span>
                            </div>
                            <p className="text-xs text-[#6b615b] leading-relaxed line-clamp-2">&quot;{wish.message}&quot;</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#c5a880]/20 text-xs text-[#6b615b] shrink-0">
                        <span className="text-[11px]">
                          Halaman {mobileWishPage} dari {totalMobilePages}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setMobileWishPage((p) => Math.max(1, p - 1))}
                            disabled={mobileWishPage === 1}
                            className="px-2.5 py-1 border border-[#c5a880]/30 bg-[#f9f6f0] hover:bg-[#6c1d28] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors rounded-none text-[11px] font-semibold cursor-pointer"
                          >
                            Sebelumnya
                          </button>
                          <button
                            type="button"
                            onClick={() => setMobileWishPage((p) => Math.min(totalMobilePages, p + 1))}
                            disabled={mobileWishPage === totalMobilePages}
                            className="px-2.5 py-1 border border-[#c5a880]/30 bg-[#f9f6f0] hover:bg-[#6c1d28] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors rounded-none text-[11px] font-semibold cursor-pointer"
                          >
                            Selanjutnya
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </section>
        )}

        {/* FOOTER */}
        <footer className="w-full px-6 py-16 bg-[#f0ede9] text-center flex flex-col items-center border-t border-[#c5a880]/30 pb-28">
          <div className="scroll-reveal flex flex-col items-center w-full">
            <Heart className="w-5 h-5 text-[#c5a880] mb-3 fill-current opacity-70" />
            <p className="text-xs text-[#6b615b] max-w-sm mb-4 leading-relaxed">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
            </p>
            <h3 className="font-serif-eb text-xl text-[#2a2421] font-semibold mb-4">
              {coupleDisplayName}
            </h3>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Undangan Pernikahan ${coupleDisplayName}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-5 rounded-none bg-white text-[#2a2421] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-xs border border-[#c5a880]/30 mb-6 cursor-pointer hover:bg-[#6c1d28] hover:text-white transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan Undangan</span>
            </a>

            <p className="text-[10px] text-[#6b615b] uppercase tracking-widest">
              Invity by Fasaro © 2026
            </p>
          </div>
        </footer>

        {/* Mobile Sticky Bottom Nav */}
        {isOpen && (
          <nav
            className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 lg:hidden bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-none border border-[#c5a880]/40 shadow-xl flex items-center gap-4 text-xs font-medium text-[#6b615b] animate-in fade-in duration-500"
            aria-label="Navigasi Undangan"
          >
            <a
              href="#mobile-home"
              className="flex flex-col items-center p-1 hover:text-[#6c1d28] transition-colors"
            >
              <Home className="w-4 h-4 text-[#c5a880]" />
              <span className="text-[9px] mt-0.5 font-semibold">Beranda</span>
            </a>
            <a
              href="#mobile-kisah"
              className="flex flex-col items-center p-1 hover:text-[#6c1d28] transition-colors"
            >
              <Heart className="w-4 h-4 text-[#6c1d28]" />
              <span className="text-[9px] mt-0.5 font-semibold">Kisah</span>
            </a>
            <a
              href="#mobile-acara"
              className="flex flex-col items-center p-1 hover:text-[#6c1d28] transition-colors"
            >
              <Calendar className="w-4 h-4 text-[#c5a880]" />
              <span className="text-[9px] mt-0.5 font-semibold">Acara</span>
            </a>
            <a
              href="#mobile-galeri"
              className="flex flex-col items-center p-1 hover:text-[#6c1d28] transition-colors"
            >
              <Camera className="w-4 h-4 text-[#6c1d28]" />
              <span className="text-[9px] mt-0.5 font-semibold">Galeri</span>
            </a>
            <a
              href="#mobile-hadiah"
              className="flex flex-col items-center p-1 hover:text-[#6c1d28] transition-colors"
            >
              <Package className="w-4 h-4 text-[#c5a880]" />
              <span className="text-[9px] mt-0.5 font-semibold">Hadiah</span>
            </a>
            <a
              href="#mobile-buku-tamu"
              className="flex flex-col items-center p-1 hover:text-[#6c1d28] transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-[#6c1d28]" />
              <span className="text-[9px] mt-0.5 font-semibold">RSVP</span>
            </a>
          </nav>
        )}
      </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. LIGHTBOX MODAL PREVIEW                                                */}
      {/* ========================================================================= */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImg}
            alt="Preview Kenangan"
            className="max-w-full max-h-[85vh] rounded-none object-contain shadow-2xl"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "/templates/botanical/gallery/gallery-1.jpg";
            }}
          />
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white text-[#2a2421] flex items-center justify-center hover:bg-[#f0ede9] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. GUEST QR CODE TICKET MODAL                                            */}
      {/* ========================================================================= */}
      {showQrTicketModal && isFeatureAvailable("qr_ticket", { data, forcedThemeId: "botanical" }) && (
        <div
          onClick={() => setShowQrTicketModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-none max-w-xs w-full p-5 border border-[#c5a880]/30 shadow-2xl text-center space-y-3"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#6c1d28]" />
                <span className="font-bold text-xs text-[#2a2421]">Tiket Masuk Tamu</span>
              </div>
              <button
                onClick={() => setShowQrTicketModal(false)}
                className="p-1 rounded-none text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-0.5">
              <p className="text-[11px] uppercase tracking-wider text-[#6b615b] font-semibold">
                Tamu Terhormat
              </p>
              <h4 className="font-bold text-base text-[#2a2421]">{guestName}</h4>
            </div>

            <div className="bg-[#f9f6f0] p-3 rounded-none border border-[#c5a880]/30 inline-block mx-auto shadow-inner">
              {qrTicketDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrTicketDataUrl} alt="QR Tiket" className="w-44 h-44 mx-auto rounded-none" />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-xs text-stone-400">
                  Menyiapkan QR...
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#6b615b]">
              Tunjukkan kode QR ini kepada penerima tamu di meja resepsi acara pernikahan.
            </p>

            <button
              type="button"
              onClick={() => setShowQrTicketModal(false)}
              className="w-full py-2 px-3 rounded-none bg-[#6c1d28] text-white text-xs font-semibold hover:bg-[#4e0514] transition-colors cursor-pointer"
            >
              Tutup Tiket
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FLOATING VINYL DISC AUDIO CONTROLLER (FIXED BOTTOM RIGHT)              */}
      {/* ========================================================================= */}
      {isFeatureAvailable("music", { data, forcedThemeId: "botanical" }) && (
        <aside
          aria-label="Pemutar Musik Latar"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 pointer-events-auto"
        >
          <button
            type="button"
            onClick={toggleAudio}
            aria-label={isPlaying ? "Jeda Musik Latar" : "Putar Musik Latar"}
            title={isPlaying ? "Jeda Musik Latar" : "Putar Musik Latar"}
            className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#2a2421]/95 border-2 border-[#c5a880] text-[#c5a880] shadow-2xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <>
                {/* Vinyl record spinning animation */}
                <div className="w-8 h-8 rounded-full bg-[#1c1612] flex items-center justify-center animate-spin [animation-duration:4s]">
                  <div className="w-3 h-3 rounded-full bg-[#c5a880] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#fcf9f4]" />
                  </div>
                </div>
                {/* Audio pulse badge */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6c1d28] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#6c1d28]"></span>
                </span>
              </>
            ) : (
              <Play className="w-5 h-5 ml-0.5 text-stone-400 group-hover:text-[#c5a880] transition-colors" />
            )}
          </button>
          <span className="hidden sm:inline-block bg-[#2a2421]/90 text-[#fcf9f4] text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-[#c5a880]/30 backdrop-blur-md shadow-lg font-sans">
            {isPlaying ? "Playing: Romantic Melody" : "Music Paused"}
          </span>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* 5. FLOATING TOAST NOTIFICATION                                           */}
      {/* ========================================================================= */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#2a2421] text-white py-2.5 px-5 rounded-none text-xs font-medium shadow-xl transition-all duration-300 z-50 flex items-center gap-2 pointer-events-none ${
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

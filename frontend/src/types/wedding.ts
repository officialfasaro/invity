export interface StoryItem {
  date: string;
  title: string;
  story: string;
  imageUrl?: string | null;
}

export interface CoupleInfo {
  groomName: string;
  groomNickname?: string | null;
  groomFather?: string | null;
  groomMother?: string | null;
  groomInstagram?: string | null;
  groomPhoto?: string | null;
  brideName: string;
  brideNickname?: string | null;
  brideFather?: string | null;
  brideMother?: string | null;
  brideInstagram?: string | null;
  bridePhoto?: string | null;
  greetingMessage?: string | null;
  stories?: StoryItem[] | null;
  musicUrl?: string | null;
  musicTitle?: string | null;
  youtubeVideoUrl?: string | null;
  desktopCoverImage?: string | null;
  useVideoAsDesktopCover?: boolean | null;
  giftAddress?: string | null;
  giftReceiver?: string | null;
  giftPhone?: string | null;
  backgroundImage?: string | null;
  floralOrnament?: string | null;
}


export interface EventScheduleItem {
  id?: string;
  eventName: string;
  date: string | Date;
  startTime: string;
  endTime?: string | null;
  venueName: string;
  address: string;
  mapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface GalleryItem {
  id?: string;
  imageUrl: string;
  caption?: string | null;
  sortOrder: number;
}

export interface BankAccountItem {
  id?: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisImageUrl?: string | null;
}

export interface WishItem {
  id: string;
  senderName: string;
  message: string;
  reaction?: string | null;
  createdAt: string | Date;
}

export interface WeddingInvitationData {
  id: string;
  slug: string;
  title: string;
  themeId: string;
  coupleInfo: CoupleInfo;
  activeUntil?: string | Date | null;
  isActive: boolean;
  eventSchedules: EventScheduleItem[];
  galleries: GalleryItem[];
  bankAccounts: BankAccountItem[];
  musicUrl?: string | null;
  musicTitle?: string | null;
  youtubeVideoUrl?: string | null;
  tier?: string;
  systemSettings?: Record<string, string>;
  wishes?: WishItem[];
}

export type FeatureId =
  | "music"
  | "rsvp"
  | "wishes"
  | "digital_gift"
  | "physical_gift"
  | "love_story"
  | "gallery"
  | "countdown"
  | "google_maps"
  | "qr_ticket";

export interface FeatureDefinition {
  id: FeatureId;
  name: string;
  category: string;
  description: string;
}

export const ALL_FEATURES: FeatureDefinition[] = [
  { id: "music", name: "Musik Latar (Autoplay)", category: "Audio & Suasana", description: "Musik romantis autoplay & pemutar audio piringan hitam" },
  { id: "rsvp", name: "Konfirmasi Kehadiran (RSVP)", category: "Interaksi Tamu", description: "Formulir konfirmasi kehadiran tamu undangan secara realtime" },
  { id: "wishes", name: "Buku Tamu & Doa Ucapan", category: "Interaksi Tamu", description: "Dinding ucapan doa restu interaktif dari sahabat dan keluarga" },
  { id: "digital_gift", name: "Amplop Digital & QRIS", category: "Hadiah & Kado", description: "Nomor rekening bank & kode QRIS donasi amplop digital" },
  { id: "physical_gift", name: "Kirim Kado Fisik", category: "Hadiah & Kado", description: "Alamat pengiriman kado fisik langsung ke kediaman mempelai" },
  { id: "love_story", name: "Perjalanan Kasih (Love Story)", category: "Konten Pengantin", description: "Timeline milestone kisah cinta dari pertemuan hingga lamaran" },
  { id: "gallery", name: "Galeri Foto HD & Lightbox", category: "Media", description: "Album galeri foto beresolusi tinggi dengan popup layar penuh" },
  { id: "countdown", name: "Hitung Mundur & Kalender", category: "Waktu & Jadwal", description: "Live timer hitung mundur acara & pengingat Google Calendar" },
  { id: "google_maps", name: "Navigasi Google Maps", category: "Lokasi Acara", description: "Peta lokasi interaktif & petunjuk rute sekali klik" },
  { id: "qr_ticket", name: "Tiket Masuk Tamu (QR Code)", category: "Keamanan Acara", description: "Kode QR personal untuk check-in resepsi tamu di meja penerima" },
];

export type ThemeId = "botanical" | "editorial" | "gothic" | "raka-ayu" | "wedding-3d" | string;

export interface ThemeMeta {
  id: ThemeId;
  code: string;
  name: string;
  category: string;
  tier: "PRO" | "GENERAL" | "FREE";
  proExplanation?: string;
  description: string;
  fontHeading: string;
  fontBody: string;
  accentColor: string;
  bgPreview: string;
  thumbnail: string;
  secondaryThumbnail?: string;
  previewUrl: string;
  createdAt: string; // Tanggal rilis tema (YYYY-MM-DD)
  usageCount: number; // Penggunaan sah pada Hari H pernikahan
  isPopular?: boolean;
  isNew?: boolean;
  canChangeFont?: boolean;
  mockupBg?: string;
}

export const THEME_LIST: ThemeMeta[] = [
  {
    id: "wedding-3d",
    code: "Tema 01",
    name: "3D Celestial Universe",
    category: "3D Interaktif",
    tier: "PRO",
    proExplanation: "Hanya bisa digunakan di paket yang lebih tinggi (Paket Pro & VIP)",
    description: "Pengalaman 3D interaktif WebGL dengan cincin emas kembar berputar, taburan kelopak mawar 3D, dan galeri tilt interaktif.",
    fontHeading: "font-serif",
    fontBody: "font-sans",
    accentColor: "#d4b06a",
    bgPreview: "from-[#0c1624] via-[#1a2440] to-[#d4b06a]",
    thumbnail: "/templates/wedding-3d/cover.jpg",
    secondaryThumbnail: "/templates/wedding-3d/desktop-cover.jpg",
    previewUrl: "/invitation/demo-wedding-3d",
    createdAt: "2026-10-05",
    usageCount: 890,
    isPopular: true,
    isNew: true,
    canChangeFont: true,
    mockupBg: "from-[#0c1624] via-[#1a2440] to-[#243356]",
  },
  {
    id: "raka-ayu",
    code: "Tema 02",
    name: "Royal Emerald & Gold",
    category: "Royal & Adat",
    tier: "PRO",
    proExplanation: "Hanya bisa digunakan di paket yang lebih tinggi (Paket Pro & VIP)",
    description: "Pesona royal green & antique gold, gerbang pintu Prancis megah terbelah saat dibuka, dan kelopak bunga berjatuhan.",
    fontHeading: "font-serif",
    fontBody: "font-sans",
    accentColor: "#1f3a34",
    bgPreview: "from-[#1f3a34] via-[#2b4d45] to-[#b08a4a]",
    thumbnail: "/templates/raka-ayu/cover.jpg",
    secondaryThumbnail: "/templates/raka-ayu/desktop-cover.jpg",
    previewUrl: "/invitation/demo-raka-ayu",
    createdAt: "2026-09-20",
    usageCount: 1450,
    isPopular: true,
    isNew: false,
    canChangeFont: true,
    mockupBg: "from-[#142622] via-[#1f3a34] to-[#2c4e45]",
  },
  {
    id: "editorial",
    code: "Tema 03",
    name: "Editorial Linen & Arch",
    category: "Modern Editorial",
    tier: "PRO",
    proExplanation: "Hanya bisa digunakan di paket yang lebih tinggi (Paket Pro & VIP)",
    description: "Estetika tata letak majalah arsitektural mewah, frame arch melengkung, tekstur linen hangat, dan monogram cincin berkelas.",
    fontHeading: "font-serif",
    fontBody: "font-sans",
    accentColor: "#B8926A",
    bgPreview: "from-[#FAF8F5] via-[#F5F2EB] to-[#ECE9E2]",
    thumbnail: "/templates/editorial/cover.jpg",
    secondaryThumbnail: "/templates/editorial/desktop-cover.jpg",
    previewUrl: "/invitation/demo-editorial",
    createdAt: "2026-09-01",
    usageCount: 780,
    isPopular: false,
    isNew: false,
    canChangeFont: true,
    mockupBg: "from-[#4a4239] via-[#5e5449] to-[#73685a]",
  },
  {
    id: "gothic",
    code: "Tema 04",
    name: "Gothic Noir & Velvet",
    category: "Chiaroscuro & Adat",
    tier: "GENERAL",
    description: "Estetika chiaroscuro monokrom dramatis berpadu dengan crimson burgundy, amplop surat interaktif, dan font Bodoni klasik.",
    fontHeading: "font-serif",
    fontBody: "font-sans",
    accentColor: "#700B0B",
    bgPreview: "from-[#131313] via-[#1c1b1b] to-[#700b0b]",
    thumbnail: "/templates/gothic/cover.jpg",
    secondaryThumbnail: "/templates/gothic/desktop-left.jpg",
    previewUrl: "/invitation/demo-gothic",
    createdAt: "2026-10-02",
    usageCount: 420,
    isPopular: false,
    isNew: true,
    canChangeFont: true,
    mockupBg: "from-[#1a1111] via-[#2c1414] to-[#451818]",
  },
  {
    id: "botanical",
    code: "Tema 05",
    name: "Botanical Champagne Floral",
    category: "Floral Botanical",
    tier: "GENERAL",
    description: "Desain floral anggun dengan alunan musik piringan hitam klasik, palet champagne hangat, dan nuansa romantis asri.",
    fontHeading: "font-serif",
    fontBody: "font-sans",
    accentColor: "#725b38",
    bgPreview: "from-[#fcf9f4] via-[#f0ede9] to-[#c5a880]",
    thumbnail: "/templates/botanical/cover.jpg",
    secondaryThumbnail: "/templates/botanical/mekar-versa-cover.jpg",
    previewUrl: "/invitation/demo-botanical",
    createdAt: "2026-08-15",
    usageCount: 1120,
    isPopular: true,
    isNew: false,
    canChangeFont: true,
    mockupBg: "from-[#3d3830] via-[#524b42] to-[#696054]",
  },
];

/**
 * Validasi tema terbaru: mengambil maksimal 5 tema dengan tanggal rilis (createdAt) paling terakhir.
 */
export function validateNewestThemeIds(themes: ThemeMeta[], limit: number = 5): Set<string> {
  const sorted = [...themes].sort((a, b) => {
    const timeA = new Date(a.createdAt || "2026-01-01").getTime();
    const timeB = new Date(b.createdAt || "2026-01-01").getTime();
    return timeB - timeA;
  });
  return new Set(sorted.slice(0, limit).map((t) => t.id));
}

/**
 * Menghitung tema terlaris berdasarkan data penggunaan Hari H.
 * Jika sedang menggunakan filter, dihitung dari keseluruhan tema yang sedang ditampilkan menggunakan filter tersebut.
 * Jika tidak berfilter, dihitung dari keseluruhan tema.
 */
export function getPopularThemeIds(
  displayedThemes: ThemeMeta[],
  allThemes: ThemeMeta[] = THEME_LIST
): Set<string> {
  const targetList = displayedThemes.length > 0 ? displayedThemes : allThemes;
  if (targetList.length === 0) return new Set();

  const maxUsage = Math.max(...targetList.map((t) => t.usageCount || 0));
  if (maxUsage <= 0) return new Set();

  const threshold = Math.max(maxUsage * 0.75, 1);
  return new Set(targetList.filter((t) => (t.usageCount || 0) >= threshold).map((t) => t.id));
}


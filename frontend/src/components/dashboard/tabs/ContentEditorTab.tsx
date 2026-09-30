"use client";

import React, { useState, useRef } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  Loader2,
  Lock,
  Monitor,
  Music,
  Pause,
  Play,
  Plus,
  BookOpen,
  QrCode,
  Sparkles,
  Trash2,
  Upload,
  User,
  Video,
  Volume2,
} from "lucide-react";
import { WEDDING_QUOTES } from "@/lib/weddingQuotes";

interface MusicPreset {
  title: string;
  category: string;
  url: string;
}

const MUSIC_PRESETS: MusicPreset[] = [
  {
    title: "Janji Suci (Instrumental Romantis)",
    category: "Melow Romantis",
    url: "https://cdn.jsdelivr.net/gh/alfalaah404/undangan-nikah@main/index_files/janji-suci.mp3",
  },
  {
    title: "Lagu Pernikahan Impian (Syahdu & Lembut)",
    category: "Syahdu Puitis",
    url: "https://cdn.jsdelivr.net/gh/idindrakusuma/thekusuma@master/src/assets/music/lagu-pernikahan-impian.mp3",
  },
  {
    title: "Beautiful In White (Akustik Hangat)",
    category: "Akustik Hangat",
    url: "https://cdn.jsdelivr.net/gh/petershaan12/Weddingly-Free@main/public/music/wedding_song.mp3",
  },
  {
    title: "Kisah Kasih Abadi (Piano & Strings)",
    category: "Piano & Strings",
    url: "https://cdn.jsdelivr.net/gh/andikaputradev/wedding-invitation@main/public/audio/wedding-music.mp3",
  },
  {
    title: "Acoustic Sunset Romance (Petikan Lembut)",
    category: "Akustik Santai",
    url: "https://cdn.jsdelivr.net/gh/zachriek/nikah-yuk@master/public/assets/audio/music1.mp3",
  },
  {
    title: "Harmoni Janji Bahagia (Piano Melow)",
    category: "Piano Syahdu",
    url: "https://cdn.jsdelivr.net/gh/In-HyeokJang/new-mobile-wedding@master/public/music/bgm.mp3",
  },
  {
    title: "Fulfilling Romance (Alunan Tenang)",
    category: "Khidmat & Syar'i",
    url: "https://cdn.jsdelivr.net/gh/sakeenah-wedding/template@main/public/audio/fulfilling-humming.mp3",
  },
  {
    title: "Cinta Sejati (Romantic Acoustic)",
    category: "Romansa Manis",
    url: "https://cdn.jsdelivr.net/gh/zachriek/nikah-yuk@master/public/assets/audio/music2.mp3",
  },
  {
    title: "Classic Nocturne Romance (Piano Chopin)",
    category: "Klasik Elegan",
    url: "https://cdn.jsdelivr.net/npm/audio-lab@1.3.0/test/assets/chopin.mp3",
  },
  {
    title: "Sweet Wedding Harmony (Sentuhan Kasih)",
    category: "Pop Romantis",
    url: "https://cdn.jsdelivr.net/gh/salmanagustian/wedding-digital-invitation@master/public/assets/music/music.mp3",
  },
];

const PRESET_BANKS = [
  "BCA",
  "Mandiri",
  "BNI",
  "BRI",
  "BSI",
  "Bank Jago",
  "SeaBank",
  "Dana",
  "GoPay",
  "OVO",
];

interface ScheduleItem {
  id?: string;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  address: string;
  mapsUrl: string;
}

interface GalleryItem {
  imageUrl: string;
  caption: string;
  sortOrder: number;
}

interface BankItem {
  id?: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisImageUrl?: string;
}

interface StoryItem {
  date: string;
  title: string;
  story: string;
  imageUrl?: string;
}

interface ContentEditorTabProps {
  // General Info
  title: string;
  setTitle: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;

  // Groom & Bride
  groomName: string;
  setGroomName: (v: string) => void;
  groomNickname: string;
  setGroomNickname: (v: string) => void;
  groomFather: string;
  setGroomFather: (v: string) => void;
  groomMother: string;
  setGroomMother: (v: string) => void;
  groomInstagram: string;
  setGroomInstagram: (v: string) => void;
  groomPhoto: string;
  setGroomPhoto: (v: string) => void;

  brideName: string;
  setBrideName: (v: string) => void;
  brideNickname: string;
  setBrideNickname: (v: string) => void;
  brideFather: string;
  setBrideFather: (v: string) => void;
  brideMother: string;
  setBrideMother: (v: string) => void;
  brideInstagram: string;
  setBrideInstagram: (v: string) => void;
  bridePhoto: string;
  setBridePhoto: (v: string) => void;

  greetingMessage: string;
  setGreetingMessage: (v: string) => void;
  desktopCoverImage: string;
  setDesktopCoverImage: (v: string) => void;

  // Schedules
  schedules: ScheduleItem[];
  setSchedules: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;

  // Media
  galleries: GalleryItem[];
  setGalleries: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  musicUrl: string;
  setMusicUrl: (v: string) => void;
  youtubeVideoUrl: string;
  setYoutubeVideoUrl: (v: string) => void;
  useVideoAsDesktopCover?: boolean;
  setUseVideoAsDesktopCover?: (v: boolean) => void;

  // Digital Envelope
  bankAccounts: BankItem[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankItem[]>>;

  // Love Story
  stories: StoryItem[];
  setStories: React.Dispatch<React.SetStateAction<StoryItem[]>>;

  // Tier & Upgrade
  tier?: string | null;
  onUpgradeClick?: () => void;
  isReadOnly?: boolean;

  onSave: () => void;
  isSaving: boolean;
}

export const ContentEditorTab: React.FC<ContentEditorTabProps> = ({
  tier,
  onUpgradeClick,
  isReadOnly = false,
  title,
  setTitle,
  slug,
  setSlug,
  groomName,
  setGroomName,
  groomNickname,
  setGroomNickname,
  groomFather,
  setGroomFather,
  groomMother,
  setGroomMother,
  groomInstagram,
  setGroomInstagram,
  groomPhoto,
  setGroomPhoto,
  brideName,
  setBrideName,
  brideNickname,
  setBrideNickname,
  brideFather,
  setBrideFather,
  brideMother,
  setBrideMother,
  brideInstagram,
  setBrideInstagram,
  bridePhoto,
  setBridePhoto,
  greetingMessage,
  setGreetingMessage,
  schedules,
  setSchedules,
  galleries,
  setGalleries,
  musicUrl,
  setMusicUrl,
  youtubeVideoUrl,
  setYoutubeVideoUrl,
  useVideoAsDesktopCover = false,
  setUseVideoAsDesktopCover,
  bankAccounts,
  setBankAccounts,
  stories,
  setStories,
  desktopCoverImage,
  setDesktopCoverImage,
}) => {
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [uploadMusicError, setUploadMusicError] = useState<string | null>(null);
  const [uploadMusicSuccess, setUploadMusicSuccess] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const [playingPresetUrl, setPlayingPresetUrl] = useState<string | null>(null);
  const presetAudioRef = useRef<HTMLAudioElement | null>(null);

  // States for Photo Uploads
  const [isUploadingGroomPhoto, setIsUploadingGroomPhoto] = useState(false);
  const [isUploadingBridePhoto, setIsUploadingBridePhoto] = useState(false);
  const [isUploadingQrisIndex, setIsUploadingQrisIndex] = useState<number | null>(null);
  const [isUploadingGalleryIndex, setIsUploadingGalleryIndex] = useState<number | null>(null);
  const [isUploadingStoryIndex, setIsUploadingStoryIndex] = useState<number | null>(null);
  const [customBankIndices, setCustomBankIndices] = useState<Set<number>>(new Set());

  const isStarterTier = tier === "STARTER" || tier === "FREE" || !tier;

  // Helper untuk membersihkan dan membuat tautan otomatis dari nama panggilan
  const generateAutoSlug = (gNick: string, bNick: string) => {
    const g = (gNick || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const b = (bNick || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (g && b) return `${g}-${b}`;
    if (g) return g;
    if (b) return b;
    return "";
  };

  // Handler perubahan nama panggilan mempelai pria (otomatis sinkronkan tautan)
  const handleGroomNicknameChange = (val: string) => {
    setGroomNickname(val);
    const auto = generateAutoSlug(val, brideNickname);
    if (auto) setSlug(auto);
  };

  // Handler perubahan nama panggilan mempelai wanita (otomatis sinkronkan tautan)
  const handleBrideNicknameChange = (val: string) => {
    setBrideNickname(val);
    const auto = generateAutoSlug(groomNickname, val);
    if (auto) setSlug(auto);
  };

  // Image compression: Maks 1MB. Jika file <= 1MB, tidak dikompresi berlebihan ("jika masih dibawah 1MB boleh").
  // Jika > 1MB, kompresi standar via Canvas (HD 1600px, 0.82 -> 0.70) hingga <= 1MB.
  const compressImageStandard = async (file: File, maxSizeMB: number = 1): Promise<Blob> => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    // Jika ukuran file sudah di bawah 1MB, loloskan langsung sesuai arahan pengguna
    if (file.size <= maxSizeBytes) {
      return file;
    }

    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        // Dimensi standar HD (1600px sisi terpanjang mempertahankan ketajaman visual)
        const maxDimension = 1600;
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Kompresi standar ke JPEG 0.82
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            // Jika hasil kompresi pertama masih > 1MB, turunkan quality ke 0.70
            if (blob.size > maxSizeBytes) {
              canvas.toBlob(
                (secondBlob) => {
                  resolve(secondBlob || blob);
                },
                "image/jpeg",
                0.70
              );
            } else {
              resolve(blob);
            }
          },
          "image/jpeg",
          0.82
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.src = objectUrl;
    });
  };

  const handleGroomPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGroomPhoto(true);
    try {
      const blobToUpload = await compressImageStandard(file, 1);
      if (blobToUpload.size > 1.15 * 1024 * 1024) {
        throw new Error("Ukuran foto mempelai pria melebihi batas 1MB.");
      }
      const formData = new FormData();
      formData.append("file", blobToUpload, file.name);
      formData.append("folder", "couples");

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah foto mempelai pria");
      }
      setGroomPhoto(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah foto mempelai pria");
    } finally {
      setIsUploadingGroomPhoto(false);
      e.target.value = "";
    }
  };

  const handleBridePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBridePhoto(true);
    try {
      const blobToUpload = await compressImageStandard(file, 1);
      if (blobToUpload.size > 1.15 * 1024 * 1024) {
        throw new Error("Ukuran foto mempelai wanita melebihi batas 1MB.");
      }
      const formData = new FormData();
      formData.append("file", blobToUpload, file.name);
      formData.append("folder", "couples");

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah foto mempelai wanita");
      }
      setBridePhoto(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah foto mempelai wanita");
    } finally {
      setIsUploadingBridePhoto(false);
      e.target.value = "";
    }
  };

  const handleQrisUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingQrisIndex(idx);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "qris");

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah foto QRIS");
      }
      const updated = [...bankAccounts];
      updated[idx].qrisImageUrl = data.url;
      setBankAccounts(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah foto QRIS");
    } finally {
      setIsUploadingQrisIndex(null);
      e.target.value = "";
    }
  };

  const handleGalleryPhotoUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGalleryIndex(idx);
    try {
      const blobToUpload = await compressImageStandard(file, 1);
      if (blobToUpload.size > 1.15 * 1024 * 1024) {
        throw new Error("Ukuran foto galeri melebihi batas 1MB.");
      }
      const formData = new FormData();
      formData.append("file", blobToUpload, file.name);
      formData.append("folder", "galleries");

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah foto galeri");
      }
      const updated = [...galleries];
      updated[idx].imageUrl = data.url;
      setGalleries(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah foto galeri");
    } finally {
      setIsUploadingGalleryIndex(null);
      e.target.value = "";
    }
  };

  const handleStoryPhotoUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingStoryIndex(idx);
    try {
      const blobToUpload = await compressImageStandard(file, 1);
      if (blobToUpload.size > 1.15 * 1024 * 1024) {
        throw new Error("Ukuran foto kisah cinta melebihi batas 1MB.");
      }
      const formData = new FormData();
      formData.append("file", blobToUpload, file.name);
      formData.append("folder", "stories");

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah foto kisah cinta");
      }
      const updated = [...stories];
      updated[idx].imageUrl = data.url;
      setStories(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah foto kisah cinta");
    } finally {
      setIsUploadingStoryIndex(null);
      e.target.value = "";
    }
  };

  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadMusicError(null);
    setUploadMusicSuccess(null);
    setIsUploadingMusic(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/music", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah file audio");
      }

      setMusicUrl(data.url);
      setUploadMusicSuccess(`Berhasil mengunggah: ${data.fileName || file.name}`);
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        setIsPreviewPlaying(false);
      }
    } catch (err) {
      setUploadMusicError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah musik"
      );
    } finally {
      setIsUploadingMusic(false);
      e.target.value = "";
    }
  };

  const handleTogglePlayPreset = (url: string) => {
    if (audioPreviewRef.current && isPreviewPlaying) {
      audioPreviewRef.current.pause();
      setIsPreviewPlaying(false);
    }

    if (!presetAudioRef.current) return;

    if (playingPresetUrl === url) {
      presetAudioRef.current.pause();
      setPlayingPresetUrl(null);
    } else {
      presetAudioRef.current.src = url;
      presetAudioRef.current
        .play()
        .then(() => setPlayingPresetUrl(url))
        .catch(() => setPlayingPresetUrl(null));
    }
  };

  const toggleAudioPreview = () => {
    if (!musicUrl) return;
    if (!audioPreviewRef.current) return;

    if (presetAudioRef.current && playingPresetUrl) {
      presetAudioRef.current.pause();
      setPlayingPresetUrl(null);
    }

    if (isPreviewPlaying) {
      audioPreviewRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      audioPreviewRef.current.src = musicUrl;
      audioPreviewRef.current
        .play()
        .then(() => setIsPreviewPlaying(true))
        .catch(() => {
          setIsPreviewPlaying(false);
          setUploadMusicError(
            "Tidak dapat memutar audio. Pastikan URL berupa direct link file audio (.mp3)."
          );
        });
    }
  };

  const handleApplyPreset = (url: string) => {
    setMusicUrl(url);
    setUploadMusicError(null);
    setUploadMusicSuccess("Preset lagu berhasil dipilih!");
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setIsPreviewPlaying(false);
    }
    if (presetAudioRef.current && playingPresetUrl) {
      presetAudioRef.current.pause();
      setPlayingPresetUrl(null);
    }
  };

  const isYouTubeUrl = (url: string) => {
    return (
      url.includes("youtube.com/") ||
      url.includes("youtu.be/") ||
      url.includes("m.youtube.com/")
    );
  };

  const toggleSection = (idx: number) => {
    setOpenSection(openSection === idx ? null : idx);
  };

  const sections = [
    { id: 0, title: "1. Informasi Pasangan Mempelai", icon: Heart, badge: "Wajib" },
    { id: 1, title: "2. Jadwal & Lokasi Acara", icon: Calendar, badge: `${schedules.length} Sesi` },
    { id: 2, title: "3. Musik Latar Undangan (.mp3)", icon: Music, badge: musicUrl ? "Terpasang" : "Opsional" },
    { id: 3, title: "4. Video Teaser Prewedding (YouTube)", icon: Video, badge: youtubeVideoUrl ? "Tersedia" : "Opsional" },
    { id: 4, title: "5. Galeri Foto Prewedding", icon: ImageIcon, badge: `${galleries.length} Foto` },
    { id: 5, title: "6. Amplop Digital & QRIS", icon: CreditCard, badge: `${bankAccounts.length} Rekening` },
    { id: 6, title: "7. Cerita Cinta (Love Story)", icon: BookOpen, badge: `${stories.length} Momen` },
  ];

  return (
    <div className="space-y-4">
      {/* Read-Only Warning Banner if user has no paid package */}
      {isReadOnly && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs animate-in fade-in">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs sm:text-sm">Mode Pratinjau (Hanya Lihat)</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Akun Anda belum memiliki paket aktif. Anda dapat melihat-lihat tata letak form &amp; pratinjau tema, namun perubahan tidak dapat disimpan. Silakan pilih paket di menu Langganan &amp; Paket untuk mulai mengedit.
            </p>
            {onUpgradeClick && (
              <button
                type="button"
                onClick={onUpgradeClick}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span>Pilih &amp; Aktifkan Paket</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Editor Konten Undangan
          </h2>
          <p className="text-xs text-slate-500">
            Atur seluruh konten pernikahan Anda secara langsung. Setiap perubahan otomatis tampil di website undangan.
          </p>
        </div>
      </div>

      {/* Accordion 1: Mempelai */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(0)}
          className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm sm:text-base text-slate-900 hover:bg-slate-50 min-h-[52px] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <span className="block">{sections[0].title}</span>
              <span className="text-[11px] text-slate-400 font-normal">Nama, foto, profil keluarga &amp; ucapan pembuka</span>
            </div>
          </div>
          {openSection === 0 ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {openSection === 0 && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#E2E8F0] space-y-5 text-xs animate-in fade-in">
            {/* Judul & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Judul Undangan:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Pernikahan Rian & Sinta"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[44px] text-xs sm:text-sm focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <label className="font-semibold text-slate-700">Tautan Undangan:</label>
                    {isStarterTier ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <Lock className="w-2.5 h-2.5 text-amber-600" />
                        <span>Otomatis (Starter)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Kustom Bebas Aktif</span>
                      </span>
                    )}
                  </div>

                  {isStarterTier && onUpgradeClick && (
                    <button
                      type="button"
                      onClick={onUpgradeClick}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#F97316] text-white font-semibold hover:bg-[#EA580C] transition-colors cursor-pointer"
                    >
                      Upgrade untuk Kustom Tautan
                    </button>
                  )}
                </div>

                <div className={`flex items-center rounded-lg border px-3 min-h-[44px] transition-colors ${
                  isStarterTier
                    ? "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                    : "border-[#E2E8F0] bg-white focus-within:border-[#F97316] focus-within:ring-1 focus-within:ring-[#F97316]"
                }`}>
                  <span className="text-slate-400 font-mono text-xs select-none">fasaro.id/</span>
                  <input
                    type="text"
                    value={slug}
                    disabled={isStarterTier}
                    readOnly={isStarterTier}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="nama-pasangan"
                    className={`w-full bg-transparent py-2 px-1 font-mono text-xs outline-none ${
                      isStarterTier ? "text-slate-600 cursor-not-allowed font-medium" : "text-slate-900"
                    }`}
                  />
                  {isStarterTier && (
                    <span title="Paket Starter tidak dapat kustom tautan">
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
                    </span>
                  )}
                </div>

                {isStarterTier && (
                  <p className="text-[10.5px] text-slate-500 flex items-start gap-1 pt-0.5">
                    <Lock className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                    <span>Tautan disinkronkan otomatis dari nama panggilan. Upgrade ke <strong>Paket Elegant atau Ultimate</strong> untuk mengubah subdomain secara bebas.</span>
                  </p>
                )}
              </div>
            </div>

            {/* Mempelai Pria */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <h3 className="font-semibold text-[#F97316] text-xs uppercase tracking-wider">
                Mempelai Pria (Groom)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Nama Lengkap &amp; Gelar:</label>
                  <input
                    type="text"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    placeholder="Rian Pratama, S.Kom"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Nama Panggilan: <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={groomNickname}
                    onChange={(e) => handleGroomNicknameChange(e.target.value)}
                    placeholder="Rian"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Wajib diisi &mdash; digunakan untuk tautan undangan</p>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Nama Ayah:</label>
                  <input
                    type="text"
                    value={groomFather}
                    onChange={(e) => setGroomFather(e.target.value)}
                    placeholder="Bpk. Bambang Wijaya"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Nama Ibu:</label>
                  <input
                    type="text"
                    value={groomMother}
                    onChange={(e) => setGroomMother(e.target.value)}
                    placeholder="Ibu Sri Wahyuni"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Instagram (@username):</label>
                  <input
                    type="text"
                    value={groomInstagram}
                    onChange={(e) => setGroomInstagram(e.target.value)}
                    placeholder="rian.pratama"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2 pt-1 border-t border-slate-200/70">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-semibold block text-xs">
                      Foto Mempelai Pria:
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      Maks. 1MB (Otomatis Kompres jika &gt; 1MB)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 bg-white overflow-hidden flex items-center justify-center relative shrink-0">
                      {groomPhoto ? (
                        <img
                          src={groomPhoto}
                          alt="Foto Mempelai Pria"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <label
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                            isUploadingGroomPhoto
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-wait"
                              : "bg-white hover:bg-orange-50 text-[#F97316] border-orange-200 hover:border-[#F97316]"
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleGroomPhotoUpload}
                            disabled={isUploadingGroomPhoto}
                            className="sr-only"
                          />
                          {isUploadingGroomPhoto ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F97316]" />
                              <span>Mengunggah...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Foto Pria</span>
                            </>
                          )}
                        </label>

                        {groomPhoto && (
                          <button
                            type="button"
                            onClick={() => setGroomPhoto("")}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={groomPhoto}
                        onChange={(e) => setGroomPhoto(e.target.value)}
                        placeholder="Atau tempel URL gambar (https://...)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-700 text-xs focus:border-[#F97316] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mempelai Wanita */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <h3 className="font-semibold text-[#F97316] text-xs uppercase tracking-wider">
                Mempelai Wanita (Bride)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Nama Lengkap &amp; Gelar:</label>
                  <input
                    type="text"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    placeholder="Sinta Anggraini, S.E"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Nama Panggilan: <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={brideNickname}
                    onChange={(e) => handleBrideNicknameChange(e.target.value)}
                    placeholder="Sinta"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Wajib diisi &mdash; digunakan untuk tautan undangan</p>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Nama Ayah:</label>
                  <input
                    type="text"
                    value={brideFather}
                    onChange={(e) => setBrideFather(e.target.value)}
                    placeholder="Bpk. Herman Santoso"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Nama Ibu:</label>
                  <input
                    type="text"
                    value={brideMother}
                    onChange={(e) => setBrideMother(e.target.value)}
                    placeholder="Ibu Dewi Lestari"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Instagram (@username):</label>
                  <input
                    type="text"
                    value={brideInstagram}
                    onChange={(e) => setBrideInstagram(e.target.value)}
                    placeholder="sinta.anggraini"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2 pt-1 border-t border-slate-200/70">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-semibold block text-xs">
                      Foto Mempelai Wanita:
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      Maks. 1MB (Otomatis Kompres jika &gt; 1MB)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 bg-white overflow-hidden flex items-center justify-center relative shrink-0">
                      {bridePhoto ? (
                        <img
                          src={bridePhoto}
                          alt="Foto Mempelai Wanita"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <label
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                            isUploadingBridePhoto
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-wait"
                              : "bg-white hover:bg-orange-50 text-[#F97316] border-orange-200 hover:border-[#F97316]"
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBridePhotoUpload}
                            disabled={isUploadingBridePhoto}
                            className="sr-only"
                          />
                          {isUploadingBridePhoto ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F97316]" />
                              <span>Mengunggah...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Foto Wanita</span>
                            </>
                          )}
                        </label>

                        {bridePhoto && (
                          <button
                            type="button"
                            onClick={() => setBridePhoto("")}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={bridePhoto}
                        onChange={(e) => setBridePhoto(e.target.value)}
                        placeholder="Atau tempel URL gambar (https://...)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-700 text-xs focus:border-[#F97316] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pesan Pembuka */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-700">Pesan Pembuka / Salam Hangat:</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-700 text-xs focus:border-[#F97316] outline-none"
                defaultValue=""
                onChange={(e) => {
                  const selected = WEDDING_QUOTES.find((q) => q.id === e.target.value);
                  if (selected) setGreetingMessage(selected.text);
                }}
              >
                <option value="">— Pilih Template Quote Pernikahan —</option>
                {WEDDING_QUOTES.map((q) => (
                  <option key={q.id} value={q.id}>{q.label}</option>
                ))}
              </select>
              <textarea
                rows={4}
                value={greetingMessage}
                onChange={(e) => setGreetingMessage(e.target.value)}
                placeholder="Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan..."
                className="w-full p-3 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 text-xs sm:text-sm focus:border-[#F97316] outline-none"
              />
              <p className="text-[10px] text-slate-400">Pilih template dari daftar di atas atau ketik pesan pembuka kustom Anda.</p>
            </div>

            {/* Cover Layar Desktop */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#F97316]" />
                <label className="font-semibold text-slate-700">Cover Layar Desktop (Split Screen):</label>
              </div>
              <p className="text-xs text-slate-500">Foto ini akan muncul di bagian kiri layar pada tampilan desktop. Jika kosong, sistem akan menggunakan foto galeri pertama.</p>
              <div className="flex flex-col gap-2">
                {desktopCoverImage && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100 border border-[#E2E8F0]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={desktopCoverImage} alt="Cover Desktop" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setDesktopCoverImage("")}
                      className="absolute top-2 right-2 bg-white/90 text-slate-700 rounded-full p-1 hover:bg-red-50 hover:text-red-600 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Upload Foto Cover Desktop (Maks. 1MB):</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const compressed = await compressImageStandard(file, 1);
                        const form = new FormData();
                        form.append("file", compressed, file.name);
                        const res = await fetch("/api/upload/image", { method: "POST", body: form });
                        if (res.ok) {
                          const data = await res.json();
                          setDesktopCoverImage(data.url);
                        }
                      }}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-orange-50 file:text-[#F97316] file:font-semibold hover:file:bg-orange-100 file:cursor-pointer"
                    />
                  </div>
                  {galleries.length > 0 && (
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">Atau pilih dari galeri foto yang sudah ada:</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {galleries.slice(0, 8).map((g, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setDesktopCoverImage(g.imageUrl)}
                            className={`relative aspect-square rounded-none overflow-hidden border-2 transition-all ${
                              desktopCoverImage === g.imageUrl
                                ? "border-[#F97316] scale-95"
                                : "border-transparent hover:border-slate-300"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={g.imageUrl} alt="" className="w-full h-full object-cover" />
                            {desktopCoverImage === g.imageUrl && (
                              <div className="absolute inset-0 bg-[#F97316]/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-[#F97316]" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Atau tempel URL gambar cover desktop:</label>
                    <input
                      type="url"
                      value={desktopCoverImage}
                      onChange={(e) => setDesktopCoverImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-700 text-xs focus:border-[#F97316] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 2: Jadwal & Lokasi */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(1)}
          className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm sm:text-base text-slate-900 hover:bg-slate-50 min-h-[52px] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50 text-[#F97316]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="block">{sections[1].title}</span>
              <span className="text-[11px] text-slate-400 font-normal">Akad nikah, resepsi, gedung &amp; Google Maps</span>
            </div>
          </div>
          {openSection === 1 ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {openSection === 1 && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#E2E8F0] space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between pt-4">
              <p className="text-slate-500 text-xs">
                Tambahkan satu atau lebih sesi acara pernikahan Anda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSchedules([
                    ...schedules,
                    {
                      eventName: "Resepsi Pernikahan",
                      date: new Date().toISOString().split("T")[0],
                      startTime: "11:00",
                      endTime: "14:00",
                      venueName: "",
                      address: "",
                      mapsUrl: "",
                    },
                  ]);
                }}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-orange-50 text-[#F97316] hover:bg-blue-100 font-semibold text-xs border border-orange-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Sesi</span>
              </button>
            </div>

            {schedules.map((sch, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 relative"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                  <span className="font-semibold text-slate-900 text-xs">
                    Sesi #{idx + 1}
                  </span>
                  {schedules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSchedules(schedules.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">Nama Sesi Acara:</label>
                    <input
                      type="text"
                      value={sch.eventName}
                      onChange={(e) => {
                        const updated = [...schedules];
                        updated[idx].eventName = e.target.value;
                        setSchedules(updated);
                      }}
                      placeholder="Akad Nikah / Resepsi"
                      className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Tanggal Acara:</label>
                    <input
                      type="date"
                      value={typeof sch.date === "string" ? sch.date.split("T")[0] : ""}
                      onChange={(e) => {
                        const updated = [...schedules];
                        updated[idx].date = e.target.value;
                        setSchedules(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Jam Mulai:</label>
                    <input
                      type="text"
                      value={sch.startTime}
                      onChange={(e) => {
                        const updated = [...schedules];
                        updated[idx].startTime = e.target.value;
                        setSchedules(updated);
                      }}
                      placeholder="08:00 WIB"
                      className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Jam Selesai:</label>
                    <input
                      type="text"
                      value={sch.endTime}
                      onChange={(e) => {
                        const updated = [...schedules];
                        updated[idx].endTime = e.target.value;
                        setSchedules(updated);
                      }}
                      placeholder="10:00 WIB / Selesai"
                      className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Nama Tempat / Gedung:</label>
                    <input
                      type="text"
                      value={sch.venueName}
                      onChange={(e) => {
                        const updated = [...schedules];
                        updated[idx].venueName = e.target.value;
                        setSchedules(updated);
                      }}
                      placeholder="Masjid Agung / Grand Ballroom"
                      className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Link Google Maps:</label>
                    <input
                      type="text"
                      value={sch.mapsUrl}
                      onChange={(e) => {
                        const updated = [...schedules];
                        updated[idx].mapsUrl = e.target.value;
                        setSchedules(updated);
                      }}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1">Alamat Lengkap Venue:</label>
                  <textarea
                    rows={2}
                    value={sch.address}
                    onChange={(e) => {
                      const updated = [...schedules];
                      updated[idx].address = e.target.value;
                      setSchedules(updated);
                    }}
                    placeholder="Jl. Diponegoro No. 12, Surabaya, Jawa Timur"
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 text-xs focus:border-[#F97316] outline-none"
                  />
                </div>
              </div>
            ))}

            {tier === "FREE" && (
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-xs flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#F97316] shrink-0" />
                <div className="leading-relaxed">
                  <span className="font-semibold text-[#F97316]">Masa Aktif Paket Gratis:</span> Tautan website undangan Anda otomatis aktif sampai <strong>H+7</strong> setelah tanggal acara pernikahan.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accordion 3: Musik Latar Undangan (.mp3) */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(2)}
          className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm sm:text-base text-slate-900 hover:bg-slate-50 min-h-[52px] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50 text-[#F97316]">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <span className="block">{sections[2].title}</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Background audio, upload file musik &amp; preset romantis
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {musicUrl && (
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Terpasang
              </span>
            )}
            {openSection === 2 ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </button>

        {openSection === 2 && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#E2E8F0] space-y-4 text-xs animate-in fade-in">
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-slate-50/70 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Music className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>Background Music (.mp3)</span>
                </label>
                {musicUrl && (
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    Lagu Terpasang
                  </span>
                )}
              </div>

              {/* Input URL + Play Preview Button */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={musicUrl}
                    onChange={(e) => {
                      setMusicUrl(e.target.value);
                      setUploadMusicError(null);
                      setUploadMusicSuccess(null);
                      if (isPreviewPlaying && audioPreviewRef.current) {
                        audioPreviewRef.current.pause();
                        setIsPreviewPlaying(false);
                      }
                    }}
                    placeholder="https://.../lagu-romantis.mp3"
                    className="flex-1 px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 text-xs min-h-[38px] focus:border-[#F97316] outline-none"
                  />
                  <button
                    type="button"
                    onClick={toggleAudioPreview}
                    disabled={!musicUrl}
                    title={isPreviewPlaying ? "Pause Preview" : "Dengarkan Lagu"}
                    className={`h-[38px] px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
                      !musicUrl
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        : isPreviewPlaying
                        ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                        : "bg-white text-slate-700 border-[#E2E8F0] hover:bg-orange-50 hover:text-[#F97316] hover:border-orange-200 cursor-pointer"
                    }`}
                  >
                    {isPreviewPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Test Lagu</span>
                      </>
                    )}
                  </button>
                </div>
                <audio
                  ref={audioPreviewRef}
                  onEnded={() => setIsPreviewPlaying(false)}
                  className="hidden"
                />
                <p className="text-[10px] text-slate-500">
                  Musik berputar otomatis saat tamu menekan tombol &quot;Buka Undangan&quot;.
                </p>
              </div>

              {/* YouTube Link Warning if pasted into music field */}
              {isYouTubeUrl(musicUrl) && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">
                      Perhatian: Link YouTube Tidak Bisa Diputar Langsung Sebagai Musik Latar
                    </p>
                    <p className="text-[10px] text-amber-800 leading-relaxed">
                      Kebijakan keamanan browser melarang pemutaran audio latar dari YouTube secara otomatis. Silakan <strong>Upload File (.mp3)</strong> di bawah atau masukkan tautan YouTube pada bagian <em>&quot;Video Teaser Prewedding&quot;</em>.
                    </p>
                  </div>
                </div>
              )}

              {/* Action: Upload MP3 File */}
              <div className="pt-1">
                <label
                  className={`relative flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg border border-dashed text-xs font-semibold cursor-pointer transition-colors ${
                    isUploadingMusic
                      ? "bg-slate-100 text-slate-400 border-slate-300 cursor-wait"
                      : "bg-white hover:bg-orange-50/50 text-[#F97316] border-orange-300 hover:border-[#F97316]"
                  }`}
                >
                  <input
                    type="file"
                    accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac"
                    onChange={handleMusicUpload}
                    disabled={isUploadingMusic}
                    className="sr-only"
                  />
                  {isUploadingMusic ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F97316]" />
                      <span>Mengunggah file musik...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-[#F97316]" />
                      <span>Upload File Musik Sendiri (.mp3 / .m4a)</span>
                    </>
                  )}
                </label>
                <p className="text-[9.5px] text-slate-400 text-center mt-1">
                  Maks. 15MB • Format: MP3, M4A, WAV, OGG (disimpan aman di Cloud)
                </p>
              </div>

              {/* Upload Status Alerts */}
              {uploadMusicSuccess && (
                <div className="p-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{uploadMusicSuccess}</span>
                </div>
              )}
              {uploadMusicError && (
                <div className="p-2 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[10.5px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{uploadMusicError}</span>
                </div>
              )}

              {/* Preset Songs Picker (Scrollable 10 tracks with individual Play/Pause) */}
              <div className="pt-3 border-t border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>Pilihan Lagu Siap Pakai (10 Lagu Bebas Hak Cipta)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Scroll untuk melihat semua
                  </span>
                </div>

                <audio
                  ref={presetAudioRef}
                  onEnded={() => setPlayingPresetUrl(null)}
                  onError={() => setPlayingPresetUrl(null)}
                  className="hidden"
                />

                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1.5 rounded-xl border border-slate-200 bg-slate-50/50 p-2">
                  {MUSIC_PRESETS.map((preset, idx) => {
                    const isCurrentSelected = musicUrl === preset.url;
                    const isThisPlaying = playingPresetUrl === preset.url;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                          isCurrentSelected
                            ? "bg-orange-50/90 border-[#F97316] shadow-xs"
                            : "bg-white border-[#E2E8F0] hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePlayPreset(preset.url)}
                            title={isThisPlaying ? "Jeda Lagu" : "Putar Lagu"}
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              isThisPlaying
                                ? "bg-[#F97316] text-white shadow-xs"
                                : "bg-slate-100 text-slate-700 hover:bg-orange-100 hover:text-[#F97316]"
                            }`}
                          >
                            {isThisPlaying ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3 fill-current ml-0.5" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-800 truncate">
                                {preset.title}
                              </span>
                              {isThisPlaying && (
                                <span className="text-[9.5px] text-[#F97316] font-medium animate-pulse shrink-0">
                                  Memutar...
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {preset.category}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyPreset(preset.url)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold shrink-0 transition-colors flex items-center gap-1 cursor-pointer ${
                            isCurrentSelected
                              ? "bg-[#F97316] text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {isCurrentSelected ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Terpilih</span>
                            </>
                          ) : (
                            <span>Gunakan</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 4: Video Teaser Prewedding (YouTube) */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(3)}
          className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm sm:text-base text-slate-900 hover:bg-slate-50 min-h-[52px] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <span className="block">{sections[3].title}</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Sematkan video sinematik YouTube di halaman undangan
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {youtubeVideoUrl && (
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Tersedia
              </span>
            )}
            {openSection === 3 ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </button>

        {openSection === 3 && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#E2E8F0] space-y-4 text-xs animate-in fade-in">
            <div className="pt-4 space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-rose-500" />
                  <span>Link Video Teaser (YouTube):</span>
                </label>
                <input
                  type="text"
                  value={youtubeVideoUrl}
                  onChange={(e) => setYoutubeVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                />
                <p className="text-[10px] text-slate-400">
                  Salin tautan video prewedding dari YouTube (mendukung format youtube.com atau youtu.be).
                </p>
              </div>

              {/* Desktop Cover Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="useVideoAsDesktopCover"
                      className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Monitor className="w-4 h-4 text-[#F97316]" />
                      <span>Jadikan Video Teaser sebagai Cover Layar Desktop</span>
                    </label>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed">
                      Jika diaktifkan, video YouTube akan diputar otomatis (loop &amp; tanpa suara) sebagai latar animasi di sisi kiri layar desktop/laptop menggantikan foto cover statis.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      id="useVideoAsDesktopCover"
                      type="checkbox"
                      checked={Boolean(useVideoAsDesktopCover)}
                      onChange={(e) => setUseVideoAsDesktopCover?.(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F97316]"></div>
                  </label>
                </div>

                {useVideoAsDesktopCover && !youtubeVideoUrl && (
                  <p className="text-[10.5px] text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    ⚠️ Masukkan tautan video YouTube di atas terlebih dahulu agar video dapat diputar sebagai cover layar desktop.
                  </p>
                )}
              </div>

              {/* YouTube Video Live Preview if URL is valid */}
              {(() => {
                const videoId = getYouTubeVideoId(youtubeVideoUrl);
                if (!videoId) return null;
                return (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-[11px] flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-rose-500" />
                        Pratinjau Video YouTube
                      </span>
                      <a
                        href={youtubeVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10.5px] text-[#F97316] hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>Buka di YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-sm bg-black border border-slate-200">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                        title="Pratinjau Video Prewedding"
                        className="absolute inset-0 w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Accordion 5: Galeri Foto Prewedding */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(4)}
          className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm sm:text-base text-slate-900 hover:bg-slate-50 min-h-[52px] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="block">{sections[4].title}</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Foto prewedding &amp; dokumentasi momen indah
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {galleries.length} Foto
            </span>
            {openSection === 4 ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </button>

        {openSection === 4 && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#E2E8F0] space-y-4 text-xs animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-800 text-xs">
                  Daftar Foto Prewedding ({galleries.length} Foto)
                </h4>
                {(tier === "STARTER" || tier === "FREE") && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                    Paket Starter: Maks. 10 Foto ({galleries.length}/10)
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={(tier === "STARTER" || tier === "FREE") && galleries.length >= 10}
                onClick={() => {
                  if ((tier === "STARTER" || tier === "FREE") && galleries.length >= 10) return;
                  setGalleries([
                    ...galleries,
                    {
                      imageUrl: "",
                      caption: `Momen Manis #${galleries.length + 1}`,
                      sortOrder: galleries.length,
                    },
                  ]);
                }}
                className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold text-xs border transition-colors ${
                  (tier === "STARTER" || tier === "FREE") && galleries.length >= 10
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-orange-50 text-[#F97316] hover:bg-orange-100 border-orange-100 cursor-pointer"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Foto</span>
              </button>
            </div>

            {(tier === "STARTER" || tier === "FREE") && galleries.length >= 10 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Batas maksimal <strong>10 foto</strong> untuk Paket Starter telah tercapai. Upgrade paket untuk upload foto galeri tanpa batas.
                  </span>
                </div>
                {onUpgradeClick && (
                  <button
                    type="button"
                    onClick={onUpgradeClick}
                    className="px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs shrink-0 transition-colors shadow-2xs cursor-pointer"
                  >
                    Upgrade Paket
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {galleries.map((gal, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#E2E8F0]">
                    <span className="text-[11px] font-semibold text-slate-800">Foto #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setGalleries(galleries.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>

                  {/* Thumbnail / Image Preview */}
                  <div className="relative aspect-video w-full rounded-none overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                    {gal.imageUrl ? (
                      <img
                        src={gal.imageUrl}
                        alt={gal.caption || `Foto #${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-1 p-2 text-center">
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                        <span className="text-[10px]">Belum ada foto</span>
                      </div>
                    )}
                  </div>

                  {/* Action: Direct Upload or Link */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                          isUploadingGalleryIndex === idx
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-wait"
                            : "bg-white hover:bg-orange-50 text-[#F97316] border-orange-200 hover:border-[#F97316]"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleGalleryPhotoUpload(idx, e)}
                          disabled={isUploadingGalleryIndex === idx}
                          className="sr-only"
                        />
                        {isUploadingGalleryIndex === idx ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F97316]" />
                            <span>Mengunggah...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Foto</span>
                          </>
                        )}
                      </label>

                      {gal.imageUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...galleries];
                            updated[idx].imageUrl = "";
                            setGalleries(updated);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 text-[10.5px] font-medium transition-colors cursor-pointer"
                          title="Kosongkan foto"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={gal.imageUrl}
                        onChange={(e) => {
                          const updated = [...galleries];
                          updated[idx].imageUrl = e.target.value;
                          setGalleries(updated);
                        }}
                        placeholder="Atau link foto (https://...)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 text-xs focus:border-[#F97316] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-0.5 text-[10.5px]">Keterangan Foto (Opsional):</label>
                    <input
                      type="text"
                      value={gal.caption}
                      onChange={(e) => {
                        const updated = [...galleries];
                        updated[idx].caption = e.target.value;
                        setGalleries(updated);
                      }}
                      placeholder="Keterangan foto..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 text-xs focus:border-[#F97316] outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Accordion 6: Amplop Digital & QRIS */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(5)}
          className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm sm:text-base text-slate-900 hover:bg-slate-50 min-h-[52px] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="block">{sections[5].title}</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Rekening bank, e-wallet &amp; upload foto scan QRIS donasi
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {bankAccounts.length} Rekening
            </span>
            {openSection === 5 ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </button>

        {openSection === 5 && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#E2E8F0] space-y-4 text-xs animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4">
              <div>
                <p className="text-slate-500 text-xs">
                  Tamu dapat mengirimkan hadiah tanda kasih langsung via transfer rekening bank atau scan foto QRIS.
                </p>
                {(tier === "STARTER" || tier === "FREE") && (
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                    Paket Starter: Maks. 2 Rekening ({bankAccounts.length}/2)
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={(tier === "STARTER" || tier === "FREE") && bankAccounts.length >= 2}
                onClick={() => {
                  if ((tier === "STARTER" || tier === "FREE") && bankAccounts.length >= 2) return;
                  setBankAccounts([
                    ...bankAccounts,
                    {
                      bankName: "BCA",
                      accountNumber: "",
                      accountHolder: "",
                    },
                  ]);
                }}
                className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold text-xs border transition-colors ${
                  (tier === "STARTER" || tier === "FREE") && bankAccounts.length >= 2
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-orange-50 text-[#F97316] hover:bg-orange-100 border-orange-100 cursor-pointer"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Rekening</span>
              </button>
            </div>

            {(tier === "STARTER" || tier === "FREE") && bankAccounts.length >= 2 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Batas maksimal <strong>2 rekening bank</strong> untuk Paket Starter telah tercapai. Upgrade paket untuk menambah rekening &amp; scan QRIS tanpa batas.
                  </span>
                </div>
                {onUpgradeClick && (
                  <button
                    type="button"
                    onClick={onUpgradeClick}
                    className="px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs shrink-0 transition-colors shadow-2xs cursor-pointer"
                  >
                    Upgrade Paket
                  </button>
                )}
              </div>
            )}

            {bankAccounts.map((b, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 relative"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                  <span className="font-semibold text-slate-900 text-xs">
                    Rekening #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setBankAccounts(bankAccounts.filter((_, i) => i !== idx));
                      setCustomBankIndices((prev) => {
                        const next = new Set<number>();
                        prev.forEach((i) => {
                          if (i < idx) next.add(i);
                          else if (i > idx) next.add(i - 1);
                        });
                        return next;
                      });
                    }}
                    className="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    {customBankIndices.has(idx) || (b.bankName && !PRESET_BANKS.includes(b.bankName)) ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-600 block text-xs">Nama Bank / Dompet:</label>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...bankAccounts];
                              updated[idx].bankName = "BCA";
                              setBankAccounts(updated);
                              setCustomBankIndices((prev) => {
                                const next = new Set(prev);
                                next.delete(idx);
                                return next;
                              });
                            }}
                            className="text-[11px] text-[#F97316] hover:underline font-medium cursor-pointer"
                          >
                            Pilih dari daftar
                          </button>
                        </div>
                        <input
                          type="text"
                          value={b.bankName}
                          onChange={(e) => {
                            const updated = [...bankAccounts];
                            updated[idx].bankName = e.target.value;
                            setBankAccounts(updated);
                          }}
                          placeholder="Contoh: CIMB Niaga, Permata, Jenius..."
                          className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none text-xs"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-slate-600 block mb-1">Pilihan Bank / Dompet:</label>
                        <select
                          value={b.bankName}
                          onChange={(e) => {
                            if (e.target.value === "__CUSTOM__") {
                              setCustomBankIndices((prev) => new Set(prev).add(idx));
                              const updated = [...bankAccounts];
                              updated[idx].bankName = "";
                              setBankAccounts(updated);
                            } else {
                              const updated = [...bankAccounts];
                              updated[idx].bankName = e.target.value;
                              setBankAccounts(updated);
                            }
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none text-xs"
                        >
                          <option value="BCA">BCA</option>
                          <option value="Mandiri">Bank Mandiri</option>
                          <option value="BNI">BNI</option>
                          <option value="BRI">BRI</option>
                          <option value="BSI">BSI (Syariah)</option>
                          <option value="Bank Jago">Bank Jago</option>
                          <option value="SeaBank">SeaBank</option>
                          <option value="Dana">Dana</option>
                          <option value="GoPay">GoPay</option>
                          <option value="OVO">OVO</option>
                          <option value="__CUSTOM__">✍️ Ketik Sendiri (Bank / E-Wallet Lainnya)...</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Nomor Rekening / No HP:</label>
                    <input
                      type="text"
                      value={b.accountNumber}
                      onChange={(e) => {
                        const updated = [...bankAccounts];
                        updated[idx].accountNumber = e.target.value;
                        setBankAccounts(updated);
                      }}
                      placeholder="8291039481"
                      className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Atas Nama Penerima:</label>
                    <input
                      type="text"
                      value={b.accountHolder}
                      onChange={(e) => {
                        const updated = [...bankAccounts];
                        updated[idx].accountHolder = e.target.value;
                        setBankAccounts(updated);
                      }}
                      placeholder="Rian Pratama"
                      className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                    />
                  </div>
                </div>

                {/* QRIS Upload & Preview Section */}
                <div className="pt-2.5 border-t border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-semibold block text-xs flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Foto QRIS Donasi:</span>
                    </label>
                    {isStarterTier ? (
                      <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Khusus Paket Elegant &amp; Ultimate
                      </span>
                    ) : b.qrisImageUrl ? (
                      <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        QRIS Aktif
                      </span>
                    ) : null}
                  </div>

                  {isStarterTier ? (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-start sm:items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                        <span className="leading-relaxed text-[11px]">
                          Fitur upload foto QRIS hanya tersedia pada <strong>Paket Elegant &amp; Ultimate</strong>. Paket Starter menggunakan nomor rekening transfer bank.
                        </span>
                      </div>
                      {onUpgradeClick && (
                        <button
                          type="button"
                          onClick={onUpgradeClick}
                          className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-[11px] shrink-0 transition-colors shadow-2xs cursor-pointer"
                        >
                          Upgrade Paket
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* QR Thumbnail if exists */}
                      <div className="w-14 h-14 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                        {b.qrisImageUrl ? (
                          <img
                            src={b.qrisImageUrl}
                            alt="QRIS"
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <QrCode className="w-6 h-6 text-slate-300" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <label
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                              isUploadingQrisIndex === idx
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-wait"
                                : "bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-400"
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleQrisUpload(idx, e)}
                              disabled={isUploadingQrisIndex === idx}
                              className="sr-only"
                            />
                            {isUploadingQrisIndex === idx ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                <span>Mengunggah QRIS...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload Foto QRIS</span>
                              </>
                            )}
                          </label>

                          {b.qrisImageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...bankAccounts];
                                updated[idx].qrisImageUrl = undefined;
                                setBankAccounts(updated);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus QRIS</span>
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={b.qrisImageUrl || ""}
                          onChange={(e) => {
                            const updated = [...bankAccounts];
                            updated[idx].qrisImageUrl = e.target.value;
                            setBankAccounts(updated);
                          }}
                          placeholder="Atau tempel URL gambar QRIS (https://...)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-700 text-xs focus:border-[#F97316] outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accordion 7: Kisah Cinta (Love Story) */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(6)}
          className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm sm:text-base text-slate-900 hover:bg-slate-50 min-h-[52px] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="block">{sections[6].title}</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Timeline perjalanan cinta dari pertama kenal hingga lamaran
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {stories.length} Momen
            </span>
            {openSection === 6 ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </button>

        {openSection === 6 && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#E2E8F0] space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between pt-4">
              <p className="text-slate-500 text-xs">
                Ceritakan momen berkesan perjalanan cinta Anda berdua.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStories([
                    ...stories,
                    {
                      date: "2024",
                      title: "Pertama Bertemu",
                      story: "Pertama kali kami dipertemukan di sebuah kedai kopi di Bandung...",
                    },
                  ]);
                }}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-orange-50 text-[#F97316] hover:bg-orange-100 font-semibold text-xs border border-orange-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Momen</span>
              </button>
            </div>

            {stories.map((st, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 relative"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                  <span className="font-semibold text-slate-900 text-xs">Momen #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => setStories(stories.filter((_, i) => i !== idx))}
                    className="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">Tahun / Tanggal Momen:</label>
                    <input
                      type="text"
                      value={st.date}
                      onChange={(e) => {
                        const updated = [...stories];
                        updated[idx].date = e.target.value;
                        setStories(updated);
                      }}
                      placeholder="Maret 2024"
                      className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Judul Cerita:</label>
                    <input
                      type="text"
                      value={st.title}
                      onChange={(e) => {
                        const updated = [...stories];
                        updated[idx].title = e.target.value;
                        setStories(updated);
                      }}
                      placeholder="Hari Lamaran Bahagia"
                      className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 min-h-[42px] focus:border-[#F97316] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1">Isi Cerita Singkat:</label>
                  <textarea
                    rows={3}
                    value={st.story}
                    onChange={(e) => {
                      const updated = [...stories];
                      updated[idx].story = e.target.value;
                      setStories(updated);
                    }}
                    placeholder="Tuliskan kisah indah di balik momen ini..."
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 text-xs focus:border-[#F97316] outline-none"
                  />
                </div>

                {/* Foto Momen Kisah Cinta (Khusus Paket Elegant & Ultimate) */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-600 font-medium block text-xs">
                      Foto Momen (Opsional):
                    </label>
                    <span className="text-[10.5px] text-slate-400">
                      Format JPG, PNG, WebP (Maks. 1MB terkompresi)
                    </span>
                  </div>

                  {isStarterTier ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-800">
                      <div className="flex items-start sm:items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                        <span className="leading-relaxed text-[11px]">
                          Fitur upload foto Kisah Cinta hanya tersedia pada <strong>Paket Elegant &amp; Ultimate</strong>. Paket Starter menyajikan cerita dalam format teks.
                        </span>
                      </div>
                      {onUpgradeClick && (
                        <button
                          type="button"
                          onClick={onUpgradeClick}
                          className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-[11px] shrink-0 transition-colors shadow-2xs cursor-pointer"
                        >
                          Upgrade Paket
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Photo Thumbnail if exists */}
                      <div className="w-14 h-14 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                        {st.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={st.imageUrl}
                            alt={st.title || "Foto Momen"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <label
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                              isUploadingStoryIndex === idx
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-wait"
                                : "bg-white hover:bg-orange-50 text-[#F97316] border-orange-200 hover:border-orange-400"
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleStoryPhotoUpload(idx, e)}
                              disabled={isUploadingStoryIndex === idx}
                              className="sr-only"
                            />
                            {isUploadingStoryIndex === idx ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F97316]" />
                                <span>Mengunggah Foto...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload Foto Momen</span>
                              </>
                            )}
                          </label>

                          {st.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...stories];
                                updated[idx].imageUrl = undefined;
                                setStories(updated);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Foto</span>
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={st.imageUrl || ""}
                          onChange={(e) => {
                            const updated = [...stories];
                            updated[idx].imageUrl = e.target.value;
                            setStories(updated);
                          }}
                          placeholder="Atau tempel URL gambar (https://...)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-700 text-xs focus:border-[#F97316] outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentEditorTab;

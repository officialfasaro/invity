import prisma from "../config/prisma";

export type SettingCategory = "cms" | "feature" | "maintenance" | "gateway";

export interface SystemSettingDefinition {
  key: string;
  defaultValue: string;
  category: SettingCategory;
  label: string;
  description: string;
  isPublic: boolean;
}

export const SYSTEM_SETTING_DEFINITIONS: SystemSettingDefinition[] = [
  // 0. Identitas Brand & Icon Aplikasi (Branding)
  {
    key: "site_logo_url",
    defaultValue: "",
    category: "cms",
    label: "Logo Brand Website",
    description: "Logo utama website yang tampil di navbar header, mobile topbar, footer, dan login",
    isPublic: true,
  },
  {
    key: "site_favicon_url",
    defaultValue: "/favicon.ico",
    category: "cms",
    label: "Favicon Tab Browser",
    description: "Icon tab browser pengunjung (.ico / .png / .svg)",
    isPublic: true,
  },
  {
    key: "site_app_icon_url",
    defaultValue: "/icons/icon-192x192.png",
    category: "cms",
    label: "Icon Aplikasi (PWA / Shortcut HP & Desktop)",
    description: "Icon saat website di-install ke ponsel / shortcut desktop (PNG rasio 1:1)",
    isPublic: true,
  },

  // 1. Content Management (CMS)
  {
    key: "site_hero_badge",
    defaultValue: "",
    category: "cms",
    label: "Teks Badge Hero",
    description: "Teks badge di atas judul utama halaman beranda (opsional)",
    isPublic: true,
  },
  {
    key: "site_hero_title",
    defaultValue: "Buat Website Undangan Pernikahan Digital Elegan dalam Hitungan Menit",
    category: "cms",
    label: "Judul Utama Hero",
    description: "Judul besar yang menarik perhatian di landing page",
    isPublic: true,
  },
  {
    key: "site_hero_subtitle",
    defaultValue:
      "Platform all-in-one: ganti tema 1-klik tanpa data hilang, amplop digital terintegrasi (QRIS/Bank), buku tamu RSVP realtime, hingga audio player autoplay super cepat.",
    category: "cms",
    label: "Subjudul / Deskripsi Hero",
    description: "Paragraf penjelas singkat di bawah judul utama",
    isPublic: true,
  },
  {
    key: "site_hero_promo",
    defaultValue: "Mulai Rp 39rb Promo Spesial",
    category: "cms",
    label: "Teks Badge Promo",
    description: "Teks keunggulan di bagian faktor kepercayaan hero",
    isPublic: true,
  },
  {
    key: "announcement_enabled",
    defaultValue: "false",
    category: "cms",
    label: "Status Banner Pengumuman",
    description: "Tampilkan bilah pengumuman global di bagian atas website",
    isPublic: true,
  },
  {
    key: "announcement_text",
    defaultValue: "📢 Info Pemeliharaan: Seluruh sistem berjalan optimal dan siap melayani pesanan Anda.",
    category: "cms",
    label: "Isi Teks Pengumuman",
    description: "Pesan yang ditampilkan di bilah pengumuman atas",
    isPublic: true,
  },
  {
    key: "announcement_type",
    defaultValue: "info",
    category: "cms",
    label: "Jenis Pengumuman",
    description: "Pilihan tampilan: info (biru/abu), warning (oranye/amber), promo (hijau)",
    isPublic: true,
  },
  {
    key: "support_whatsapp",
    defaultValue: "085716697416",
    category: "cms",
    label: "Nomor WhatsApp Bantuan",
    description: "Nomor CS resmi Invity by Fasaro (misal 085716697416 atau 6285716697416)",
    isPublic: true,
  },
  {
    key: "support_email",
    defaultValue: "support@fasaro.id",
    category: "cms",
    label: "Email Layanan Pelanggan",
    description: "Alamat email pusat bantuan resmi",
    isPublic: true,
  },
  {
    key: "support_hours",
    defaultValue: "Senin - Minggu (08:00 - 22:00 WIB)",
    category: "cms",
    label: "Jam Operasional Layanan",
    description: "Waktu aktif layanan customer support",
    isPublic: true,
  },
  {
    key: "site_hero_image",
    defaultValue: "",
    category: "cms",
    label: "Gambar Mockup Hero",
    description: "Gambar mockup atau preview undangan di samping/bawah hero utama",
    isPublic: true,
  },
  {
    key: "showcase_weddings_json",
    defaultValue: "[]",
    category: "cms",
    label: "Data Pengantin Live Showcase",
    description: "Daftar pernikahan live showcase dalam format JSON",
    isPublic: true,
  },
  {
    key: "user_testimonials_json",
    defaultValue: "[]",
    category: "cms",
    label: "Data Testimoni Pengantin",
    description: "Daftar ulasan & testimoni dari pasangan pengantin yang menggunakan Invity",
    isPublic: true,
  },
  {
    key: "site_features_badge",
    defaultValue: "Fitur Lengkap & Canggih",
    category: "cms",
    label: "Teks Badge Bagian Fitur",
    description: "Teks badge di atas judul bagian fitur unggulan beranda",
    isPublic: true,
  },
  {
    key: "site_features_title",
    defaultValue: "Semua yang Anda Butuhkan untuk Hari Bahagia",
    category: "cms",
    label: "Judul Bagian Fitur",
    description: "Judul utama bagian fitur unggulan beranda",
    isPublic: true,
  },
  {
    key: "site_features_subtitle",
    defaultValue: "Didesain khusus untuk mempermudah calon pengantin mempersiapkan pesta pernikahan modern.",
    category: "cms",
    label: "Subjudul Bagian Fitur",
    description: "Deskripsi singkat di bawah judul bagian fitur unggulan",
    isPublic: true,
  },
  {
    key: "site_features_cards_json",
    defaultValue: JSON.stringify([
      {
        id: "f1",
        icon: "Images",
        title: "Galeri Foto (Maks. 10 Foto)",
        desc: "Tampilkan momen prewedding terbaik Anda dalam album foto beresolusi tinggi dengan batas maksimal hingga 10 foto.",
      },
      {
        id: "f2",
        icon: "Wallet",
        title: "Amplop Digital & QRIS Terintegrasi",
        desc: "Tamu dapat mentransfer tanda kasih langsung melalui berbagai rekening bank dan QRIS otomatis.",
      },
      {
        id: "f3",
        icon: "Users",
        title: "RSVP Cerdas & Manajemen Kuota",
        desc: "Konfirmasi kehadiran otomatis dengan batasan jumlah tamu per undangan agar jamuan lebih terkontrol.",
      },
      {
        id: "f4",
        icon: "MapPin",
        title: "Navigasi Google Maps & Waze",
        desc: "Bantu tamu menemukan lokasi venue pesta Anda dengan petunjuk arah rute 1-klik langsung ke aplikasi navigasi.",
      },
      {
        id: "f5",
        icon: "QrCode",
        title: "Buku Tamu Digital & QR Check-in",
        desc: "Sistem absensi tamu di meja penerima dengan scan QR Code kilat untuk mencegah antrean panjang.",
      },
      {
        id: "f6",
        icon: "Headphones",
        title: "Background Music Romantis",
        desc: "Alunan musik romantis dengan pemutar melayang (floating player) dan fitur putar otomatis yang dapat disesuaikan.",
      },
    ]),
    category: "cms",
    label: "Daftar Kartu Fitur Unggulan (JSON)",
    description: "Data kartu fitur (ikon, judul, deskripsi) dalam format JSON",
    isPublic: true,
  },

  // 2. Pricing & Quota Limits
  {
    key: "price_starter",
    defaultValue: "39000",
    category: "cms",
    label: "Harga Paket Starter (Rp)",
    description: "Nominal harga paket Starter",
    isPublic: true,
  },
  {
    key: "price_starter_original",
    defaultValue: "89000",
    category: "cms",
    label: "Harga Coret Starter (Rp)",
    description: "Nominal harga asli sebelum diskon untuk Paket Starter",
    isPublic: true,
  },
  {
    key: "max_photos_starter",
    defaultValue: "10",
    category: "cms",
    label: "Maksimal Foto Starter",
    description: "Batas galeri foto untuk paket Starter",
    isPublic: true,
  },
  {
    key: "max_accounts_starter",
    defaultValue: "2",
    category: "cms",
    label: "Maksimal Rekening Starter",
    description: "Batas rekening amplop digital untuk paket Starter",
    isPublic: true,
  },
  {
    key: "price_elegant",
    defaultValue: "149000",
    category: "cms",
    label: "Harga Paket Elegant (Rp)",
    description: "Nominal harga paket Elegant",
    isPublic: true,
  },
  {
    key: "price_elegant_original",
    defaultValue: "249000",
    category: "cms",
    label: "Harga Coret Elegant (Rp)",
    description: "Nominal harga asli sebelum diskon untuk Paket Elegant",
    isPublic: true,
  },
  {
    key: "price_ultimate",
    defaultValue: "279000",
    category: "cms",
    label: "Harga Paket Ultimate (Rp)",
    description: "Nominal harga paket Ultimate",
    isPublic: true,
  },
  {
    key: "price_ultimate_original",
    defaultValue: "499000",
    category: "cms",
    label: "Harga Coret Ultimate (Rp)",
    description: "Nominal harga asli sebelum diskon untuk Paket Ultimate",
    isPublic: true,
  },
  // Pengaturan Single Promo Package (Semua Fitur)
  {
    key: "single_promo_mode",
    defaultValue: "true",
    category: "cms",
    label: "Mode 1 Paket Promo Saja (All-In-One)",
    description: "Jika aktif, landing page dan order page hanya menampilkan 1 paket promo yang membuka semua fitur.",
    isPublic: true,
  },
  {
    key: "promo_plan_name",
    defaultValue: "Paket Promo All-In-One",
    category: "cms",
    label: "Nama Paket Promo",
    description: "Judul paket promo tunggal",
    isPublic: true,
  },
  {
    key: "promo_plan_price",
    defaultValue: "79000",
    category: "cms",
    label: "Harga Paket Promo (Rp)",
    description: "Nominal harga promo yang mendapatkan semua fitur lengkap",
    isPublic: true,
  },
  {
    key: "promo_plan_original_price",
    defaultValue: "249000",
    category: "cms",
    label: "Harga Coret Promo (Rp)",
    description: "Nominal harga asli sebelum diskon promo",
    isPublic: true,
  },
  {
    key: "promo_plan_desc",
    defaultValue: "Satu penawaran spesial untuk seluruh momen bahagia Anda dengan semua fitur terbuka tanpa batasan.",
    category: "cms",
    label: "Deskripsi Paket Promo",
    description: "Penjelasan ringkas paket promo",
    isPublic: true,
  },
  {
    key: "promo_plan_period",
    defaultValue: "Masa Aktif 1 Tahun Penuh",
    category: "cms",
    label: "Masa Aktif Paket Promo",
    description: "Keterangan masa aktif paket promo",
    isPublic: true,
  },
  {
    key: "promo_plan_badge",
    defaultValue: "PROMO SPESIAL LAUNCHING • ALL FEATURES UNLOCKED",
    category: "cms",
    label: "Badge Label Promo",
    description: "Tag label di bagian atas kartu promo",
    isPublic: true,
  },
  {
    key: "promo_plan_features",
    defaultValue: "Akses Semua Tema Desain Premium (Termasuk Botanical Mekar & Versa)\nBebas Ganti Tema Kapan Saja (1-Klik Tanpa Data Hilang)\nGaleri Foto HD Lengkap & Fitur Lightbox Layar Penuh\nAmplop Digital & QRIS Kasih Semua Bank / E-Wallet\nFitur Pengiriman Kado Fisik ke Kediaman Mempelai\nBuku Tamu Digital & Konfirmasi Kehadiran (RSVP) Realtime\nBackground Music Romantis Autoplay & Floating Audio Player\nPetunjuk Rute Lokasi Google Maps Terintegrasi\nQR Code Tiket Masuk Tamu Undangan\nFitur Perjalanan Cinta / Kisah Kasih (Love Story)\nHitung Mundur Acara Pernikahan (Live Countdown)\nKustomisasi Penuh Teks, Tanggal, & Foto Mempelai",
    category: "cms",
    label: "Daftar Fitur Paket Promo",
    description: "Daftar keunggulan paket promo (1 baris per fitur)",
    isPublic: true,
  },

  // 2b. Matriks Fitur Paket & Template
  {
    key: "package_features_promo",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "love_story",
      "gallery",
      "countdown",
      "google_maps",
      "qr_ticket",
    ]),
    category: "cms",
    label: "Fitur Aktif Paket Promo Launching",
    description: "Daftar ID fitur yang dibuka pada paket promo launching (semua fitur)",
    isPublic: true,
  },
  {
    key: "package_features_starter",
    defaultValue: JSON.stringify([
      "wishes",
      "digital_gift",
      "gallery",
      "countdown",
      "google_maps",
    ]),
    category: "cms",
    label: "Fitur Aktif Paket Starter",
    description: "Daftar ID fitur yang aktif pada paket Starter",
    isPublic: true,
  },
  {
    key: "package_features_elegant",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "gallery",
      "countdown",
      "google_maps",
    ]),
    category: "cms",
    label: "Fitur Aktif Paket Elegant",
    description: "Daftar ID fitur yang aktif pada paket Elegant",
    isPublic: true,
  },
  {
    key: "package_features_ultimate",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "love_story",
      "gallery",
      "countdown",
      "google_maps",
      "qr_ticket",
    ]),
    category: "cms",
    label: "Fitur Aktif Paket Ultimate",
    description: "Daftar ID fitur yang aktif pada paket Ultimate",
    isPublic: true,
  },
  {
    key: "template_features_botanical",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "love_story",
      "gallery",
      "countdown",
      "google_maps",
      "qr_ticket",
    ]),
    category: "cms",
    label: "Fitur Aktif Botanical Tema 01",
    description: "Fitur yang tersedia pada tema Botanical",
    isPublic: true,
  },
  {
    key: "template_features_editorial",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "love_story",
      "gallery",
      "countdown",
      "google_maps",
      "qr_ticket",
    ]),
    category: "cms",
    label: "Fitur Aktif Editorial Tema 01",
    description: "Fitur yang tersedia pada tema Editorial",
    isPublic: true,
  },
  {
    key: "template_features_gothic",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "love_story",
      "gallery",
      "countdown",
      "google_maps",
      "qr_ticket",
    ]),
    category: "cms",
    label: "Fitur Aktif Gothic Tema 01",
    description: "Fitur yang tersedia pada tema Gothic",
    isPublic: true,
  },
  {
    key: "template_features_raka-ayu",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "love_story",
      "gallery",
      "countdown",
      "google_maps",
      "qr_ticket",
    ]),
    category: "cms",
    label: "Fitur Aktif Royal Tema 01 (Raka & Ayu)",
    description: "Fitur yang tersedia pada tema Raka Ayu / Royal",
    isPublic: true,
  },
  {
    key: "template_features_wedding-3d",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "love_story",
      "gallery",
      "countdown",
      "google_maps",
      "qr_ticket",
    ]),
    category: "cms",
    label: "Fitur Aktif 3D Tema 01",
    description: "Fitur yang tersedia pada tema 3D",
    isPublic: true,
  },

  // Content Kustomisasi Paket
  {
    key: "plan_starter_name",
    defaultValue: "Paket Starter",
    category: "cms",
    label: "Nama Paket Starter",
    description: "Judul paket Starter",
    isPublic: true,
  },
  {
    key: "plan_starter_desc",
    defaultValue: "Untuk syukuran intim keluarga.",
    category: "cms",
    label: "Deskripsi Paket Starter",
    description: "Subjudul penjelasan paket Starter",
    isPublic: true,
  },
  {
    key: "plan_starter_period",
    defaultValue: "Masa Aktif 3 Bulan",
    category: "cms",
    label: "Masa Aktif Paket Starter",
    description: "Keterangan masa aktif paket Starter",
    isPublic: true,
  },
  {
    key: "plan_starter_badge",
    defaultValue: "Entry Tier",
    category: "cms",
    label: "Badge Label Starter",
    description: "Label tag kecil di atas kartu paket Starter",
    isPublic: true,
  },
  {
    key: "plan_starter_features",
    defaultValue: "1 Pilihan Tema Minimalist\nMasa Aktif 90 Hari\nGaleri hingga 10 Foto\nAmplop (2 Rekening Bank)\nBuku Ucapan & Doa\nNavigasi Google Maps",
    category: "cms",
    label: "Daftar Fitur Paket Starter",
    description: "Daftar poin keunggulan paket Starter (1 baris per fitur)",
    isPublic: true,
  },

  {
    key: "plan_elegant_name",
    defaultValue: "Paket Elegant",
    category: "cms",
    label: "Nama Paket Elegant",
    description: "Judul paket Elegant",
    isPublic: true,
  },
  {
    key: "plan_elegant_desc",
    defaultValue: "Untuk resepsi lengkap & modern.",
    category: "cms",
    label: "Deskripsi Paket Elegant",
    description: "Subjudul penjelasan paket Elegant",
    isPublic: true,
  },
  {
    key: "plan_elegant_period",
    defaultValue: "Masa Aktif 1 Tahun Penuh",
    category: "cms",
    label: "Masa Aktif Paket Elegant",
    description: "Keterangan masa aktif paket Elegant",
    isPublic: true,
  },
  {
    key: "plan_elegant_badge",
    defaultValue: "Paling Populer",
    category: "cms",
    label: "Badge Label Elegant",
    description: "Label tag badge di atas kartu paket Elegant",
    isPublic: true,
  },
  {
    key: "plan_elegant_features",
    defaultValue: "Akses Semua Tema Desain\nGanti Tema 1-Klik Bebas\nMasa Aktif 365 Hari\nGaleri Foto HD Tanpa Batas\nAmplop Bebas + QRIS Donasi\nBuku Tamu & RSVP Realtime\nBackground Musik Autoplay",
    category: "cms",
    label: "Daftar Fitur Paket Elegant",
    description: "Daftar poin keunggulan paket Elegant (1 baris per fitur)",
    isPublic: true,
  },

  {
    key: "plan_ultimate_name",
    defaultValue: "Ultimate Event Day",
    category: "cms",
    label: "Nama Paket Ultimate",
    description: "Judul paket Ultimate",
    isPublic: true,
  },
  {
    key: "plan_ultimate_desc",
    defaultValue: "Solusi hari-H check-in tamu VIP.",
    category: "cms",
    label: "Deskripsi Paket Ultimate",
    description: "Subjudul penjelasan paket Ultimate",
    isPublic: true,
  },
  {
    key: "plan_ultimate_period",
    defaultValue: "Masa Aktif Selamanya",
    category: "cms",
    label: "Masa Aktif Paket Ultimate",
    description: "Keterangan masa aktif paket Ultimate",
    isPublic: true,
  },
  {
    key: "plan_ultimate_badge",
    defaultValue: "VIP Hari-H",
    category: "cms",
    label: "Badge Label Ultimate",
    description: "Label tag badge di atas kartu paket Ultimate",
    isPublic: true,
  },
  {
    key: "plan_ultimate_features",
    defaultValue: "Seluruh Fitur Paket Elegant\nMasa Aktif Selamanya (Lifetime)\nQR Code Check-in Meja Tamu\nWhatsApp Blast Generator\nLove Story Timeline Kustom\nPrioritas Verifikasi Kilat 10 Menit\nDukungan WhatsApp Prioritas",
    category: "cms",
    label: "Daftar Fitur Paket Ultimate",
    description: "Daftar poin keunggulan paket Ultimate (1 baris per fitur)",
    isPublic: true,
  },

  // 3. Maintenance Mode & Website Flags
  {
    key: "maintenance_mode",
    defaultValue: "false",
    category: "maintenance",
    label: "Mode Pemeliharaan Website",
    description: "Jika aktif, pengunjung akan melihat halaman pemeliharaan",
    isPublic: true,
  },
  {
    key: "maintenance_title",
    defaultValue: "Website Sedang Dalam Pemeliharaan Terjadwal",
    category: "maintenance",
    label: "Judul Halaman Pemeliharaan",
    description: "Judul utama saat mode pemeliharaan aktif",
    isPublic: true,
  },
  {
    key: "maintenance_message",
    defaultValue:
      "Kami sedang melakukan pembaruan infrastruktur server untuk meningkatkan performa dan stabilitas layanan. Seluruh data Anda aman dan website akan segera kembali normal.",
    category: "maintenance",
    label: "Pesan Detail Pemeliharaan",
    description: "Pesan yang dibaca pengunjung saat maintenance",
    isPublic: true,
  },
  {
    key: "maintenance_estimated_end",
    defaultValue: "Segera kembali dalam beberapa saat",
    category: "maintenance",
    label: "Estimasi Selesai",
    description: "Perkiraan waktu pemeliharaan berakhir",
    isPublic: true,
  },

  // 4. Feature Flags (Saklar Fitur)
  {
    key: "feature_registration",
    defaultValue: "true",
    category: "feature",
    label: "Pendaftaran Akun Baru",
    description: "Izinkan pengguna baru mendaftar akun di Invity",
    isPublic: true,
  },
  {
    key: "feature_midtrans_payment",
    defaultValue: "true",
    category: "feature",
    label: "Payment Gateway Midtrans",
    description: "Aktifkan checkout pembayaran otomatis melalui Midtrans",
    isPublic: true,
  },
  {
    key: "feature_manual_payment",
    defaultValue: "true",
    category: "feature",
    label: "Transfer Manual Bank & QRIS",
    description: "Aktifkan opsi transfer manual dan upload bukti bayar",
    isPublic: true,
  },
  {
    key: "feature_digital_gift",
    defaultValue: "true",
    category: "feature",
    label: "Fitur Amplop Digital Kado",
    description: "Tampilkan kotak amplop hadiah di seluruh undangan",
    isPublic: true,
  },
  {
    key: "feature_rsvp",
    defaultValue: "true",
    category: "feature",
    label: "Fitur Konfirmasi RSVP",
    description: "Tampilkan form kehadiran tamu di seluruh undangan",
    isPublic: true,
  },
  {
    key: "feature_wishes",
    defaultValue: "true",
    category: "feature",
    label: "Fitur Buku Tamu & Doa Ucapan",
    description: "Tampilkan buku tamu interaktif di seluruh undangan",
    isPublic: true,
  },
  {
    key: "feature_music",
    defaultValue: "true",
    category: "feature",
    label: "Fitur Musik Latar (Autoplay)",
    description: "Aktifkan tombol audio musik di seluruh undangan",
    isPublic: true,
  },
  {
    key: "feature_pwa_banner",
    defaultValue: "true",
    category: "feature",
    label: "Banner Unduh Aplikasi PWA",
    description: "Tampilkan prompt instalasi PWA di perangkat mobile",
    isPublic: true,
  },
  // Setting Fitur Per Paket Langganan
  {
    key: "package_features_promo",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Paket Promo (All-In-One)",
    description: "Daftar fitur aktif untuk Paket Promo Launching (JSON array)",
    isPublic: true,
  },
  {
    key: "package_features_ultimate",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Paket Ultimate",
    description: "Daftar fitur aktif untuk Paket Ultimate (JSON array)",
    isPublic: true,
  },
  {
    key: "package_features_elegant",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Paket Elegant",
    description: "Daftar fitur aktif untuk Paket Elegant (JSON array)",
    isPublic: true,
  },
  {
    key: "package_features_starter",
    defaultValue: '["gallery","countdown","google_maps","wishes","digital_gift"]',
    category: "feature",
    label: "Fitur Paket Starter",
    description: "Daftar fitur aktif untuk Paket Starter (JSON array)",
    isPublic: true,
  },
  // Setting Fitur Per Template Desain
  {
    key: "template_features_botanical",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Tersedia Botanical Tema 01",
    description: "Fitur yang diaktifkan untuk template Botanical Tema 01",
    isPublic: true,
  },
  {
    key: "template_features_editorial",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Tersedia Editorial Tema 01",
    description: "Fitur yang diaktifkan untuk template Editorial Tema 01",
    isPublic: true,
  },
  {
    key: "template_features_gothic",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Tersedia Gothic Tema 01",
    description: "Fitur yang diaktifkan untuk template Gothic Tema 01",
    isPublic: true,
  },
  {
    key: "template_features_raka-ayu",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Tersedia Royal Tema 01",
    description: "Fitur yang diaktifkan untuk template Royal Tema 01",
    isPublic: true,
  },
  {
    key: "template_features_wedding-3d",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Tersedia 3D Tema 01",
    description: "Fitur yang diaktifkan untuk template 3D Tema 01",
    isPublic: true,
  },

  // 5. Gateway & Technical Configuration
  {
    key: "payment_active_mode",
    defaultValue: "MANUAL_ONLY",
    category: "gateway",
    label: "Mode Pembayaran Aktif",
    description: "Pilihan mode pembayaran saat ini: MANUAL_ONLY (Hanya Transfer Manual), BOTH (Keduanya), GATEWAY_ONLY (Hanya Midtrans)",
    isPublic: true,
  },
  {
    key: "midtrans_server_key",
    defaultValue: "SB-Mid-server-YOUR_SANDBOX_SERVER_KEY",
    category: "gateway",
    label: "Midtrans Server Key",
    description: "Kunci server otentikasi API Midtrans Sandbox/Production",
    isPublic: false,
  },
  {
    key: "manual_bank_name",
    defaultValue: "BCA",
    category: "gateway",
    label: "Nama Bank Transfer Manual",
    description: "Nama bank untuk transfer manual (misal BCA, Bank Mandiri, BRI, BNI)",
    isPublic: true,
  },
  {
    key: "manual_account_number",
    defaultValue: "8291039481",
    category: "gateway",
    label: "Nomor Rekening Bank",
    description: "Nomor rekening tujuan transfer pembayaran",
    isPublic: true,
  },
  {
    key: "manual_account_holder",
    defaultValue: "PT Fasaro Digital",
    category: "gateway",
    label: "Atas Nama Pemilik Rekening",
    description: "Nama pemilik rekening bank resmi Fasaro",
    isPublic: true,
  },
  {
    key: "manual_whatsapp_confirmation",
    defaultValue: "085716697416",
    category: "gateway",
    label: "Nomor WhatsApp Konfirmasi Manual",
    description: "Nomor WhatsApp CS/Admin untuk menerima konfirmasi bukti transfer",
    isPublic: true,
  },
  {
    key: "manual_payment_instructions",
    defaultValue: "Transfer sesuai nominal paket ke rekening di atas. Setelah transfer, upload bukti transfer di form ini atau kirimkan konfirmasi via WhatsApp agar paket Anda segera diaktifkan.",
    category: "gateway",
    label: "Instruksi Transfer Manual",
    description: "Catatan panduan langkah pembayaran transfer manual bagi klien",
    isPublic: true,
  },
  {
    key: "manual_qris_bank_info",
    defaultValue: "BCA 8291039481 a/n PT Fasaro Digital",
    category: "gateway",
    label: "Informasi Bank Transfer Invity by Fasaro (Ringkasan)",
    description: "Nomor rekening dan bank tujuan transfer manual klien",
    isPublic: true,
  },
  {
    key: "manual_qris_image_url",
    defaultValue: "",
    category: "gateway",
    label: "URL Gambar QRIS Invity by Fasaro",
    description: "Link gambar QRIS statis resmi Invity",
    isPublic: true,
  },
  {
    key: "max_photo_upload",
    defaultValue: "20",
    category: "gateway",
    label: "Batas Default Unggah Foto",
    description: "Batas foto unggahan per undangan secara global",
    isPublic: false,
  },
];

/**
 * Mengambil seluruh pengaturan dari database dengan fallback nilai default.
 */
export async function getAllSettingsMap(): Promise<Record<string, string>> {
  const dbSettings = await prisma.systemSetting.findMany();
  const map: Record<string, string> = {};

  // Isi dengan nilai default dulu
  for (const def of SYSTEM_SETTING_DEFINITIONS) {
    map[def.key] = def.defaultValue;
  }

  // Timpa dengan data yang ada di database
  for (const s of dbSettings) {
    map[s.key] = s.value;
  }

  return map;
}

/**
 * Mengambil pengaturan yang aman untuk konsumsi publik (landing page / frontend).
 */
export async function getPublicSettingsMap(): Promise<Record<string, string>> {
  const all = await getAllSettingsMap();
  const publicMap: Record<string, string> = {};

  for (const def of SYSTEM_SETTING_DEFINITIONS) {
    if (def.isPublic) {
      publicMap[def.key] = all[def.key] ?? def.defaultValue;
    }
  }

  return publicMap;
}

/**
 * Menormalkan nomor WhatsApp agar siap dipakai pada link https://wa.me/
 * Mengubah awalan 0 atau +62 menjadi format 62...
 */
export function normalizeWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) {
    return "62" + digits.slice(1);
  }
  return digits || "6285716697416";
}


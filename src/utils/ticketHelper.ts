import QRCode from "qrcode";
import { triggerBlobDownload } from "./downloadHelper";

export interface GuestTicketData {
  id: string;
  name: string;
  slugCode: string;
  quota: number;
  phoneNumber?: string | null;
}

export interface GenerateTicketOptions {
  guest: GuestTicketData;
  weddingTitle: string;
  invitationSlug: string;
}

/**
 * Merender kartu tiket QR check-in resmi (600 x 780 px)
 * menggunakan HTML5 Canvas dengan desain premium & watermark Invity by Fasaro.
 */
export async function generateGuestTicketCanvas(
  options: GenerateTicketOptions
): Promise<HTMLCanvasElement> {
  const { guest, weddingTitle, invitationSlug } = options;
  const width = 600;
  const height = 780;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Gagal menginisialisasi canvas context");

  // 1. Background Kartu (Sudut membulat)
  ctx.fillStyle = "#FFFFFF";
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(0, 0, width, height, 24);
  } else {
    ctx.fillRect(0, 0, width, height);
  }
  ctx.fill();

  // 2. Header Banner Gelap Mewah
  const gradient = ctx.createLinearGradient(0, 0, width, 120);
  gradient.addColorStop(0, "#0F172A");
  gradient.addColorStop(1, "#1E293B");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, 120);

  // Judul Kartu Header
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("TIKET MASUK & CHECK-IN TAMU", width / 2, 52);

  ctx.font = "14px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText(weddingTitle || "Undangan Pernikahan", width / 2, 84);

  // 3. Informasi Tamu Terhormat
  ctx.fillStyle = "#64748B";
  ctx.font = "13px sans-serif";
  ctx.fillText("KARTU UNDANGAN RESMI UNTUK", width / 2, 160);

  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(guest.name, width / 2, 198);

  // 4. Badge Kuota Kehadiran
  const badgeWidth = 140;
  const badgeHeight = 32;
  const badgeX = (width - badgeWidth) / 2;
  const badgeY = 218;

  ctx.fillStyle = "#FFF7ED";
  ctx.strokeStyle = "#FDBA74";
  ctx.lineWidth = 1;
  ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
  ctx.strokeRect(badgeX, badgeY, badgeWidth, badgeHeight);

  ctx.fillStyle = "#EA580C";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText(`Kuota: ${guest.quota || 1} Pax`, width / 2, 239);

  // 5. Generate QR Code langsung ke Canvas Sementara
  const qrPayload = JSON.stringify({
    guestId: guest.id,
    slugCode: guest.slugCode,
    invitationSlug,
  });

  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, qrPayload, {
    width: 300,
    margin: 1.5,
    color: {
      dark: "#1E293B",
      light: "#FFFFFF",
    },
  });

  ctx.drawImage(qrCanvas, (width - 300) / 2, 270);

  // 6. Label Kode Akses Unik
  ctx.fillStyle = "#94A3B8";
  ctx.font = "12px monospace";
  ctx.fillText(`KODE: ${guest.slugCode}`, width / 2, 600);

  // 7. Garis Putus-putus Pemisah Voucher/Tiket
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(40, 630);
  ctx.lineTo(560, 630);
  ctx.stroke();
  ctx.setLineDash([]);

  // 8. Petunjuk Meja Resepsi & Watermark Brand
  ctx.fillStyle = "#475569";
  ctx.font = "13px sans-serif";
  ctx.fillText(
    "Tunjukkan QR Code ini kepada penerima tamu di meja resepsi.",
    width / 2,
    670
  );

  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = "#F97316";
  ctx.fillText("Invity by Fasaro", width / 2, 715);

  return canvas;
}

/**
 * Mengonversi Canvas Tiket menjadi Blob PNG
 */
export async function generateGuestTicketBlob(
  options: GenerateTicketOptions
): Promise<Blob> {
  const canvas = await generateGuestTicketCanvas(options);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Gagal mengonversi tiket canvas ke blob"));
    }, "image/png");
  });
}

/**
 * Mengonversi Canvas Tiket menjadi File PNG
 */
export async function generateGuestTicketFile(
  options: GenerateTicketOptions
): Promise<File> {
  const blob = await generateGuestTicketBlob(options);
  const cleanName = (options.guest.name || "Tamu")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .slice(0, 30);
  return new File([blob], `Tiket-QR-${cleanName}.png`, { type: "image/png" });
}

export interface ShareGuestInvitationParams {
  guest: GuestTicketData;
  weddingTitle: string;
  invitationSlug: string;
  invitationUrl: string;
  greetingText: string;
}

export interface ShareResult {
  success: boolean;
  method: "web-share" | "clipboard-wa" | "wa-direct";
  message?: string;
}

/**
 * Mengirim undangan WhatsApp lengkap dengan Gambar Tiket QR dalam satu kali aksi.
 * - Mobile (Android/iOS): Memanfaatkan Web Share API (File + Teks sekaligus).
 * - Desktop/Browser biasa: Menyalin gambar tiket ke Clipboard, mengunduh file tiket,
 *   dan membuka WhatsApp dengan pesan yang sudah terisi tautan & kode check-in.
 */
export async function shareGuestInvitationWithTicket(
  params: ShareGuestInvitationParams
): Promise<ShareResult> {
  const { guest, weddingTitle, invitationSlug, greetingText } = params;

  let ticketBlob: Blob | null = null;
  let ticketFile: File | null = null;

  try {
    ticketBlob = await generateGuestTicketBlob({
      guest,
      weddingTitle,
      invitationSlug,
    });
    const cleanName = (guest.name || "Tamu")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .slice(0, 30);
    ticketFile = new File([ticketBlob], `Tiket-QR-${cleanName}.png`, {
      type: "image/png",
    });
  } catch (err) {
    console.warn("Gagal membuat gambar tiket, beralih ke kirim teks:", err);
  }

  // Format nomor WhatsApp
  let cleanPhone = guest.phoneNumber
    ? guest.phoneNumber.replace(/[^0-9]/g, "")
    : "";
  if (cleanPhone.startsWith("08")) {
    cleanPhone = "62" + cleanPhone.slice(1);
  } else if (cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.slice(1);
  }

  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(greetingText)}`
    : `https://wa.me/?text=${encodeURIComponent(greetingText)}`;

  // 1. Cek Web Share API dengan File (Didukung di Smartphone Chrome/Safari)
  if (
    ticketFile &&
    typeof navigator !== "undefined" &&
    navigator.share &&
    typeof navigator.canShare === "function"
  ) {
    try {
      const shareData = {
        title: `Undangan & Tiket Masuk - ${guest.name}`,
        text: greetingText,
        files: [ticketFile],
      };

      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return {
          success: true,
          method: "web-share",
          message: "Undangan & Tiket QR berhasil dibagikan!",
        };
      }
    } catch (err: unknown) {
      // Jika user membatalkan share sheet, tidak perlu fallback paksa
      if (err instanceof Error && err.name === "AbortError") {
        return { success: false, method: "web-share", message: "Batal dibagikan" };
      }
      // Lanjut ke fallback jika bukan abort
    }
  }

  // 2. Desktop / Browser tanpa file share:
  // Salin gambar tiket ke Clipboard pengguna agar bisa langsung di-Paste (Ctrl+V) di WhatsApp Web
  let clipboardCopied = false;
  if (
    ticketBlob &&
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof ClipboardItem !== "undefined"
  ) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": ticketBlob }),
      ]);
      clipboardCopied = true;
    } catch {
      // Clipboard write image blocked or not supported
    }
  }

  // Unduh otomatis file tiket sebagai cadangan instan
  if (ticketBlob) {
    const cleanName = (guest.name || "Tamu")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .slice(0, 30);
    triggerBlobDownload(ticketBlob, `Tiket-QR-${cleanName}.png`);
  }

  // Buka WhatsApp
  window.open(waUrl, "_blank");

  return {
    success: true,
    method: clipboardCopied ? "clipboard-wa" : "wa-direct",
    message: clipboardCopied
      ? "Gambar Tiket QR otomatis disalin ke Clipboard & diunduh! Tekan Ctrl+V (Paste) di WhatsApp untuk melampirkan gambar tiket."
      : "Gambar Tiket QR telah diunduh dan link WhatsApp telah dibuka.",
  };
}

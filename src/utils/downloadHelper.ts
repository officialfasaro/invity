import QRCode from "qrcode";

/**
 * Robustly trigger a file download in the browser using a temporary anchor element.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
}

/**
 * Convert base64 data URL to Blob for reliable downloading.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
  const binaryString = atob(parts[1]);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/**
 * Download any image URL to client computer/phone with multiple fallback layers.
 * Handles same-origin, CORS, and cross-origin external files via backend download proxy.
 */
export async function downloadImageFile(
  url: string,
  suggestedFilename = "downloaded-image.jpg"
): Promise<void> {
  if (!url || typeof url !== "string") {
    throw new Error("URL gambar tidak valid");
  }

  const cleanFilename =
    suggestedFilename.replace(/[^\w\s.-]/g, "").trim().replace(/\s+/g, "_") ||
    "gambar.jpg";

  // 1. Data URL
  if (url.startsWith("data:")) {
    const blob = dataUrlToBlob(url);
    triggerBlobDownload(blob, cleanFilename);
    return;
  }

  // 2. Direct Blob Fetch (handles same-origin or CORS-allowed resources)
  try {
    const response = await fetch(url, { mode: "cors" });
    if (response.ok) {
      const blob = await response.blob();
      triggerBlobDownload(blob, cleanFilename);
      return;
    }
  } catch {
    // If CORS fails, proceed to backend proxy
  }

  // 3. Backend Download Proxy (streams external image with Content-Disposition: attachment)
  try {
    const proxyUrl = `/api/public/download-file?url=${encodeURIComponent(
      url
    )}&filename=${encodeURIComponent(cleanFilename)}`;
    const link = document.createElement("a");
    link.href = proxyUrl;
    link.download = cleanFilename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  } catch {
    // 4. Last resort: open in new tab
    window.open(url, "_blank");
  }
}

interface GenerateQrisCardOptions {
  url?: string | null;
  coupleName?: string;
  invitationSlug?: string;
  suggestedFilename?: string;
}

/**
 * Downloads QRIS image for wedding invitations.
 * If a custom QRIS image was uploaded, downloads the image file directly.
 * If no custom QRIS exists, generates a high-resolution, branded 600x750px wedding QRIS card
 * directly on HTML5 Canvas using QRCode.toCanvas (bypasses Image.onload race condition completely).
 */
export async function downloadWeddingQrisCard(
  options: GenerateQrisCardOptions
): Promise<void> {
  const { url, coupleName, invitationSlug, suggestedFilename } = options;

  const defaultName = `QRIS-${(coupleName || "Pernikahan")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")}.png`;
  const filename = suggestedFilename || defaultName;

  // 1. If custom uploaded QRIS image URL is available
  if (url && typeof url === "string" && url.trim() !== "") {
    await downloadImageFile(url, filename);
    return;
  }

  // 2. High-resolution Branded QRIS Card Generation via HTML5 Canvas
  const width = 600;
  const height = 750;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Gagal menginisialisasi canvas");

  // Card Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Header Background
  ctx.fillStyle = "#6c1d28";
  ctx.fillRect(0, 0, width, 115);

  // Header Text
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 26px serif";
  ctx.textAlign = "center";
  ctx.fillText("QRIS DANA KASIH", width / 2, 50);

  ctx.fillStyle = "#f4ece0";
  ctx.font = "16px sans-serif";
  ctx.fillText(`Pernikahan ${coupleName || "Bahagia"}`, width / 2, 85);

  // Gold Decorative Border
  ctx.strokeStyle = "#c5a880";
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Generate QR code onto temporary canvas directly (no Image.onload race condition)
  const qrCanvas = document.createElement("canvas");
  const qrPayload = `https://fasaro-invity.id/${invitationSlug || "wedding"}?gift=qris`;
  await QRCode.toCanvas(qrCanvas, qrPayload, {
    width: 400,
    margin: 1,
    color: {
      dark: "#2a2421",
      light: "#FFFFFF",
    },
  });

  // Render QR Canvas into card
  ctx.drawImage(qrCanvas, (width - 400) / 2, 140);

  // Footer Text
  ctx.fillStyle = "#2a2421";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("STANDAR PEMBAYARAN NASIONAL (QRIS)", width / 2, 585);

  ctx.fillStyle = "#6b615b";
  ctx.font = "13px sans-serif";
  ctx.fillText(
    "BCA • Mandiri • BRI • BNI • GoPay • OVO • DANA • ShopeePay",
    width / 2,
    615
  );

  ctx.font = "italic 13px serif";
  ctx.fillStyle = "#6c1d28";
  ctx.fillText(
    "Terima kasih atas doa restu & tanda kasih Anda",
    width / 2,
    655
  );

  // Export to Blob and download
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Gagal membuat berkas gambar QRIS"));
        return;
      }
      triggerBlobDownload(blob, filename);
      resolve();
    }, "image/png");
  });
}

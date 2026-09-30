"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Download, QrCode, Send, X, Users, Check, Calendar } from "lucide-react";
import { GuestItem } from "./tabs/GuestBookTab";

interface GuestQrTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: GuestItem | null;
  weddingTitle: string;
  invitationSlug: string;
}

export const GuestQrTicketModal: React.FC<GuestQrTicketModalProps> = ({
  isOpen,
  onClose,
  guest,
  weddingTitle,
  invitationSlug,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !guest) {
      setQrDataUrl("");
      return;
    }

    setIsGenerating(true);

    // Payload for check-in: contains guestId & slugCode
    const qrPayload = JSON.stringify({
      guestId: guest.id,
      slugCode: guest.slugCode,
      invitationSlug,
    });

    QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 1.5,
      color: {
        dark: "#1E293B",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("Gagal generate QR Code:", err);
      })
      .finally(() => {
        setIsGenerating(false);
      });
  }, [isOpen, guest, invitationSlug]);

  if (!isOpen || !guest) return null;

  const invitationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/invitation/${invitationSlug}?to=${encodeURIComponent(
          guest.name
        )}&code=${encodeURIComponent(guest.slugCode)}`
      : `/invitation/${invitationSlug}?to=${encodeURIComponent(guest.name)}`;

  const handleDownloadTicket = () => {
    if (!qrDataUrl) return;

    // Create a high-res canvas ticket for download
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 780;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.roundRect ? ctx.roundRect(0, 0, 600, 780, 24) : ctx.fillRect(0, 0, 600, 780);
    ctx.fill();

    // Top Header Banner
    const gradient = ctx.createLinearGradient(0, 0, 600, 0);
    gradient.addColorStop(0, "#F97316");
    gradient.addColorStop(1, "#EA580C");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 120);

    // Brand Name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TIKET MASUK & CHECK-IN TAMU", 300, 52);
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText(weddingTitle || "Undangan Pernikahan", 300, 84);

    // Guest Info Section
    ctx.fillStyle = "#64748B";
    ctx.font = "13px sans-serif";
    ctx.fillText("KARTU UNDANGAN RESMI UNTUK", 300, 160);

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(guest.name, 300, 198);

    // Quota Badge
    ctx.fillStyle = "#F3F4F6";
    ctx.fillRect(230, 218, 140, 32);
    ctx.fillStyle = "#374151";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(`Kuota: ${guest.quota} Pax`, 300, 239);

    // QR Image
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 150, 270, 300, 300);

      // Slug Code text
      ctx.fillStyle = "#94A3B8";
      ctx.font = "12px monospace";
      ctx.fillText(`KODE: ${guest.slugCode}`, 300, 600);

      // Divider line
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(40, 630);
      ctx.lineTo(560, 630);
      ctx.stroke();
      ctx.setLineDash([]);

      // Footer Instructions
      ctx.fillStyle = "#475569";
      ctx.font = "13px sans-serif";
      ctx.fillText("Tunjukkan QR Code ini kepada penerima tamu di meja resepsi.", 300, 670);
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "#F97316";
      ctx.fillText("fasaro.id", 300, 715);

      // Trigger download
      const link = document.createElement("a");
      link.download = `Tiket-QR-${guest.name.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    qrImg.src = qrDataUrl;
  };

  const handleShareWhatsApp = () => {
    const text = `Halo *${guest.name}*,\n\nMerupakan suatu kehormatan bagi kami apabila Anda berkenan hadir di acara pernikahan kami:\n\n*${weddingTitle}*\n\nBerikut tautan undangan digital & tiket check-in kehadiran Anda:\n${invitationUrl}\n\nMohon simpan tiket atau tunjukkan QR Code pada tautan di atas kepada penerima tamu di meja resepsi saat tiba di lokasi.\n\nTerima kasih.`;
    const cleanPhone = guest.phoneNumber ? guest.phoneNumber.replace(/[^0-9]/g, "") : "";
    let waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (cleanPhone) {
      const formatted = cleanPhone.startsWith("0")
        ? `62${cleanPhone.slice(1)}`
        : cleanPhone.startsWith("62")
        ? cleanPhone
        : `62${cleanPhone}`;
      waUrl = `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
    }
    window.open(waUrl, "_blank");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full border border-[#E2E8F0] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F97316] flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Tiket QR Tamu</h3>
              <p className="text-[11px] text-slate-500">Check-in Meja Resepsi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ticket Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-center" ref={ticketRef}>
          {/* Guest Name & Pax */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Tamu Undangan
            </span>
            <h4 className="font-bold text-lg text-slate-900">{guest.name}</h4>
            <div className="flex items-center justify-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-[#F97316] border border-orange-200">
                <Users className="w-3 h-3" />
                <span>{guest.quota} Pax</span>
              </span>
              {guest.checkedInAt ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3 h-3" />
                  <span>
                    Sudah Hadir (
                    {new Date(guest.checkedInAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    )
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Belum Check-in
                </span>
              )}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs inline-block mx-auto relative group">
            {isGenerating ? (
              <div className="w-52 h-52 flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-400">Menyiapkan QR...</span>
              </div>
            ) : qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR Code ${guest.name}`}
                className="w-52 h-52 mx-auto rounded-lg"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400">
                Gagal memuat QR Code
              </div>
            )}

            <p className="text-[11px] font-mono text-slate-400 mt-2">
              KODE: <span className="font-bold text-slate-700">{guest.slugCode}</span>
            </p>
          </div>

          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Scan QR Code ini menggunakan kamera scanner meja resepsi untuk verifikasi kehadiran
            secara instan.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E2E8F0] bg-slate-50/50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadTicket}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Unduh Tiket</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim ke WA</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-2 px-3 text-center text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            {copied ? (
              <span className="text-emerald-600 font-semibold">Tautan Khusus Tamu Tersalin!</span>
            ) : (
              "Salin Link Undangan Khusus Tamu"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestQrTicketModal;

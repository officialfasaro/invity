"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Download, QrCode, Send, X, Users, Check, Calendar } from "lucide-react";
import { GuestItem } from "./tabs/GuestBookTab";
import {
  generateGuestTicketBlob,
  shareGuestInvitationWithTicket,
} from "@/utils/ticketHelper";
import { triggerBlobDownload } from "@/utils/downloadHelper";

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

  const handleDownloadTicket = async () => {
    if (!guest) return;
    try {
      const blob = await generateGuestTicketBlob({
        guest,
        weddingTitle: weddingTitle || "Undangan Pernikahan",
        invitationSlug,
      });
      const cleanName = (guest.name || "Tamu").replace(/[^a-zA-Z0-9]/g, "-");
      triggerBlobDownload(blob, `Tiket-QR-${cleanName}.png`);
    } catch (err) {
      console.error("Gagal mengunduh tiket:", err);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!guest) return;
    const text = `Halo *${guest.name}*,\n\nMerupakan suatu kehormatan bagi kami apabila Anda berkenan hadir di acara pernikahan kami:\n\n*${weddingTitle}*\n\n🎟️ *KARTU AKSES & TIKET CHECK-IN TAMU:*\nKode Akses: *${guest.slugCode}* (Kuota: ${guest.quota} Pax)\n\nBerikut tautan undangan digital & tiket check-in kehadiran Anda:\n${invitationUrl}\n\nMohon simpan tiket atau tunjukkan QR Code pada tautan di atas kepada penerima tamu di meja resepsi saat tiba di lokasi.\n\nTerima kasih.`;

    await shareGuestInvitationWithTicket({
      guest,
      weddingTitle: weddingTitle || "Undangan Pernikahan",
      invitationSlug,
      invitationUrl,
      greetingText: text,
    });
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
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-none bg-orange-50 text-[#F97316] border border-orange-200">
                <Users className="w-3 h-3" />
                <span>{guest.quota} Pax</span>
              </span>
              {guest.checkedInAt ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-none bg-emerald-50 text-emerald-700 border border-emerald-200">
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
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-none bg-slate-100 text-slate-600 border border-slate-200">
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

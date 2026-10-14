"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  X,
  KeyRound,
  RefreshCw,
  Camera,
  Share2,
} from "lucide-react";

interface GuestReceptionAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  weddingTitle: string;
  onOpenInternalScanner: () => void;
}

export const GuestReceptionAccessModal: React.FC<GuestReceptionAccessModalProps> = ({
  isOpen,
  onClose,
  slug,
  weddingTitle,
  onOpenInternalScanner,
}) => {
  const [pin, setPin] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditingPin, setIsEditingPin] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>("");
  const [isSavingPin, setIsSavingPin] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Copy states
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedDirectLink, setCopiedDirectLink] = useState<boolean>(false);
  const [copiedPin, setCopiedPin] = useState<boolean>(false);

  // QR Code state
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isQrLoading, setIsQrLoading] = useState<boolean>(true);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const receptionPath = `/reception/${slug}`;
  const directPath = pin ? `/reception/${slug}?pin=${pin}` : `/reception/${slug}`;
  const fullDirectUrl = `${baseUrl}${directPath}`;
  const fullReceptionUrl = `${baseUrl}${receptionPath}`;

  // Fetch initial PIN
  const fetchAccessInfo = async () => {
    setIsLoading(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/dashboard/reception-access");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const currentPin = json.data.pin || "123456";
          setPin(currentPin);
          setNewPin(currentPin);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccessInfo();
    }
  }, [isOpen, slug]);

  // Generate QR Code when fullDirectUrl or pin changes
  useEffect(() => {
    if (!isOpen || !pin || !fullDirectUrl) return;

    setIsQrLoading(true);
    QRCode.toDataURL(fullDirectUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: "#1E293B",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch(() => {
        setQrDataUrl("");
      })
      .finally(() => {
        setIsQrLoading(false);
      });
  }, [isOpen, pin, fullDirectUrl]);

  // Save new PIN
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.trim().length < 4 || newPin.trim().length > 12) {
      setSaveError("PIN harus terdiri dari 4 sampai 12 karakter.");
      return;
    }

    setIsSavingPin(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/dashboard/reception-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: newPin.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPin(json.data.pin);
        setIsEditingPin(false);
      } else {
        setSaveError(json.error || "Gagal memperbarui PIN.");
      }
    } catch {
      setSaveError("Terjadi gangguan koneksi saat menyimpan PIN.");
    } finally {
      setIsSavingPin(false);
    }
  };

  const copyToClipboard = async (text: string, type: "link" | "direct" | "pin") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "link") {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else if (type === "direct") {
        setCopiedDirectLink(true);
        setTimeout(() => setCopiedDirectLink(false), 2000);
      } else if (type === "pin") {
        setCopiedPin(true);
        setTimeout(() => setCopiedPin(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E2E8F0] my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Akses Pagar Ayu &amp; Meja Tamu
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[280px] sm:max-w-xs">
                {weddingTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Security Guarantee Banner */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-emerald-800">
                Data Rekening &amp; Pengantin 100% Aman Terisolasi
              </p>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Pagar ayu dan penerima tamu hanya dapat memindai tiket kehadiran tamu. Mereka sama sekali
                <strong> tidak memiliki akses</strong> ke nomor rekening bank, amplop, billing, maupun data pribadi mempelai.
              </p>
            </div>
          </div>

          {/* QR Code Panitia Hari-H */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-[#F97316] text-[10px] font-bold uppercase tracking-wider">
              <QrCode className="w-3 h-3" />
              Scan Masuk Panitia
            </span>
            <p className="text-xs text-slate-600">
              Pagar ayu cukup memindai QR Code ini menggunakan kamera HP mereka untuk langsung membuka portal pemindai:
            </p>

            <div className="flex justify-center py-1">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs inline-block">
                {isQrLoading || isLoading ? (
                  <div className="w-44 h-44 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
                  </div>
                ) : qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code Akses Pagar Ayu"
                    className="w-44 h-44 rounded-lg block"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                    Gagal memuat QR
                  </div>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-mono">
              {fullDirectUrl}
            </p>
          </div>

          {/* PIN Keamanan Acara */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#F97316]" />
                <span className="text-xs font-bold text-slate-900">PIN Keamanan Meja Tamu</span>
              </div>
              {!isEditingPin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPin(true);
                    setNewPin(pin);
                  }}
                  className="text-xs text-[#F97316] hover:underline font-semibold cursor-pointer"
                >
                  Ubah PIN
                </button>
              )}
            </div>

            {isEditingPin ? (
              <form onSubmit={handleSavePin} className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Contoh: 123456"
                    maxLength={12}
                    className="flex-1 px-3 py-2 text-sm font-mono tracking-wider font-bold rounded-lg border border-[#E2E8F0] focus:border-[#F97316] outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSavingPin}
                    className="py-2 px-3 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingPin ? "..." : "Simpan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPin(false);
                      setSaveError(null);
                    }}
                    className="py-2 px-3 rounded-lg border border-[#E2E8F0] text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
                {saveError && (
                  <p className="text-xs text-red-600">{saveError}</p>
                )}
              </form>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-mono text-lg font-bold tracking-widest text-slate-900">
                  {isLoading ? "..." : pin}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(pin, "pin")}
                  className="inline-flex items-center gap-1 py-1 px-2.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-white transition-colors cursor-pointer"
                  title="Salin PIN"
                >
                  {copiedPin ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Salin PIN</span>
                    </>
                  )}
                </button>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              PIN ini dimasukkan oleh pagar ayu saat membuka link portal di HP mereka jika link dibuka tanpa parameter PIN.
            </p>
          </div>

          {/* Quick Action Links */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => copyToClipboard(fullDirectUrl, "direct")}
              className="w-full py-2.5 px-4 rounded-xl border border-orange-300 bg-orange-50 hover:bg-orange-100 text-[#F97316] text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              {copiedDirectLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Link Langsung Pagar Ayu Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#F97316]" />
                  <span>Salin Link Pagar Ayu (Langsung Masuk Otomatis)</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={directPath}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Buka di Tab Baru</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInternalScanner();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Camera className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Scan di Sini</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestReceptionAccessModal;

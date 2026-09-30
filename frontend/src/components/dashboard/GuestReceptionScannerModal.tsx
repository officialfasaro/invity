"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import jsQR from "jsqr";
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  X,
  Users,
  Search,
  RefreshCw,
  Clock,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  FlipHorizontal,
  Check,
} from "lucide-react";
import { GuestItem } from "./tabs/GuestBookTab";

interface GuestReceptionScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationSlug: string;
  weddingTitle: string;
  onCheckinSuccess?: (updatedGuest: GuestItem) => void;
}

interface ScanResultState {
  type: "success" | "warning" | "error";
  message: string;
  guest?: GuestItem;
}

export const GuestReceptionScannerModal: React.FC<GuestReceptionScannerModalProps> = ({
  isOpen,
  onClose,
  invitationSlug,
  weddingTitle,
  onCheckinSuccess,
}) => {
  // Video and Canvas refs for camera scanning
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Scanner States
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Manual Input State
  const [manualInput, setManualInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Results & Stats
  const [lastResult, setLastResult] = useState<ScanResultState | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<GuestItem[]>([]);
  const [stats, setStats] = useState({
    totalGuests: 0,
    checkedInGuests: 0,
    totalPax: 0,
    checkedInPax: 0,
  });

  // Sound generator using Web Audio API
  const playBeep = useCallback((isSuccess = true) => {
    if (typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        osc.frequency.exponentialRampToValueAtTime(1174.66, audioCtx.currentTime + 0.12); // D6
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      } else {
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.setValueAtTime(260, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch {
      // Audio context restricted or unavailable
    }
  }, []);

  // Fetch initial stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/guests/checkin-stats");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setStats({
            totalGuests: json.data.totalGuests || 0,
            checkedInGuests: json.data.checkedInGuests || 0,
            totalPax: json.data.totalPax || 0,
            checkedInPax: json.data.checkedInPax || 0,
          });
          if (Array.isArray(json.data.recentCheckins)) {
            setRecentCheckins(json.data.recentCheckins);
          }
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Process checkin via API
  const handleCheckinRequest = useCallback(
    async (payload: { qrData?: string; slugCode?: string; guestId?: string }) => {
      if (isProcessing) return;
      setIsProcessing(true);

      try {
        const res = await fetch("/api/dashboard/guests/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();

        if (res.ok && json.success) {
          const guest: GuestItem = json.data.guest;
          if (json.status === "ALREADY_CHECKED_IN") {
            if (soundEnabled) playBeep(false);
            setLastResult({
              type: "warning",
              message: json.message,
              guest,
            });
          } else {
            if (soundEnabled) playBeep(true);
            setLastResult({
              type: "success",
              message: json.message,
              guest,
            });
            if (onCheckinSuccess) onCheckinSuccess(guest);
          }

          if (json.data.stats) {
            setStats(json.data.stats);
          }
          fetchStats();
        } else {
          if (soundEnabled) playBeep(false);
          setLastResult({
            type: "error",
            message: json.error || "Data tamu tidak ditemukan dalam buku tamu acara ini.",
          });
        }
      } catch (err) {
        if (soundEnabled) playBeep(false);
        setLastResult({
          type: "error",
          message: err instanceof Error ? err.message : "Terjadi kesalahan koneksi scanner",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, soundEnabled, playBeep, onCheckinSuccess, fetchStats]
  );

  // Undo Check-in
  const handleUndoCheckin = async (guestId: string) => {
    try {
      const res = await fetch("/api/dashboard/guests/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: guestId, action: "undo" }),
      });
      if (res.ok) {
        fetchStats();
        setLastResult({
          type: "warning",
          message: "Check-in berhasil dibatalkan.",
        });
      }
    } catch {
      // Fallback
    }
  };

  // Start Camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(
        "Kamera tidak dapat diakses atau izin ditolak. Anda tetap dapat menggunakan input manual atau scanner barcode di bawah."
      );
      setIsCameraActive(false);
    }
  }, [facingMode]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Continuous Camera Frame Processing
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    fetchStats();
    startCamera();

    const canvas = document.createElement("canvas");
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    let lastScannedPayload = "";
    let lastScanTime = 0;

    const intervalId = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA || !ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        const now = Date.now();
        // Prevent duplicate trigger for same QR in short succession
        if (code.data === lastScannedPayload && now - lastScanTime < 3000) {
          return;
        }

        lastScannedPayload = code.data;
        lastScanTime = now;
        handleCheckinRequest({ qrData: code.data });
      }
    }, 250);

    scanIntervalRef.current = intervalId;

    return () => {
      window.clearInterval(intervalId);
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera, handleCheckinRequest, fetchStats]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleCheckinRequest({ qrData: manualInput.trim() });
    setManualInput("");
  };

  const percentage =
    stats.totalGuests > 0 ? Math.round((stats.checkedInGuests / stats.totalGuests) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E2E8F0] shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F97316] text-white flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Meja Tamu Resepsi &amp; QR Scanner
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Live Check-in
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                {weddingTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? "border-[#E2E8F0] text-slate-600 hover:bg-slate-100"
                  : "border-slate-200 text-slate-300"
              }`}
              title={soundEnabled ? "Suara beep aktif" : "Suara beep nonaktif"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Counters Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#E2E8F0] border-b border-[#E2E8F0] bg-white">
          <div className="p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Tamu Hadir
            </span>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">
              {stats.checkedInGuests}{" "}
              <span className="text-xs font-medium text-slate-400">/ {stats.totalGuests}</span>
            </p>
          </div>
          <div className="p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Pax Hadir
            </span>
            <p className="text-lg font-bold text-[#F97316] mt-0.5">
              {stats.checkedInPax}{" "}
              <span className="text-xs font-medium text-slate-400">/ {stats.totalPax}</span>
            </p>
          </div>
          <div className="p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Persentase
            </span>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{percentage}%</p>
          </div>
          <div className="p-3 text-center flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={fetchStats}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#F97316] py-1 px-2 rounded-md hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Camera Viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video max-h-64 sm:max-h-72 w-full flex items-center justify-center shadow-inner">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white/60 rounded-2xl relative">
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#F97316] rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#F97316] rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#F97316] rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#F97316] rounded-br-lg" />
                {/* Laser scan line animation */}
                <div className="w-full h-0.5 bg-[#F97316] shadow-xs shadow-orange-500 animate-bounce mt-24 opacity-80" />
              </div>
            </div>

            {/* Camera Floating Switch button */}
            <button
              type="button"
              onClick={() => {
                setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
              }}
              className="absolute bottom-3 right-3 py-1.5 px-3 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition-colors border border-white/20"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>Ganti Kamera</span>
            </button>

            {/* Camera Error banner */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-900/90 p-6 flex flex-col items-center justify-center text-center text-white space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
                <p className="text-xs text-slate-300 max-w-sm">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-lg bg-[#F97316] text-white text-xs font-semibold hover:bg-[#EA580C] transition-colors"
                >
                  Coba Akses Kamera Lagi
                </button>
              </div>
            )}
          </div>

          {/* Instant Scan Result Feedback Card */}
          {lastResult && (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in zoom-in-95 duration-150 ${
                lastResult.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                  : lastResult.type === "warning"
                  ? "bg-amber-50 text-amber-900 border-amber-300"
                  : "bg-rose-50 text-rose-900 border-rose-300"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {lastResult.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : lastResult.type === "warning" ? (
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {lastResult.guest ? lastResult.guest.name : "Hasil Scan"}
                  </h4>
                  <p className="text-xs mt-0.5">{lastResult.message}</p>
                  {lastResult.guest && (
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-medium">
                      <span>Kuota: {lastResult.guest.quota} Pax</span>
                      <span>•</span>
                      <span>Kode: {lastResult.guest.slugCode}</span>
                    </div>
                  )}
                </div>
              </div>

              {lastResult.guest && (
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleUndoCheckin(lastResult.guest!.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>Batalkan</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Manual Input / Barcode Scanner Gun Field */}
          <form onSubmit={handleManualSubmit} className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Input Manual / Scanner Barcode Gun:
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Ketik kode slug tamu, nama, atau scan barcode..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 text-xs sm:text-sm focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none shadow-xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <button
                type="submit"
                disabled={!manualInput.trim() || isProcessing}
                className="px-4 py-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-colors disabled:opacity-50 min-h-[38px] shadow-xs shrink-0"
              >
                {isProcessing ? "Memproses..." : "Check-in"}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Tips: Jika menggunakan alat Barcode Scanner USB/Bluetooth, cukup arahkan kursor ke
              input ini lalu scan tiket.
            </p>
          </form>

          {/* Recent Check-ins List */}
          {recentCheckins.length > 0 && (
            <div className="space-y-2 pt-2">
              <h5 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Log Kehadiran Tamu Terbaru (10 Terakhir):</span>
              </h5>
              <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden bg-white shadow-2xs">
                {recentCheckins.map((guest) => (
                  <div
                    key={guest.id}
                    className="p-2.5 sm:px-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-slate-900 truncate">{guest.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {guest.quota} Pax •{" "}
                        {guest.checkedInAt
                          ? new Date(guest.checkedInAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }) + " WIB"
                          : "-"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUndoCheckin(guest.id)}
                      className="text-[11px] text-slate-400 hover:text-rose-600 px-2 py-1 rounded transition-colors"
                      title="Batalkan kehadiran tamu ini"
                    >
                      Batal
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-[#E2E8F0] bg-slate-50/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            fasaro.id/{invitationSlug}
          </span>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="py-1.5 px-4 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            Tutup Scanner
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestReceptionScannerModal;

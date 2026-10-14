"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import jsQR from "jsqr";
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  RefreshCw,
  Clock,
  Volume2,
  VolumeX,
  FlipHorizontal,
  Check,
  ShieldCheck,
  KeyRound,
  LogOut,
  ArrowRight,
  ListFilter,
  UserCheck,
  Delete,
} from "lucide-react";

interface ReceptionGuestItem {
  id: string;
  name: string;
  slugCode: string;
  quota: number;
  phoneNumber?: string | null;
  checkedInAt?: string | null;
}

interface ScanResultState {
  type: "success" | "warning" | "error";
  message: string;
  guest?: ReceptionGuestItem;
}

interface ReceptionStats {
  totalGuests: number;
  checkedInGuests: number;
  totalPax: number;
  checkedInPax: number;
}

export const ReceptionPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Auth & Session States
  const [token, setToken] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState<string>("");
  const [weddingTitle, setWeddingTitle] = useState<string>("Buku Tamu Resepsi");
  const [coupleName, setCoupleName] = useState<string>("");
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab: 'scanner' | 'manual' | 'stats'
  const [activeTab, setActiveTab] = useState<"scanner" | "manual" | "stats">("scanner");

  // Camera & Scanner States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isProcessingScan, setIsProcessingScan] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<ScanResultState | null>(null);

  // Guest List & Manual Search States
  const [guestList, setGuestList] = useState<ReceptionGuestItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoadingGuests, setIsLoadingGuests] = useState<boolean>(false);
  const [isTogglingCheckin, setIsTogglingCheckin] = useState<string | null>(null);

  // Stats States
  const [stats, setStats] = useState<ReceptionStats>({
    totalGuests: 0,
    checkedInGuests: 0,
    totalPax: 0,
    checkedInPax: 0,
  });
  const [recentCheckins, setRecentCheckins] = useState<ReceptionGuestItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);

  // Sound generator
  const playBeep = useCallback((isSuccess = true) => {
    if (typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1174.66, audioCtx.currentTime + 0.12);
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
      // Audio context error
    }
  }, []);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Verify PIN function
  const handleVerifyPin = useCallback(
    async (pinToVerify: string) => {
      if (!slug || !pinToVerify.trim()) return;

      setIsVerifyingPin(true);
      setAuthError(null);

      try {
        const res = await fetch(`/api/reception/${slug}/verify-pin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: pinToVerify.trim() }),
        });

        const json = await res.json();

        if (res.ok && json.success) {
          const verifiedToken = json.data.token;
          setToken(verifiedToken);
          setWeddingTitle(json.data.weddingTitle || "Buku Tamu Resepsi");
          setCoupleName(json.data.coupleName || "");

          if (typeof window !== "undefined") {
            sessionStorage.setItem(`reception_token_${slug}`, verifiedToken);
          }
        } else {
          setAuthError(json.error || "PIN Meja Tamu salah. Silakan tanyakan kepada pengantin.");
        }
      } catch {
        setAuthError("Gagal menghubungi server. Periksa koneksi internet Anda.");
      } finally {
        setIsVerifyingPin(false);
      }
    },
    [slug]
  );

  // Check saved token or URL PIN on mount
  useEffect(() => {
    if (!slug) return;

    const savedToken = typeof window !== "undefined" ? sessionStorage.getItem(`reception_token_${slug}`) : null;
    const urlPin = searchParams.get("pin");

    if (savedToken) {
      setToken(savedToken);
    } else if (urlPin) {
      setPinInput(urlPin);
      handleVerifyPin(urlPin);
    }
  }, [slug, searchParams, handleVerifyPin]);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    if (!slug || !token) return;
    setIsLoadingStats(true);
    try {
      const res = await fetch(`/api/reception/${slug}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data.stats);
          if (Array.isArray(json.data.recentCheckins)) {
            setRecentCheckins(json.data.recentCheckins);
          }
          if (json.data.weddingTitle) {
            setWeddingTitle(json.data.weddingTitle);
          }
          if (json.data.coupleName) {
            setCoupleName(json.data.coupleName);
          }
        }
      } else if (res.status === 401) {
        setToken(null);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(`reception_token_${slug}`);
        }
      }
    } catch {
      // Error fetching stats
    } finally {
      setIsLoadingStats(false);
    }
  }, [slug, token]);

  // Fetch Guest List for Manual Search
  const fetchGuests = useCallback(async () => {
    if (!slug || !token) return;
    setIsLoadingGuests(true);
    try {
      const res = await fetch(`/api/reception/${slug}/guests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setGuestList(json.data);
        }
      }
    } catch {
      // Error fetching guests
    } finally {
      setIsLoadingGuests(false);
    }
  }, [slug, token]);

  // Trigger data load when token available
  useEffect(() => {
    if (token) {
      fetchStats();
      fetchGuests();
    }
  }, [token, fetchStats, fetchGuests]);

  // Process QR / Barcode Scan Request
  const handleCheckinScan = useCallback(
    async (payload: { qrData?: string; slugCode?: string; guestId?: string }) => {
      if (!slug || !token || isProcessingScan) return;
      setIsProcessingScan(true);

      try {
        const res = await fetch(`/api/reception/${slug}/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json();

        if (res.ok && json.success) {
          const guest: ReceptionGuestItem = json.data.guest;
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
          }

          if (json.data.stats) {
            setStats(json.data.stats);
          }
          fetchStats();
          fetchGuests();
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
        setIsProcessingScan(false);
      }
    },
    [slug, token, isProcessingScan, soundEnabled, playBeep, fetchStats, fetchGuests]
  );

  // Manual Check-in Toggle
  const handleToggleCheckin = async (guest: ReceptionGuestItem, targetCheckedIn: boolean) => {
    if (!slug || !token) return;
    setIsTogglingCheckin(guest.id);

    try {
      const res = await fetch(`/api/reception/${slug}/guests/${guest.id}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ checkedIn: targetCheckedIn }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (targetCheckedIn && soundEnabled) playBeep(true);
        fetchStats();
        fetchGuests();
      }
    } catch {
      // Error toggle
    } finally {
      setIsTogglingCheckin(null);
    }
  };

  // Start Camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Perangkat atau browser Anda tidak mendukung akses kamera langsung.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setIsCameraActive(true);

        let lastScannedRaw = "";
        let scanCooldown = false;

        scanIntervalRef.current = window.setInterval(() => {
          if (!videoRef.current || !canvasRef.current || scanCooldown) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;

          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (qrCode && qrCode.data) {
              const scannedText = qrCode.data.trim();
              if (scannedText && scannedText !== lastScannedRaw) {
                lastScannedRaw = scannedText;
                scanCooldown = true;
                handleCheckinScan({ qrData: scannedText });

                window.setTimeout(() => {
                  scanCooldown = false;
                  lastScannedRaw = "";
                }, 2500);
              }
            }
          }
        }, 120);
      }
    } catch (err) {
      setIsCameraActive(false);
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal menyalakan kamera. Pastikan izin kamera telah diberikan.";
      setCameraError(msg);
    }
  }, [facingMode, handleCheckinScan, stopCamera]);

  // Manage camera on tab change
  useEffect(() => {
    if (token && activeTab === "scanner") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [token, activeTab, startCamera, stopCamera]);

  // Logout / Lock Shift
  const handleLogout = () => {
    stopCamera();
    setToken(null);
    if (typeof window !== "undefined" && slug) {
      sessionStorage.removeItem(`reception_token_${slug}`);
    }
  };

  // Filtered guests for manual search
  const filteredGuests = guestList.filter((g) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      g.name.toLowerCase().includes(q) ||
      (g.phoneNumber && g.phoneNumber.includes(q)) ||
      g.slugCode.toLowerCase().includes(q)
    );
  });

  // --------------------------------------------------------------------------
  // SCREEN 1: VERIFIKASI PIN ACARA (JIKA BELUM LOGIN)
  // --------------------------------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-screen bg-[#F3F6FB] flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden animate-in fade-in">
          {/* Top Banner */}
          <div className="bg-slate-900 text-white p-6 text-center space-y-2 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-[#F97316] border border-orange-500/30 flex items-center justify-center mx-auto mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              Portal Meja Tamu &amp; Resepsi
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Invity Wedding Receptionist Desk • by Fasaro
            </p>
            {slug && (
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] text-orange-200 font-mono">
                Acara: {slug}
              </span>
            )}
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5">
            <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/70 text-xs text-orange-950 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Halaman ini khusus untuk panitia penerima tamu &amp; pagar ayu. Masukkan PIN keamanan acara yang diberikan oleh mempelai.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyPin(pinInput);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PIN Keamanan Meja Tamu:
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pinInput}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "");
                    setPinInput(cleaned);
                    setAuthError(null);
                  }}
                  placeholder="Contoh: 123456"
                  maxLength={10}
                  className="w-full px-4 py-3 text-center text-2xl font-mono font-bold tracking-[0.2em] rounded-xl border-2 border-[#E2E8F0] bg-slate-50 text-slate-900 focus:border-[#F97316] focus:bg-white outline-none transition-all shadow-xs"
                  autoFocus
                />
              </div>

              {/* On-screen Numeric Keypad untuk Kemudahan Panitia & Pagar Ayu */}
              <div className="grid grid-cols-3 gap-2 pt-1 select-none">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      if (pinInput.length < 10) {
                        setPinInput((prev) => prev + num);
                        setAuthError(null);
                      }
                    }}
                    className="h-12 rounded-xl bg-slate-50 hover:bg-orange-50 active:bg-orange-100 border border-slate-200 hover:border-orange-300 text-slate-800 hover:text-[#EA580C] text-lg font-bold font-mono transition-all active:scale-95 flex items-center justify-center shadow-2xs cursor-pointer"
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setPinInput("");
                    setAuthError(null);
                  }}
                  className="h-12 rounded-xl bg-slate-100 hover:bg-red-50 active:bg-red-100 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 text-xs font-bold transition-all active:scale-95 flex items-center justify-center shadow-2xs cursor-pointer"
                  title="Hapus Semua"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (pinInput.length < 10) {
                      setPinInput((prev) => prev + "0");
                      setAuthError(null);
                    }
                  }}
                  className="h-12 rounded-xl bg-slate-50 hover:bg-orange-50 active:bg-orange-100 border border-slate-200 hover:border-orange-300 text-slate-800 hover:text-[#EA580C] text-lg font-bold font-mono transition-all active:scale-95 flex items-center justify-center shadow-2xs cursor-pointer"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPinInput((prev) => prev.slice(0, -1));
                    setAuthError(null);
                  }}
                  className="h-12 rounded-xl bg-slate-100 hover:bg-orange-50 active:bg-orange-100 border border-slate-200 hover:border-orange-300 text-slate-600 hover:text-[#EA580C] transition-all active:scale-95 flex items-center justify-center shadow-2xs cursor-pointer"
                  title="Hapus 1 Digit Terakhir"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifyingPin || !pinInput.trim()}
                className="w-full py-3 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isVerifyingPin ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi PIN...</span>
                  </>
                ) : (
                  <>
                    <span>Buka Portal Meja Tamu</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => navigate(`/invitation/${slug}`)}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                Kembali ke Halaman Undangan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SCREEN 2: PORTAL RESEPSIONIS MEJA TAMU (AUTHENTICATED)
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F3F6FB] flex flex-col">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] px-4 py-3 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F97316] border border-orange-200/80 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm text-slate-900 truncate">
                  {coupleName || weddingTitle}
                </h1>
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  Meja Tamu Aktif
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                Pagar Ayu &amp; Resepsionis Hari-H
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                soundEnabled
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
              title={soundEnabled ? "Suara beep aktif" : "Suara beep dimatikan"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
              title="Kunci Layar / Ganti Shift"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5 flex flex-col space-y-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("scanner")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "scanner"
                ? "bg-white text-[#F97316] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Kamera QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "manual"
                ? "bg-white text-[#F97316] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Cari Manual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stats")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "stats"
                ? "bg-white text-[#F97316] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Rekap ({stats.checkedInGuests}/{stats.totalGuests})</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: KAMERA PEMINDAI QR TIKET                                   */}
        {/* ================================================================= */}
        {activeTab === "scanner" && (
          <div className="space-y-4 animate-in fade-in">
            {/* Viewfinder Box */}
            <div className="relative aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700/80 shadow-lg flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Target Framing */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-dashed border-[#F97316]/90 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-[#F97316] rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-[#F97316] rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-[#F97316] rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-[#F97316] rounded-br-lg" />

                  {/* Scanning Laser Line */}
                  <div className="absolute inset-x-2 top-1/2 h-0.5 bg-[#F97316] shadow-[0_0_8px_#F97316] animate-pulse" />
                </div>
              </div>

              {/* Floating Camera Control Buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = facingMode === "environment" ? "user" : "environment";
                    setFacingMode(nextMode);
                  }}
                  className="p-2.5 rounded-full bg-black/60 backdrop-blur-xs text-white border border-white/20 hover:bg-black/80 transition-colors shadow-md cursor-pointer"
                  title="Putar Balik Kamera"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Camera Status Overlay */}
              {!isCameraActive && !cameraError && (
                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-white p-4 space-y-2 z-10">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#F97316]" />
                  <p className="text-xs font-semibold">Mengaktifkan kamera pemindai...</p>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-white p-6 space-y-3 z-10 text-center">
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                  <p className="text-xs text-amber-200 max-w-xs">{cameraError}</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="py-2 px-4 rounded-lg bg-[#F97316] text-white text-xs font-bold cursor-pointer"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}
            </div>

            {/* Scan Result Notice Banner */}
            {lastResult && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm animate-in zoom-in-95 duration-200 ${
                  lastResult.type === "success"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : lastResult.type === "warning"
                    ? "bg-amber-50 border-amber-300 text-amber-950"
                    : "bg-red-50 border-red-300 text-red-950"
                }`}
              >
                {lastResult.type === "success" && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {lastResult.type === "warning" && (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                {lastResult.type === "error" && (
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 space-y-1">
                  <p className="font-bold text-sm leading-snug">{lastResult.message}</p>
                  {lastResult.guest && (
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="font-semibold text-slate-800 bg-white/80 px-2 py-0.5 rounded border border-slate-200/60">
                        {lastResult.guest.name}
                      </span>
                      <span className="bg-white/80 px-2 py-0.5 rounded border border-slate-200/60 text-slate-600 font-bold">
                        {lastResult.guest.quota} Pax
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: PENCARIAN TAMU MANUAL                                      */}
        {/* ================================================================= */}
        {activeTab === "manual" && (
          <div className="space-y-3.5 animate-in fade-in">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama tamu atau nomor WhatsApp..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-slate-900 text-sm focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none shadow-xs"
                autoFocus
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
            </div>

            {/* Guest List */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Daftar Tamu ({filteredGuests.length})</span>
                <button
                  type="button"
                  onClick={fetchGuests}
                  className="text-[#F97316] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingGuests ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {filteredGuests.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                  <p>Tidak ada tamu yang sesuai dengan pencarian.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8F0] max-h-[60vh] overflow-y-auto">
                  {filteredGuests.map((guest) => {
                    const isCheckedIn = Boolean(guest.checkedInAt);
                    const isUpdating = isTogglingCheckin === guest.id;

                    return (
                      <div
                        key={guest.id}
                        className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 truncate">
                              {guest.name}
                            </h4>
                            <span className="shrink-0 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                              {guest.quota} Pax
                            </span>
                          </div>
                          {guest.phoneNumber && (
                            <p className="text-xs text-slate-500 font-mono">
                              {guest.phoneNumber}
                            </p>
                          )}
                          {isCheckedIn && guest.checkedInAt && (
                            <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>
                                Hadir jam{" "}
                                {new Date(guest.checkedInAt).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* Action Check-in Button */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleCheckin(guest, !isCheckedIn)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                            isCheckedIn
                              ? "bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-300"
                              : "bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs"
                          }`}
                        >
                          {isCheckedIn ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                              <span>Hadir</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Check-in</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: RINGKASAN REKAP KEHADIRAN                                  */}
        {/* ================================================================= */}
        {activeTab === "stats" && (
          <div className="space-y-4 animate-in fade-in">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Tamu
                </span>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {stats.totalGuests}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Tamu Hadir
                </span>
                <p className="text-xl font-extrabold text-emerald-800 mt-0.5">
                  {stats.checkedInGuests}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Pax
                </span>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {stats.totalPax}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200 shadow-xs">
                <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-wider block">
                  Pax Hadir
                </span>
                <p className="text-xl font-extrabold text-orange-950 mt-0.5">
                  {stats.checkedInPax}
                </p>
              </div>
            </div>

            {/* Recent Check-ins List */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>10 Tamu Terakhir yang Hadir</span>
                <button
                  type="button"
                  onClick={fetchStats}
                  className="text-[#F97316] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingStats ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {recentCheckins.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Belum ada tamu yang check-in hari ini.
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8F0]">
                  {recentCheckins.map((guest) => (
                    <div
                      key={guest.id}
                      className="px-4 py-3 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{guest.name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                          {guest.quota} Pax
                        </span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {guest.checkedInAt
                          ? new Date(guest.checkedInAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }) + " WIB"
                          : "-"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReceptionPage;

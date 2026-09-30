import React, { useState, useEffect, useId } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  User,
  Globe,
  Tag,
  TreePine,
  ShieldCheck,
  CreditCard,
  Building2,
  Copy,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  LogOut,
  Sparkles,
} from "lucide-react";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: (result: Record<string, unknown>) => void;
          onPending?: (result: Record<string, unknown>) => void;
          onError?: (result: Record<string, unknown>) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

type Tier = "STARTER" | "ELEGANT" | "ULTIMATE";

interface PublicSettings {
  price_starter?: string;
  price_starter_original?: string;
  price_elegant?: string;
  price_elegant_original?: string;
  price_ultimate?: string;
  price_ultimate_original?: string;
  plan_starter_features?: string;
  plan_elegant_features?: string;
  plan_ultimate_features?: string;
  payment_active_mode?: string;
  feature_midtrans_payment?: string;
  feature_manual_payment?: string;
  manual_bank_name?: string;
  manual_account_number?: string;
  manual_account_holder?: string;
  manual_qris_image_url?: string;
  manual_whatsapp_confirmation?: string;
  [key: string]: string | undefined;
}

export default function OrderPage() {
  const navigate = useNavigate();

  // Settings & user state
  const [settings, setSettings] = useState<PublicSettings>({});
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [step, setStep] = useState<"package" | "data">("package");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [selectedTier, setSelectedTier] = useState<Tier>("ELEGANT");
  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [isDateUndecided, setIsDateUndecided] = useState(false);
  const [location, setLocation] = useState("");
  const [domainSlug, setDomainSlug] = useState("");
  const [skipDomain, setSkipDomain] = useState(false);
  const [useCustomDomain, setUseCustomDomain] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [isReferralApplied, setIsReferralApplied] = useState(false);
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [joinOneTree, setJoinOneTree] = useState(false);

  // UI Accordions
  const [isDomainAccordionOpen, setIsDomainAccordionOpen] = useState(false);
  const [isPackageDetailsOpen, setIsPackageDetailsOpen] = useState(false);

  // Payment method: "GATEWAY" (Midtrans) or "MANUAL" (Manual Transfer / QRIS)
  const [paymentMethod, setPaymentMethod] = useState<"GATEWAY" | "MANUAL">("GATEWAY");
  const [manualProofUrl, setManualProofUrl] = useState("");
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [devSimulation, setDevSimulation] = useState<{
    orderId: string;
    amount: number;
    tier: string;
  } | null>(null);

  // Unique IDs for accessibility
  const groomId = useId();
  const brideId = useId();
  const phoneId = useId();
  const dateId = useId();
  const noDateId = useId();
  const locId = useId();
  const domainId = useId();
  const skipDomainId = useId();
  const customDomainId = useId();
  const referralId = useId();
  const oneTreeId = useId();

  // Price calculations
  const priceStarter = parseInt(settings.price_starter || "39000", 10);
  const priceStarterOriginal = parseInt(settings.price_starter_original || "89000", 10);
  const priceElegant = parseInt(settings.price_elegant || "149000", 10);
  const priceElegantOriginal = parseInt(settings.price_elegant_original || "249000", 10);
  const priceUltimate = parseInt(settings.price_ultimate || "279000", 10);
  const priceUltimateOriginal = parseInt(settings.price_ultimate_original || "499000", 10);

  const tierPrices: Record<Tier, number> = {
    STARTER: priceStarter,
    ELEGANT: priceElegant,
    ULTIMATE: priceUltimate,
  };

  const tierOriginalPrices: Record<Tier, number> = {
    STARTER: priceStarterOriginal,
    ELEGANT: priceElegantOriginal,
    ULTIMATE: priceUltimateOriginal,
  };

  const customDomainFee = useCustomDomain ? 150000 : 0;
  const treeDonationFee = joinOneTree ? 10000 : 0;
  const basePackageFee = tierPrices[selectedTier] || 149000;
  const totalPayment = Math.max(0, basePackageFee + customDomainFee + treeDonationFee - referralDiscount);

  // Midtrans Client Key & script loading
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
  const isProduction =
    clientKey.startsWith("Mid-client-") ||
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  const isRealKey = Boolean(clientKey) && !clientKey.includes("YOUR_SANDBOX");

  useEffect(() => {
    const scriptId = "midtrans-snap-script";
    const scriptUrl = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    if (isRealKey && !document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = scriptUrl;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isProduction, clientKey, isRealKey]);

  // Load public settings and existing onboarding draft
  useEffect(() => {
    let isMounted = true;

    async function initData() {
      try {
        const [resSettings, resMe, resState] = await Promise.all([
          fetch("/api/public/settings"),
          fetch("/api/auth/me"),
          fetch("/api/payment/onboarding-state"),
        ]);

        if (resSettings.ok) {
          const jsonSettings = await resSettings.json();
          if (isMounted) setSettings(jsonSettings);
        }

        if (resMe.ok) {
          const jsonMe = await resMe.json();
          if (isMounted && jsonMe.user) {
            setCurrentUser(jsonMe.user);
            if (jsonMe.user.hasActivePackage) {
              navigate("/dashboard", { replace: true });
              return;
            }
          }
        }

        if (resState.ok) {
          const jsonState = await resState.json();
          if (isMounted && jsonState.data) {
            const d = jsonState.data;
            if (d.selectedTier) setSelectedTier(d.selectedTier);
            if (d.groomNickname) setGroomName(d.groomNickname);
            if (d.brideNickname) setBrideName(d.brideNickname);
            if (d.phoneNumber) {
              const clean = d.phoneNumber.replace(/^(\+62|62|0)/, "");
              setPhoneNumber(clean);
            }
            if (d.weddingDate) {
              const formattedDate = new Date(d.weddingDate).toISOString().split("T")[0];
              setWeddingDate(formattedDate);
            }
            if (d.location) setLocation(d.location);
            if (d.slug && !d.slug.startsWith("undangan-")) setDomainSlug(d.slug);
            if (d.referralCode) setReferralCode(d.referralCode);
          }
        }
      } catch (err) {
        console.error("Gagal memuat konfigurasi pesanan:", err);
      } finally {
        if (isMounted) setIsPageLoading(false);
      }
    }

    initData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Auto-generate domain recommendations based on names
  const cleanGroom = groomName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanBride = brideName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const domainRecommendations = [
    cleanGroom && cleanBride ? `${cleanGroom}-${cleanBride}` : "",
    cleanBride && cleanGroom ? `${cleanBride}-${cleanGroom}` : "",
    cleanGroom && cleanBride ? `wedding-${cleanGroom}-${cleanBride}` : "",
    cleanGroom && cleanBride ? `${cleanGroom}-${cleanBride}-story` : "",
  ].filter(Boolean);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  // Check referral code
  const handleCheckReferral = () => {
    const clean = referralCode.trim().toUpperCase();
    if (!clean) {
      setErrorMsg("Masukkan kode referral terlebih dahulu.");
      return;
    }

    if (clean === "FASAROHEMAT" || clean === "HEMAT10" || clean === "FASAROVIP") {
      setIsReferralApplied(true);
      setReferralDiscount(10000);
      setErrorMsg(null);
      setSuccessMsg(`Kode referral "${clean}" berhasil digunakan! Diskon Rp 10.000 diterapkan.`);
    } else {
      setErrorMsg("Kode referral tidak valid atau telah kedaluwarsa.");
      setIsReferralApplied(false);
      setReferralDiscount(0);
    }
  };

  // Upload proof of manual transfer
  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Format file harus berupa gambar (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran file bukti bayar maksimal 5 MB.");
      return;
    }

    setIsUploadingProof(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/payment-proof", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal mengunggah bukti transfer.");
      }

      setManualProofUrl(json.url || json.data?.url || "");
      setSuccessMsg("Bukti transfer berhasil diunggah!");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan unggah bukti.");
    } finally {
      setIsUploadingProof(false);
    }
  };

  // Handle Order Submit
  const handleOrderSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    const cleanGroomNickname = groomName.trim();
    const cleanBrideNickname = brideName.trim();

    if (!cleanGroomNickname) {
      setErrorMsg("Nama panggilan mempelai pria wajib diisi.");
      return;
    }
    if (cleanGroomNickname.length > 10) {
      setErrorMsg("Nama panggilan mempelai pria maksimal 10 karakter.");
      return;
    }
    if (!cleanBrideNickname) {
      setErrorMsg("Nama panggilan mempelai wanita wajib diisi.");
      return;
    }
    if (cleanBrideNickname.length > 10) {
      setErrorMsg("Nama panggilan mempelai wanita maksimal 10 karakter.");
      return;
    }

    const cleanPhoneDigits = phoneNumber.replace(/[^0-9]/g, "");
    if (!cleanPhoneDigits || cleanPhoneDigits.length < 8) {
      setErrorMsg("Nomor WhatsApp belum valid (minimal 8 digit angka).");
      return;
    }

    if (!isDateUndecided && !weddingDate) {
      setErrorMsg("Pilih tanggal pernikahan atau centang 'Belum ada tanggal dan waktu pasti'.");
      return;
    }

    if (!skipDomain && domainSlug.trim().length > 0 && domainSlug.trim().length < 3) {
      setErrorMsg("Tautan domain minimal 3 karakter.");
      return;
    }

    if (paymentMethod === "MANUAL" && !manualProofUrl) {
      setErrorMsg("Mohon unggah bukti transfer pembayaran manual terlebih dahulu.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Save onboarding personal data
      const setupRes = await fetch("/api/payment/onboarding-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          groomName: cleanGroomNickname,
          brideName: cleanBrideNickname,
          phoneNumber: `+62${cleanPhoneDigits}`,
          weddingDate: isDateUndecided ? null : weddingDate,
          isDateUndecided,
          location: location.trim(),
          slug: skipDomain ? "" : domainSlug.trim(),
          referralCode: isReferralApplied ? referralCode.trim() : undefined,
        }),
      });

      const setupJson = await setupRes.json();
      if (!setupRes.ok) {
        throw new Error(setupJson.error || "Gagal menyimpan data mempelai.");
      }

      const invitationId = setupJson.data?.invitationId;

      // 2. Process Payment
      if (paymentMethod === "GATEWAY") {
        const orderRes = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invitationId,
            tier: selectedTier,
            amount: totalPayment,
            paymentType: "GATEWAY",
          }),
        });

        const orderJson = await orderRes.json();
        if (!orderRes.ok) {
          throw new Error(orderJson.error || "Gagal membuat pesanan pembayaran.");
        }

        const snapToken = orderJson.data?.snapToken;
        const orderId = orderJson.data?.orderId;
        const redirectUrl = orderJson.data?.redirectUrl;

        // Dev mode simulation state
        if (!isProduction || !isRealKey) {
          setDevSimulation({
            orderId,
            amount: totalPayment,
            tier: selectedTier,
          });
        }

        if (window.snap && snapToken) {
          window.snap.pay(snapToken, {
            onSuccess: () => {
              setSuccessMsg(`Pembayaran pesanan #${orderId} berhasil! Mengalihkan ke dashboard...`);
              setTimeout(() => {
                navigate("/dashboard");
              }, 1500);
            },
            onPending: () => {
              setSuccessMsg(`Pesanan #${orderId} telah dibuat. Menunggu penyelesaian pembayaran.`);
            },
            onError: () => {
              setErrorMsg("Pembayaran dibatalkan atau gagal.");
            },
            onClose: () => {
              // Dialog closed
            },
          });
        } else if (redirectUrl && isProduction && isRealKey) {
          window.location.href = redirectUrl;
        }
      } else {
        // Manual Transfer Submission
        const manualOrderRes = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invitationId,
            tier: selectedTier,
            amount: totalPayment,
            paymentType: "MANUAL_BANK",
            proofImageUrl: manualProofUrl,
          }),
        });

        const manualJson = await manualOrderRes.json();
        if (!manualOrderRes.ok) {
          throw new Error(manualJson.error || "Gagal mengirimkan bukti transfer.");
        }

        const orderId = manualJson.data?.orderId || "FSR-ORDER";
        setSuccessMsg(
          `Pesanan #${orderId} berhasil dikirim! Bukti transfer sedang diverifikasi oleh Tim Fasaro. Anda dapat memeriksa statusnya secara berkala.`
        );
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setIsLoading(false);
    }
  };

  // Dev simulation callback
  const handleSimulateDevSettlement = async () => {
    if (!devSimulation) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/payment/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: devSimulation.orderId,
          transaction_status: "settlement",
          fraud_status: "accept",
          status_code: "200",
        }),
      });

      if (!res.ok) {
        throw new Error("Simulasi gagal.");
      }

      setSuccessMsg(`Simulasi pembayaran sukses untuk #${devSimulation.orderId}! Mengalihkan ke dashboard...`);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Simulasi gagal dijalankan.");
    } finally {
      setIsLoading(false);
    }
  };

  // Copy bank account helper
  const handleCopyBank = () => {
    const acc = settings.manual_account_number || "8291039481";
    navigator.clipboard.writeText(acc);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const starterFeatures = (settings.plan_starter_features || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean) || [
    "1 Pilihan Tema Minimalist",
    "Masa Aktif 90 Hari",
    "Galeri hingga 10 Foto",
    "Amplop Digital (2 Rekening)",
    "Buku Ucapan & Doa",
    "Navigasi Google Maps",
  ];

  const elegantFeatures = (settings.plan_elegant_features || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean) || [
    "Akses Bebas ke Seluruh Tema Desain",
    "Ganti Tema 1-Klik Kapan Saja",
    "Masa Aktif 365 Hari (1 Tahun)",
    "Galeri Foto HD Tanpa Batas (WebP)",
    "Musik Latar Autoplay & Playlist Kustom",
    "Amplop Digital Tanpa Batas & QRIS",
    "Fitur Buku Tamu RSVP Realtime",
  ];

  const ultimateFeatures = (settings.plan_ultimate_features || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean) || [
    "Seluruh Fitur Paket Elegant",
    "Masa Aktif Selamanya (Lifetime)",
    "QR Code Check-in Meja Tamu",
    "WhatsApp Blast Generator Tamu",
    "Love Story Timeline Interaktif",
    "Prioritas Verifikasi Kilat 10 Menit",
    "Dukungan WhatsApp Prioritas VIP",
  ];

  const tierFeatureMap: Record<Tier, string[]> = {
    STARTER: starterFeatures.length ? starterFeatures : ["1 Pilihan Tema Minimalist", "Masa Aktif 90 Hari", "Galeri 10 Foto"],
    ELEGANT: elegantFeatures.length ? elegantFeatures : ["Akses Bebas Seluruh Tema", "Masa Aktif 365 Hari", "Galeri Tanpa Batas"],
    ULTIMATE: ultimateFeatures.length ? ultimateFeatures : ["Seluruh Fitur Paket Elegant", "Masa Aktif Selamanya", "QR Code Check-in Tamu"],
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[#F3F6FB] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Memuat formulir pemesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F6FB] text-slate-900 pb-20">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-slate-900 font-serif">
              Fasaro<span className="text-orange-500">.</span>
            </span>
            <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />
            <span className="hidden sm:inline-block text-xs font-medium text-slate-500">
              Pemesanan & Aktivasi Paket
            </span>
          </div>

          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="text-right hidden md:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser.name || currentUser.email}
                </p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stepper Progress Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-orange-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: step === "package" ? "50%" : "100%" }}
            />

            {/* Step 1 Indicator */}
            <button
              onClick={() => setStep("package")}
              className="relative z-10 flex items-center gap-2 bg-white px-2 cursor-pointer group focus:outline-none"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === "data"
                    ? "bg-orange-500 text-white"
                    : "bg-orange-500 text-white ring-4 ring-orange-100"
                }`}
              >
                {step === "data" ? <Check className="w-3.5 h-3.5" /> : "1"}
              </div>
              <span
                className={`text-xs font-semibold ${
                  step === "package" ? "text-orange-600" : "text-slate-700"
                }`}
              >
                Select Package
              </span>
            </button>

            {/* Step 2 Indicator */}
            <div className="relative z-10 flex items-center gap-2 bg-white px-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === "data"
                    ? "bg-orange-500 text-white ring-4 ring-orange-100"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                2
              </div>
              <span
                className={`text-xs font-semibold ${
                  step === "data" ? "text-orange-600" : "text-slate-400"
                }`}
              >
                Personal Data
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 pt-8">
        {/* Messages */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Terjadi Kesalahan</p>
              <p className="text-xs text-red-700 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Berhasil</p>
              <p className="text-xs text-emerald-700 mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {/* STEP 1: SELECT PACKAGE */}
        {step === "package" && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Pilih Paket Undangan Digital Anda
              </h1>
              <p className="text-sm text-slate-600 max-w-xl mx-auto">
                Silakan pilih paket yang sesuai kebutuhan resepsi Anda. Setelah memilih, Anda dapat
                langsung mengisi ringkasan data mempelai dan menyelesaikan pembayaran.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Card Starter */}
              <div
                className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                  selectedTier === "STARTER"
                    ? "border-orange-500 ring-2 ring-orange-500/20 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700 mb-3">
                    Entry Tier
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Paket Starter</h3>
                  <p className="text-xs text-slate-500 mt-1">Untuk syukuran intim & keluarga.</p>

                  <div className="mt-4 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-slate-900">
                        Rp {priceStarter.toLocaleString("id-ID")}
                      </span>
                      {priceStarterOriginal > priceStarter && (
                        <span className="text-xs text-slate-400 line-through">
                          Rp {priceStarterOriginal.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">Masa Aktif 90 Hari</span>
                  </div>

                  <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
                    {starterFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setSelectedTier("STARTER");
                    setStep("data");
                  }}
                  className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    selectedTier === "STARTER"
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  Pilih Paket Starter
                </button>
              </div>

              {/* Card Elegant (Recommended) */}
              <div
                className={`bg-white rounded-2xl p-6 border-2 relative transition-all flex flex-col justify-between shadow-md ${
                  selectedTier === "ELEGANT"
                    ? "border-orange-500 ring-4 ring-orange-500/10"
                    : "border-orange-400 hover:border-orange-500"
                }`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Paling Diminati</span>
                </div>

                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-orange-100 text-orange-700 mb-3 mt-1">
                    Best Value
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Paket Elegant</h3>
                  <p className="text-xs text-slate-500 mt-1">Pilihan favorit untuk resepsi lengkap.</p>

                  <div className="mt-4 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-orange-600">
                        Rp {priceElegant.toLocaleString("id-ID")}
                      </span>
                      {priceElegantOriginal > priceElegant && (
                        <span className="text-xs text-slate-400 line-through">
                          Rp {priceElegantOriginal.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">Masa Aktif 365 Hari (1 Tahun Penuh)</span>
                  </div>

                  <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
                    {elegantFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span className="font-medium text-slate-700">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setSelectedTier("ELEGANT");
                    setStep("data");
                  }}
                  className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all cursor-pointer"
                >
                  Pilih Paket Elegant
                </button>
              </div>

              {/* Card Ultimate */}
              <div
                className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                  selectedTier === "ULTIMATE"
                    ? "border-orange-500 ring-2 ring-orange-500/20 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800 mb-3">
                    VIP Hari-H
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Paket Ultimate</h3>
                  <p className="text-xs text-slate-500 mt-1">Fitur terlengkap & masa aktif selamanya.</p>

                  <div className="mt-4 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-slate-900">
                        Rp {priceUltimate.toLocaleString("id-ID")}
                      </span>
                      {priceUltimateOriginal > priceUltimate && (
                        <span className="text-xs text-slate-400 line-through">
                          Rp {priceUltimateOriginal.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">Masa Aktif Selamanya (Lifetime)</span>
                  </div>

                  <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
                    {ultimateFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setSelectedTier("ULTIMATE");
                    setStep("data");
                  }}
                  className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    selectedTier === "ULTIMATE"
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  Pilih Paket Ultimate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PERSONAL DATA & ORDER DETAILS */}
        {step === "data" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* CARD 01/03: Couple's Information */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                <div>
                  <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    FILL IN DATA <span className="text-orange-500">01/03</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 font-serif mt-1">
                    Couple&apos;s Information
                  </h2>
                </div>

                {/* Groom's Name */}
                <div className="space-y-1.5">
                  <label htmlFor={groomId} className="block text-xs font-semibold text-slate-700">
                    Groom&apos;s Name
                  </label>
                  <input
                    id={groomId}
                    type="text"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value.slice(0, 10))}
                    placeholder="Nama Mempelai Pria"
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all text-slate-900"
                  />
                  <p className="text-[11px] text-slate-400">Nickname. Max 10 Characters</p>
                </div>

                {/* Bride's Name */}
                <div className="space-y-1.5">
                  <label htmlFor={brideId} className="block text-xs font-semibold text-slate-700">
                    Bride&apos;s Name
                  </label>
                  <input
                    id={brideId}
                    type="text"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value.slice(0, 10))}
                    placeholder="Nama Mempelai Wanita"
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all text-slate-900"
                  />
                  <p className="text-[11px] text-slate-400">Nickname. Max 10 Characters</p>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label htmlFor={phoneId} className="block text-xs font-semibold text-slate-700">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 select-none shrink-0">
                      <span>🇮🇩</span>
                      <span>+62</span>
                    </div>
                    <input
                      id={phoneId}
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="81234567890"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all text-slate-900"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Phone Number (WhatsApp Aktif)</p>
                </div>

                {/* Wedding Date and Time */}
                <div className="space-y-2">
                  <label htmlFor={dateId} className="block text-xs font-semibold text-slate-700">
                    Wedding Date and Time
                  </label>
                  <input
                    id={dateId}
                    type="date"
                    disabled={isDateUndecided}
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all text-slate-900 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id={noDateId}
                      type="checkbox"
                      checked={isDateUndecided}
                      onChange={(e) => {
                        setIsDateUndecided(e.target.checked);
                        if (e.target.checked) setWeddingDate("");
                      }}
                      className="w-4 h-4 rounded text-orange-500 border-slate-300 focus:ring-orange-500"
                    />
                    <label htmlFor={noDateId} className="text-xs text-slate-600 select-none cursor-pointer">
                      No date and time decided yet
                    </label>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label htmlFor={locId} className="block text-xs font-semibold text-slate-700">
                    Location
                  </label>
                  <input
                    id={locId}
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: Jakarta / Gedung Pernikahan"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all text-slate-900"
                  />
                </div>
              </div>

              {/* CARD 02/03: Domain */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                <div>
                  <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    FILL IN DATA <span className="text-orange-500">02/03</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 font-serif mt-1">Domain</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Domain creation is used as the link name for your digital invitation website
                  </p>
                </div>

                {/* Domain Input */}
                <div className="space-y-1.5">
                  <label htmlFor={domainId} className="block text-xs font-semibold text-slate-700">
                    Domain Name
                  </label>
                  <div className="flex rounded-xl border border-slate-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10 bg-white overflow-hidden transition-all">
                    <input
                      id={domainId}
                      type="text"
                      disabled={skipDomain}
                      value={domainSlug}
                      onChange={(e) =>
                        setDomainSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "")
                            .slice(0, 30)
                        )
                      }
                      placeholder="nama-domain"
                      className="w-full px-3.5 py-2.5 text-sm bg-transparent focus:outline-none text-slate-900 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <div className="px-3.5 py-2.5 bg-slate-50 text-xs font-semibold text-slate-600 border-l border-slate-200 flex items-center select-none shrink-0">
                      .fasaro.id
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    You can request to change the domain once from Fasaro Admin
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id={skipDomainId}
                      type="checkbox"
                      checked={skipDomain}
                      onChange={(e) => setSkipDomain(e.target.checked)}
                      className="w-4 h-4 rounded text-orange-500 border-slate-300 focus:ring-orange-500"
                    />
                    <label htmlFor={skipDomainId} className="text-xs text-slate-600 select-none cursor-pointer">
                      Skip and enter domain later
                    </label>
                  </div>
                </div>

                {/* Accordion: Need help picking a domain name? */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsDomainAccordionOpen(!isDomainAccordionOpen)}
                    className="w-full px-4 py-3 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-orange-600">
                        Need help picking a domain name?
                      </p>
                      <p className="text-[11px] text-slate-500">Recommended domains for you</p>
                    </div>
                    {isDomainAccordionOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isDomainAccordionOpen && (
                    <div className="p-4 bg-white border-t border-slate-200 space-y-2">
                      <p className="text-xs text-slate-500">
                        Klik salah satu rekomendasi untuk menggunakannya:
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {domainRecommendations.length > 0 ? (
                          domainRecommendations.map((rec, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setDomainSlug(rec);
                                setSkipDomain(false);
                              }}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition-colors cursor-pointer"
                            >
                              {rec}.fasaro.id
                            </button>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            Isi nama mempelai pria & wanita terlebih dahulu untuk melihat rekomendasi.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Domain Option */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                  <input
                    id={customDomainId}
                    type="checkbox"
                    checked={useCustomDomain}
                    onChange={(e) => setUseCustomDomain(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-500 border-slate-300 focus:ring-orange-500 mt-0.5"
                  />
                  <label htmlFor={customDomainId} className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                    Want to use a <strong className="text-slate-900 font-semibold">Custom Domain (.com)</strong>? Just click, and the additional fee (+Rp 150.000) will appear in the payment details section.
                  </label>
                </div>
              </div>

              {/* CARD 03/03: Referral Code & Donation */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                <div>
                  <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    FILL IN DATA <span className="text-orange-500">03/03</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 font-serif mt-1">Referral Code</h2>
                  <p className="text-xs text-slate-500 mt-1">Have a referral code? Enter it here</p>
                </div>

                {/* Referral Row */}
                <div className="flex gap-2">
                  <input
                    id={referralId}
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Referral Code (Contoh: FASAROHEMAT)"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all text-slate-900 uppercase font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={handleCheckReferral}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Check
                  </button>
                </div>

                {isReferralApplied && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Diskon referral Rp 10.000 aktif untuk pesanan Anda.</span>
                  </div>
                )}

                {/* One Wedding One Tree Donation Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <TreePine className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold text-slate-900">One Wedding One Tree</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-lg">
                      Join Fasaro to support LindungiHutan. Your contribution helps preserve the environment through the &ldquo;One Wedding One Tree&rdquo; program.
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <input
                        id={oneTreeId}
                        type="checkbox"
                        checked={joinOneTree}
                        onChange={(e) => setJoinOneTree(e.target.checked)}
                        className="w-4 h-4 rounded text-orange-500 border-slate-300 focus:ring-orange-500"
                      />
                      <label htmlFor={oneTreeId} className="text-xs font-medium text-slate-700 select-none cursor-pointer">
                        Join One Wedding One Tree
                      </label>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-orange-600 shrink-0">
                    Rp 10.000
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Order Summary */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">Order Details</h3>
                  <button
                    type="button"
                    onClick={() => setStep("package")}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer transition-colors"
                  >
                    Upgrade Package
                  </button>
                </div>

                {/* Selected Package Details */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Undangan Digital</p>
                      <p className="text-base font-bold text-orange-600 capitalize">
                        {selectedTier.toLowerCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      {tierOriginalPrices[selectedTier] > tierPrices[selectedTier] && (
                        <p className="text-[11px] text-slate-400 line-through">
                          Rp {tierOriginalPrices[selectedTier].toLocaleString("id-ID")}
                        </p>
                      )}
                      <p className="text-base font-bold text-slate-900">
                        Rp {tierPrices[selectedTier].toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* Accordion: See Package Details */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setIsPackageDetailsOpen(!isPackageDetailsOpen)}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>See Package Details {selectedTier.toLowerCase()}</span>
                      {isPackageDetailsOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {isPackageDetailsOpen && (
                      <ul className="mt-2.5 p-3 rounded-xl bg-slate-50 space-y-1.5 text-[11px] text-slate-600 border border-slate-100">
                        {tierFeatureMap[selectedTier].map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Payment Detail breakdown */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">Payment Detail</h4>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Package</span>
                      <span>Rp {tierPrices[selectedTier].toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Custom Domain</span>
                      <span>Rp {customDomainFee.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Donation</span>
                      <span>Rp {treeDonationFee.toLocaleString("id-ID")}</span>
                    </div>
                    {isReferralApplied && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Diskon Referral</span>
                        <span>-Rp {referralDiscount.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Payment */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Total Payment</span>
                  <span className="text-lg font-extrabold text-orange-600">
                    Rp {totalPayment.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Payment Method Selector */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">Metode Pembayaran</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("GATEWAY")}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                        paymentMethod === "GATEWAY"
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      Otomatis (Midtrans)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("MANUAL")}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                        paymentMethod === "MANUAL"
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      Transfer Manual / QRIS
                    </button>
                  </div>

                  {paymentMethod === "MANUAL" && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                      <div className="space-y-1">
                        <p className="text-[11px] text-slate-500">Rekening Tujuan:</p>
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                          <div>
                            <p className="font-bold text-slate-900">
                              {settings.manual_bank_name || "BCA"} - {settings.manual_account_number || "8291039481"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              a.n. {settings.manual_account_holder || "PT Fasaro Digital"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyBank}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                            title="Salin Nomor Rekening"
                          >
                            {copiedBank ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {settings.manual_qris_image_url && (
                        <div className="text-center p-2 bg-white rounded-lg border border-slate-200">
                          <p className="text-[11px] font-semibold text-slate-700 mb-1">Scan QRIS Fasaro</p>
                          <img
                            src={settings.manual_qris_image_url}
                            alt="QRIS Fasaro"
                            className="w-32 h-32 mx-auto object-contain"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-slate-700">
                          Unggah Bukti Transfer
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadProof}
                          disabled={isUploadingProof}
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                        />
                        {isUploadingProof && (
                          <p className="text-[11px] text-orange-600 animate-pulse">Mengunggah file...</p>
                        )}
                        {manualProofUrl && (
                          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> Bukti transfer terlampir
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary & Secondary Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleOrderSubmit}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Memproses Pesanan...</span>
                      </>
                    ) : (
                      <span>Order Now</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("package")}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                </div>

                {/* Dev Simulation Option in Sandbox */}
                {devSimulation && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
                    <p className="font-semibold text-amber-800">
                      ⚡ Dev Mode: Simulasi Pembayaran Sukses
                    </p>
                    <p className="text-[11px] text-amber-700">
                      Snap token telah di-generate untuk pesanan #{devSimulation.orderId}. Anda dapat
                      langsung mensimulasikan pelunasan (settlement) untuk mengaktifkan paket secara instan.
                    </p>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleSimulateDevSettlement}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Simulasikan Sukses Bayar & Buka Dashboard
                    </button>
                  </div>
                )}
              </div>

              {/* Guarantees Box */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-3 text-xs text-slate-500">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-[11px] leading-relaxed">
                  Transaksi aman & terverifikasi. Seluruh data mempelai dapat diubah dan diperbarui kapan saja melalui Dashboard Fasaro.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

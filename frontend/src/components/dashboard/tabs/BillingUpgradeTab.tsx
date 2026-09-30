"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  CreditCard,
  QrCode,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Upload,
  PhoneCall,
  Building,
  RefreshCw,
  X,
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

interface BillingUpgradeTabProps {
  currentTier: string | null;
  isPaid?: boolean;
  invitationId: string;
  onPaymentSubmitted?: () => void;
}

interface PaymentHistoryItem {
  id: string;
  orderId: string;
  tier: string;
  amount: number;
  paymentType: "GATEWAY" | "MANUAL_QRIS" | "MANUAL_BANK";
  paymentStatus: "PENDING" | "WAITING_VERIFICATION" | "SETTLEMENT" | "EXPIRED" | "CANCELLED";
  proofImageUrl: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

interface DevOrderSimulation {
  orderId: string;
  tier: string;
  amount: number;
  snapToken: string;
  redirectUrl: string;
}

interface PublicSettings {
  payment_active_mode?: string;
  manual_bank_name?: string;
  manual_account_number?: string;
  manual_account_holder?: string;
  manual_whatsapp_confirmation?: string;
  manual_payment_instructions?: string;
  manual_qris_bank_info?: string;
  manual_qris_image_url?: string;
  feature_midtrans_payment?: string;
  feature_manual_payment?: string;
  plan_starter_name?: string;
  plan_starter_desc?: string;
  plan_starter_period?: string;
  plan_starter_badge?: string;
  plan_starter_features?: string;
  plan_elegant_name?: string;
  plan_elegant_desc?: string;
  plan_elegant_period?: string;
  plan_elegant_badge?: string;
  plan_elegant_features?: string;
  plan_ultimate_name?: string;
  plan_ultimate_desc?: string;
  plan_ultimate_period?: string;
  plan_ultimate_badge?: string;
  plan_ultimate_features?: string;
}

export const BillingUpgradeTab: React.FC<BillingUpgradeTabProps> = ({
  currentTier,
  isPaid = false,
  invitationId,
  onPaymentSubmitted,
}) => {
  const [settings, setSettings] = useState<PublicSettings>({
    payment_active_mode: "MANUAL_ONLY",
    manual_bank_name: "BCA",
    manual_account_number: "8291039481",
    manual_account_holder: "PT Fasaro Digital",
    manual_whatsapp_confirmation: "085716697416",
    manual_payment_instructions:
      "Transfer sesuai nominal paket ke rekening di atas. Setelah transfer, upload bukti transfer di form ini atau kirimkan konfirmasi via WhatsApp agar paket Anda segera diaktifkan.",
    manual_qris_image_url: "",
    feature_midtrans_payment: "false",
    feature_manual_payment: "true",
  });

  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [selectedManualTier, setSelectedManualTier] = useState<
    "STARTER" | "ELEGANT" | "ULTIMATE" | null
  >(null);

  const manualTier: "STARTER" | "ELEGANT" | "ULTIMATE" =
    selectedManualTier ??
    (currentTier && ["STARTER", "ELEGANT", "ULTIMATE"].includes(currentTier)
      ? (currentTier as "STARTER" | "ELEGANT" | "ULTIMATE")
      : "STARTER");

  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [activeMidtransTier, setActiveMidtransTier] = useState<string | null>(null);
  const [activePaymentMethodTab, setActivePaymentMethodTab] = useState<"MANUAL" | "GATEWAY">(
    "MANUAL"
  );

  const hasValidQris = Boolean(
    settings.manual_qris_image_url &&
      settings.manual_qris_image_url.trim() !== "" &&
      !settings.manual_qris_image_url.includes("FASARO-DEMO-QRIS") &&
      !settings.manual_qris_image_url.includes("create-qr-code")
  );
  const [devSimulation, setDevSimulation] = useState<DevOrderSimulation | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [lastOrderSubmitted, setLastOrderSubmitted] = useState<{
    orderId: string;
    tier: string;
    amount: number;
  } | null>(null);


  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [previewProof, setPreviewProof] = useState<string | null>(null);


  // Fetch public settings on mount
  useEffect(() => {
    let ignore = false;
    fetch("/api/public/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!ignore && json?.data) {
          setSettings((prev) => ({ ...prev, ...json.data }));
        }
      })
      .catch(() => {
        // Fallback to default
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Fetch payment history
  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingHistory(true);
    fetch("/api/dashboard/payments")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!ignore && json?.transactions) {
          setPaymentHistory(json.transactions);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setIsLoadingHistory(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
  const isProduction =
    clientKey.startsWith("Mid-client-") ||
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  const isRealKey = Boolean(clientKey) && !clientKey.includes("YOUR_SANDBOX");

  // Determine active mode
  const paymentMode = settings.payment_active_mode || "MANUAL_ONLY";
  const isGatewayEnabled =
    paymentMode === "GATEWAY_ONLY" ||
    (paymentMode === "BOTH" && settings.feature_midtrans_payment !== "false");
  const isManualEnabled =
    paymentMode === "MANUAL_ONLY" ||
    (paymentMode === "BOTH" && settings.feature_manual_payment !== "false");

  // Load Midtrans Snap script only if gateway is enabled
  useEffect(() => {
    if (!isGatewayEnabled) return;
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
  }, [isProduction, clientKey, isRealKey, isGatewayEnabled]);

  const starterFeatures = settings.plan_starter_features
    ? settings.plan_starter_features.split("\n").map((l) => l.trim()).filter(Boolean)
    : [
        "1 Pilihan Tema Minimalist",
        "Masa Aktif 90 Hari",
        "Galeri Foto hingga 10 Foto",
        "Buku Ucapan & Doa",
        "Navigasi Google Maps",
        "Amplop Digital (Hingga 2 Rekening)",
      ];

  const elegantFeatures = settings.plan_elegant_features
    ? settings.plan_elegant_features.split("\n").map((l) => l.trim()).filter(Boolean)
    : [
        "Akses Bebas ke Seluruh Tema Desain",
        "Ganti Tema 1-Klik Kapan Saja",
        "Masa Aktif 365 Hari",
        "Galeri Foto HD Tanpa Batas (WebP)",
        "Fitur Amplop Digital (Bebas Rekening + Upload QRIS Donasi)",
        "Buku Tamu & RSVP Realtime + Confetti",
        "Sinkronisasi Google Calendar Tamu",
        "Background Musik Autoplay",
      ];

  const ultimateFeatures = settings.plan_ultimate_features
    ? settings.plan_ultimate_features.split("\n").map((l) => l.trim()).filter(Boolean)
    : [
        "Seluruh Fitur Paket Elegant",
        "Masa Aktif Selamanya (Lifetime)",
        "Sistem QR Code Check-in Meja Tamu",
        "WhatsApp Blast Gateway Generator",
        "Story / Love Story Timeline Kustom",
        "Prioritas Verifikasi Kilat 10 Menit",
      ];

  const plans = [
    {
      id: "STARTER",
      name: settings.plan_starter_name || "Paket Starter",
      originalPrice: "Rp 89.000",
      price: "Rp 39.000",
      rawAmount: 39000,
      period: settings.plan_starter_period || "Masa Aktif 90 Hari",
      desc: settings.plan_starter_desc || "Cocok untuk acara akad / syukuran intim keluarga.",
      features: starterFeatures,
    },
    {
      id: "ELEGANT",
      name: settings.plan_elegant_name || "Paket Elegant",
      originalPrice: "Rp 249.000",
      price: "Rp 149.000",
      rawAmount: 149000,
      period: settings.plan_elegant_period || "Masa Aktif 1 Tahun Penuh (365 Hari)",
      desc: settings.plan_elegant_desc || "Pilihan terbaik untuk resepsi pernikahan lengkap & modern.",
      popular: true,
      features: elegantFeatures,
    },
    {
      id: "ULTIMATE",
      name: settings.plan_ultimate_name || "Paket Ultimate Event Day",
      originalPrice: "Rp 499.000",
      price: "Rp 279.000",
      rawAmount: 279000,
      period: settings.plan_ultimate_period || "Masa Aktif Selamanya (Lifetime)",
      desc: settings.plan_ultimate_desc || "Solusi lengkap hari-H dengan sistem check-in VIP resepsi.",
      features: ultimateFeatures,
    },
  ];

  const amountMap: Record<string, number> = {
    STARTER: 39000,
    ELEGANT: 149000,
    ULTIMATE: 279000,
  };

  const handleCopyAccount = () => {
    const accNum = settings.manual_account_number || "8291039481";
    navigator.clipboard.writeText(accNum);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        throw new Error(json.error || "Gagal mengunggah gambar bukti");
      }

      setPaymentProofUrl(json.url);
      setSuccessMsg("Bukti transfer berhasil diunggah! Silakan kirimkan konfirmasi di bawah.");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengunggah file bukti pembayaran");
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleMidtransPayment = async (tier: string, amount: number) => {
    setActiveMidtransTier(tier);
    setErrorMsg(null);
    setDevSimulation(null);

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: invitationId || undefined,
          tier,
          amount,
          paymentType: "GATEWAY",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal membuat transaksi Midtrans");
      }

      const snapToken = json.data?.snapToken;
      const orderId = json.data?.orderId;
      const redirectUrl = json.data?.redirectUrl;

      if (!isProduction || !isRealKey) {
        setDevSimulation({
          orderId,
          tier,
          amount,
          snapToken,
          redirectUrl,
        });
      }

      if (window.snap && snapToken) {
        window.snap.pay(snapToken, {
          onSuccess: () => {
            setSuccessMsg(`Pembayaran pesanan #${orderId} berhasil! Paket Anda segera aktif.`);
            setDevSimulation(null);
            if (onPaymentSubmitted) onPaymentSubmitted();
          },
          onPending: () => {
            setSuccessMsg(
              `Pesanan #${orderId} sedang diproses. Silakan selesaikan pembayaran sesuai instruksi.`
            );
          },
          onError: () => {
            setErrorMsg("Pembayaran gagal atau dibatalkan oleh pengguna.");
          },
          onClose: () => {
            // Popup closed by user
          },
        });
      } else if (redirectUrl && !devSimulation) {
        window.open(redirectUrl, "_blank");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pesanan");
    } finally {
      setActiveMidtransTier(null);
    }
  };

  const handleSimulateDevSettlement = async (orderId: string) => {
    setIsSimulating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/payment/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          transaction_status: "settlement",
          fraud_status: "accept",
          status_code: "200",
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal mensimulasikan settlement");
      }

      setSuccessMsg(`Simulasi pembayaran sukses untuk #${orderId}! Paket berhasil diaktifkan.`);
      setDevSimulation(null);
      if (onPaymentSubmitted) onPaymentSubmitted();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Simulasi gagal");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSubmitManualProof = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!paymentProofUrl.trim()) {
      setErrorMsg("Mohon unggah file bukti transfer atau masukkan URL bukti bayar terlebih dahulu.");
      return;
    }

    setIsSubmittingManual(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const targetAmount = amountMap[manualTier] || 39000;
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: invitationId || undefined,
          tier: manualTier,
          amount: targetAmount,
          paymentType: "MANUAL_BANK",
          proofImageUrl: paymentProofUrl.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal mengirimkan bukti transfer");
      }

      const createdOrderId = json.data?.orderId || "FSR-ORDER";
      setLastOrderSubmitted({
        orderId: createdOrderId,
        tier: manualTier,
        amount: targetAmount,
      });

      setSuccessMsg(
        `Bukti transfer untuk pesanan #${createdOrderId} (${manualTier}) berhasil dikirim! Admin akan segera memverifikasi pembayaran Anda.`
      );
      setPaymentProofUrl("");
      if (onPaymentSubmitted) onPaymentSubmitted();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memproses pengiriman bukti transfer");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const getWhatsAppConfirmationUrl = (orderId?: string, tier?: string, amount?: number) => {
    const rawWa = settings.manual_whatsapp_confirmation || "085716697416";
    let cleanWa = rawWa.replace(/[^0-9]/g, "");
    if (cleanWa.startsWith("0")) {
      cleanWa = "62" + cleanWa.slice(1);
    }
    const formattedAmount = (amount || amountMap[manualTier] || 39000).toLocaleString("id-ID");
    const chosenTier = tier || manualTier;
    const refOrderId = orderId || lastOrderSubmitted?.orderId || "TERBARU";

    const msg = `Halo Admin Fasaro, saya sudah melakukan transfer pembayaran untuk pesanan #${refOrderId} paket ${chosenTier} senilai Rp ${formattedAmount}. Mohon segera diverifikasi & diaktifkan ya. Terima kasih!`;
    return `https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <>
    <div className="space-y-6 max-w-5xl">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Status Paket &amp; Tagihan Undangan
            </h2>
            {isPaid ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                Aktif &amp; Terverifikasi
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                {currentTier ? `Paket ${currentTier} (Belum Aktif)` : "Belum Memilih Paket"}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pilih paket yang sesuai untuk mengaktifkan seluruh fitur premium tanpa batas.
          </p>
        </div>

        {paymentMode === "BOTH" && (
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActivePaymentMethodTab("MANUAL")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activePaymentMethodTab === "MANUAL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Transfer Manual {hasValidQris ? "(Bank/QRIS)" : "(Bank)"}
            </button>
            <button
              type="button"
              onClick={() => setActivePaymentMethodTab("GATEWAY")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activePaymentMethodTab === "GATEWAY"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Gateway Otomatis (Midtrans)
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-400 hover:text-rose-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">{successMsg}</div>
            <button
              type="button"
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-400 hover:text-emerald-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick WA Confirmation Button when Order Created */}
          {lastOrderSubmitted && (
            <div className="pt-2 pl-6 flex items-center gap-3">
              <a
                href={getWhatsAppConfirmationUrl(
                  lastOrderSubmitted.orderId,
                  lastOrderSubmitted.tier,
                  lastOrderSubmitted.amount
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Konfirmasi via WhatsApp Sekarang</span>
              </a>
              <span className="text-[11px] text-emerald-700">
                (Kirim bukti transfer langsung ke admin untuk verifikasi cepat)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Dev Simulation Notice (Only when testing Midtrans) */}
      {devSimulation && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Mode Sandbox / Pengujian Midtrans Aktif</span>
          </div>
          <p className="text-xs text-slate-600">
            Token Midtrans Snap:{" "}
            <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">
              {devSimulation.snapToken}
            </code>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isSimulating}
              onClick={() => handleSimulateDevSettlement(devSimulation.orderId)}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSimulating ? "Memproses..." : "✓ Simulasikan Bayar Sukses (Dev)"}
            </button>
            {devSimulation.redirectUrl && (
              <a
                href={devSimulation.redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-700 hover:bg-slate-50 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Buka Sandbox Midtrans</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => {
          const isCurrent = currentTier === p.id;
          const isPendingMidtrans = activeMidtransTier === p.id;
          const isSelectedForManual = manualTier === p.id;

          return (
            <div
              key={p.id}
              className={`rounded-xl bg-white p-5 border flex flex-col justify-between space-y-4 shadow-xs relative transition-all ${
                isSelectedForManual
                  ? "border-2 border-[#F97316] ring-1 ring-orange-200"
                  : p.popular
                  ? "border border-orange-300"
                  : "border-[#E2E8F0]"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#F97316] text-white text-[10px] font-semibold uppercase tracking-wider shadow-xs">
                  Paling Populer
                </span>
              )}

              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                </div>

                <div>
                  {p.originalPrice && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-0.5">
                      <span className="line-through">{p.originalPrice}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Hemat Promo
                      </span>
                    </div>
                  )}
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    {p.price}
                  </span>
                  <p className="text-[11px] text-[#F97316] font-semibold mt-0.5">
                    {p.period}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-[#F97316] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-2">
                {isCurrent && isPaid ? (
                  <div className="w-full py-2.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs text-center border border-emerald-200">
                    ✓ Paket Aktif Anda
                  </div>
                ) : isGatewayEnabled &&
                  (paymentMode === "GATEWAY_ONLY" || activePaymentMethodTab === "GATEWAY") ? (
                  <button
                    type="button"
                    disabled={isPendingMidtrans}
                    onClick={() => handleMidtransPayment(p.id, p.rawAmount)}
                    className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-center transition-colors min-h-[40px] flex items-center justify-center gap-1.5 shadow-xs bg-[#F97316] hover:bg-[#EA580C] text-white cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>
                      {isPendingMidtrans
                        ? "Membuat Pesanan..."
                        : `Bayar via Midtrans (${p.price})`}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedManualTier(p.id as "STARTER" | "ELEGANT" | "ULTIMATE");
                      document
                        .getElementById("manual-payment")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-center transition-colors min-h-[40px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                      isSelectedForManual
                        ? "bg-[#F97316] text-white hover:bg-[#EA580C]"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>
                      {isSelectedForManual
                        ? `✓ Paket ${p.name} Dipilih`
                        : `Pilih & Bayar ${p.name}`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Payment Section (Shown if Manual is enabled and active) */}
      {isManualEnabled &&
        (paymentMode !== "BOTH" || activePaymentMethodTab === "MANUAL") && (
          <div
            id="manual-payment"
            className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    Langkah Pembayaran Manual: Transfer Bank{hasValidQris ? " / QRIS" : ""}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Paket yang dipilih:{" "}
                    <span className="font-bold text-[#F97316]">
                      {plans.find((p) => p.id === manualTier)?.name}
                    </span>{" "}
                    — Total Nominal:{" "}
                    <span className="font-bold text-slate-900">
                      Rp {(amountMap[manualTier] || 39000).toLocaleString("id-ID")}
                    </span>
                  </p>
                </div>
              </div>

              {/* Package Switcher Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Ubah Paket:</span>
                <select
                  value={manualTier}
                  onChange={(e) =>
                    setSelectedManualTier(e.target.value as "STARTER" | "ELEGANT" | "ULTIMATE")
                  }
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 text-xs font-semibold focus:border-[#F97316] outline-none"
                >
                  <option value="STARTER">Starter (Rp 39.000)</option>
                  <option value="ELEGANT">Elegant (Rp 149.000)</option>
                  <option value="ULTIMATE">Ultimate (Rp 279.000)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Kolom 1: Rekening Bank & QRIS */}
              <div className="space-y-4">
                {/* Bank Details Card */}
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-[#F97316]" />
                      <span>Rekening Resmi Transfer Bank</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                      {settings.manual_bank_name || "BCA"}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] text-slate-500">Nomor Rekening:</div>
                      <div className="text-base font-mono font-bold text-slate-900 tracking-wider">
                        {settings.manual_account_number || "8291039481"}
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                        a/n {settings.manual_account_holder || "PT Fasaro Digital"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {copiedAccount ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* QRIS Code Image */}
                  {hasValidQris && (
                    <div className="pt-2 border-t border-slate-200 flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={settings.manual_qris_image_url}
                        alt="QRIS Fasaro"
                        className="w-24 h-24 object-contain rounded-lg border border-[#E2E8F0] bg-white p-1 shrink-0"
                      />
                      <div className="space-y-1 text-xs">
                        <div className="font-bold text-slate-900">QRIS Toko Resmi Fasaro</div>
                        <p className="text-slate-500 text-[11px]">
                          Scan menggunakan GoPay, OVO, Dana, ShopeePay, atau BCA Mobile.
                        </p>
                        <a
                          href={settings.manual_qris_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#F97316] font-semibold hover:underline"
                        >
                          <span>Buka Gambar Penuh</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Instruksi Singkat */}
                <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-100 text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-slate-900 block">Panduan Transfer:</span>
                  <p className="text-[11px] leading-relaxed">
                    {settings.manual_payment_instructions ||
                      `Transfer sesuai nominal paket ke rekening${hasValidQris ? " atau QRIS" : ""} di atas. Setelah transfer, upload bukti transfer di form ini atau kirimkan konfirmasi via WhatsApp agar paket Anda segera diaktifkan.`}
                  </p>
                </div>
              </div>

              {/* Kolom 2: Form Upload Bukti Transfer & WhatsApp CTA */}
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs space-y-4">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#F97316]" />
                    <span>Kirim Bukti Pembayaran</span>
                  </h4>

                  {/* Upload File Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Pilih File Bukti Transfer (Dari HP / Laptop):
                    </label>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#E2E8F0] hover:border-[#F97316] bg-slate-50 hover:bg-orange-50/30 rounded-xl cursor-pointer transition-all">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileUpload}
                        disabled={isUploadingProof}
                        className="hidden"
                      />
                      {isUploadingProof ? (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#F97316]" />
                          <span>Mengunggah bukti transfer...</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                          <div className="text-xs font-medium text-slate-700">
                            Klik untuk pilih file struk/bukti
                          </div>
                          <div className="text-[10px] text-slate-400">
                            JPG, PNG, atau WebP (Maks. 5MB)
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Thumbnail Preview if already uploaded */}
                  {paymentProofUrl && (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={paymentProofUrl}
                          alt="Preview Bukti"
                          className="w-10 h-10 object-cover rounded border border-slate-200"
                        />
                        <div className="truncate text-xs text-slate-700 font-medium">
                          Bukti transfer terunggah
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentProofUrl("")}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-200"
                        title="Hapus / ganti bukti"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Atau Input Link / URL Bukti */}
                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-slate-600 block text-[11px]">
                      Atau tempel Link / URL Bukti Bayar:
                    </label>
                    <input
                      type="text"
                      value={paymentProofUrl}
                      onChange={(e) => setPaymentProofUrl(e.target.value)}
                      placeholder="https://.../bukti-transfer.jpg"
                      className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-900 text-xs min-h-[38px] focus:border-[#F97316] outline-none"
                    />
                  </div>

                  {/* Tombol Kirim Bukti */}
                  <button
                    type="button"
                    onClick={() => handleSubmitManualProof()}
                    disabled={isSubmittingManual || isUploadingProof || !paymentProofUrl.trim()}
                    className="w-full py-3 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-xs disabled:opacity-50 min-h-[44px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmittingManual ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mengirimkan ke Admin...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Kirim Bukti Pembayaran</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Direct WhatsApp Confirmation Box */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <PhoneCall className="w-4 h-4 text-emerald-600" />
                    <span>Butuh Konfirmasi Cepat?</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Setelah melakukan transfer, Anda juga bisa langsung mengirimkan bukti struk ke nomor WhatsApp admin kami agar pesanan langsung diverifikasi dalam hitungan menit.
                  </p>
                  <a
                    href={getWhatsAppConfirmationUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Konfirmasi via WhatsApp Sekarang</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>

      {/* Riwayat Pembayaran */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden mt-4">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Riwayat Pembayaran</h3>
            <p className="text-xs text-slate-500 mt-0.5">Seluruh riwayat transaksi pembayaran paket undangan Anda</p>
          </div>
          <RefreshCw className="w-4 h-4 text-slate-400" />
        </div>
        {isLoadingHistory ? (
          <div className="p-8 text-center text-slate-400 text-sm">Memuat riwayat...</div>
        ) : paymentHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Belum ada transaksi pembayaran.</div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {paymentHistory.map((tx) => (
              <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-slate-500 truncate max-w-[120px]">{tx.orderId}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      tx.tier === "ULTIMATE" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                      tx.tier === "ELEGANT" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                      "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>{tx.tier}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      tx.paymentStatus === "SETTLEMENT" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                      tx.paymentStatus === "WAITING_VERIFICATION" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                      tx.paymentStatus === "EXPIRED" || tx.paymentStatus === "CANCELLED" ? "bg-red-50 text-red-600 border border-red-200" :
                      "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>{tx.paymentStatus === "SETTLEMENT" ? "Lunas" : tx.paymentStatus === "WAITING_VERIFICATION" ? "Menunggu Verifikasi" : tx.paymentStatus === "PENDING" ? "Pending" : tx.paymentStatus === "CANCELLED" ? "Dibatalkan" : "Kadaluarsa"}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span className="text-xs font-semibold text-slate-700">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(tx.amount)}</span>
                    <span className="text-xs text-slate-400">{tx.paymentType === "GATEWAY" ? "Gateway" : tx.paymentType === "MANUAL_QRIS" ? "QRIS" : "Transfer Bank"}</span>
                  </div>
                </div>
                {tx.proofImageUrl && (
                  <button
                    type="button"
                    onClick={() => setPreviewProof(tx.proofImageUrl!)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Lihat Bukti
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proof Preview Modal */}
      {previewProof && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setPreviewProof(null)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-[#E2E8F0]">
              <span className="font-semibold text-sm text-slate-900">Bukti Pembayaran</span>
              <button type="button" onClick={() => setPreviewProof(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewProof} alt="Bukti Pembayaran" className="w-full h-auto max-h-[70vh] object-contain" />
          </div>
        </div>
      )}
    </>
  );
};

export default BillingUpgradeTab;

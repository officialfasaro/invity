"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCw,
  Eye,
  Copy,
  Check,
  LogOut,
  ExternalLink,
  X,
  Lock,
  ArrowRight,
} from "lucide-react";
import GoogleTranslateWidget from "@/components/shared/GoogleTranslateWidget";
import NotificationBell from "@/components/shared/NotificationBell";

interface PaymentOrderData {
  id: string;
  orderId: string;
  tier: string;
  planName: string;
  amount: number;
  paymentType: string;
  paymentMethodName: string;
  paymentStatus: "WAITING_VERIFICATION" | "SETTLEMENT" | "PENDING" | "CANCELLED";
  proofImageUrl?: string | null;
  createdAt: string;
  verifiedAt?: string | null;
  invitationSlug?: string | null;
  activeUntil?: string | null;
}

export const PaymentStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get("orderId") || "";

  const [order, setOrder] = useState<PaymentOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ name?: string | null; email: string } | null>(null);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);

  // Fetch current user info
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUserProfile(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch order status
  const fetchOrderStatus = useCallback(
    async (isManualRefresh: boolean = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      setErrorMsg(null);

      try {
        const endpoint = orderIdParam
          ? `/api/payment/order-status/${encodeURIComponent(orderIdParam)}`
          : "/api/payment/order-status/latest";

        const res = await fetch(endpoint);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Gagal memuat status pesanan");
        }

        if (json?.data) {
          setOrder(json.data);
          if (isManualRefresh) {
            setRefreshToast(
              json.data.paymentStatus === "SETTLEMENT"
                ? "Pembayaran telah terverifikasi!"
                : "Status berhasil diperbarui."
            );
            setTimeout(() => setRefreshToast(null), 3000);
          }
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat status");
      } finally {
        setLoading(false);
        if (isManualRefresh) {
          setTimeout(() => setIsRefreshing(false), 500);
        }
      }
    },
    [orderIdParam]
  );

  useEffect(() => {
    fetchOrderStatus();

    // Auto-polling every 12s if waiting for verification
    const interval = setInterval(() => {
      if (order?.paymentStatus !== "SETTLEMENT") {
        fetchOrderStatus(false);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [fetchOrderStatus, order?.paymentStatus]);

  const handleCopyOrderId = (idToCopy: string) => {
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    navigate("/login");
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // WhatsApp confirmation text
  const waTarget = "6285716697416";
  const waMessage = encodeURIComponent(
    `Halo Admin Invity, saya ingin mengonfirmasi bukti transfer untuk pesanan #${
      order?.orderId || orderIdParam || "FSR"
    } atas nama ${userProfile?.name || userProfile?.email || "Pelanggan Invity"}. Terima kasih!`
  );
  const waLink = `https://wa.me/${waTarget}?text=${waMessage}`;

  const isVerified = order?.paymentStatus === "SETTLEMENT";
  const isWaiting = order?.paymentStatus === "WAITING_VERIFICATION";
  const isCancelled = order?.paymentStatus === "CANCELLED";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F6FB] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-3 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Memuat status pesanan &amp; pembayaran...</p>
        </div>
      </div>
    );
  }

  if (errorMsg && !order) {
    return (
      <div className="min-h-screen bg-[#F3F6FB] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Pesanan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {errorMsg || "Tidak dapat menemukan data pesanan untuk akun ini. Pastikan Anda sudah membuat pesanan."}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              to="/order"
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#F97316] text-white hover:bg-[#EA580C] transition-colors"
            >
              Kembali ke Pemesanan
            </Link>
            <Link
              to="/dashboard"
              className="py-2.5 px-4 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Buka Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentOrderId = order?.orderId || orderIdParam || "FSR-ORDER";

  return (
    <div className="min-h-screen bg-[#F3F6FB] text-slate-900 pb-20">
      {/* 1. Top Navbar (Identik dengan Header Order & Brand Fasaro) */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Section Title */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-baseline gap-1.5 notranslate">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-serif">
                Invity<span className="text-[#F97316]">.</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                by Fasaro
              </span>
            </Link>
            <span className="hidden sm:inline-block h-4 w-px bg-slate-200 ml-1.5" />
            <span className="hidden sm:inline-block text-xs font-medium text-slate-500">
              Pemesanan &amp; Aktivasi Paket
            </span>
          </div>

          {/* Action Tools & User Profile */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <GoogleTranslateWidget />

            {/* Notification Bell */}
            <NotificationBell />

            {/* User Profile */}
            {userProfile && (
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {userProfile.name || userProfile.email}
                </p>
                <p className="text-[11px] text-slate-500">{userProfile.email}</p>
              </div>
            )}

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Stepper Progress Bar (Select Package -> Personal Data) */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-orange-500 -translate-y-1/2 z-0" />

            {/* Step 1: Select Package (Completed) */}
            <div className="relative z-10 flex items-center gap-2 bg-white px-2">
              <div className="w-7 h-7 rounded-none flex items-center justify-center text-xs font-bold bg-[#F97316] text-white">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Select Package</span>
            </div>

            {/* Step 2: Personal Data (Current / Finished) */}
            <div className="relative z-10 flex items-center gap-2 bg-white px-2">
              <div className="w-7 h-7 rounded-none flex items-center justify-center text-xs font-bold bg-[#F97316] text-white ring-4 ring-orange-100">
                2
              </div>
              <span className="text-xs font-semibold text-[#F97316]">Personal Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="max-w-3xl mx-auto px-4 pt-8 sm:pt-10 space-y-6">
        {/* Floating Refresh Toast Feedback */}
        {refreshToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{refreshToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setRefreshToast(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. HERO STATUS CARD (Persis Sesuai Mockup Referensi Pengguna)      */}
        {/* ================================================================= */}
        <section className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 text-center shadow-xs space-y-5">
          {/* Animated Illustration Icon */}
          <div className="flex justify-center">
            {isVerified ? (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
            ) : isCancelled ? (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center text-red-600 shadow-inner">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
            ) : (
              /* Clock with Hourglass Graphic (Sesuai Gambar Referensi) */
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-orange-50/80 border-4 border-orange-100/90 flex items-center justify-center text-[#F97316] shadow-inner">
                <Clock className="w-9 h-9 sm:w-11 sm:h-11" />
                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-orange-200 flex items-center justify-center text-[#F97316] shadow-xs text-xs font-bold">
                  ⏳
                </span>
              </div>
            )}
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-2 max-w-xl mx-auto">
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-slate-900">
              {isVerified
                ? "Pembayaran Berhasil Diverifikasi! 🎉"
                : isCancelled
                ? "Pembayaran Tidak Dapat Diverifikasi"
                : "Pembayaran Sedang Diverifikasi"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isVerified ? (
                <>
                  Selamat! Bukti transfer untuk pesanan{" "}
                  <strong className="text-slate-900 font-mono">#{currentOrderId}</strong> telah disetujui oleh Tim Invity.
                  Paket undangan Anda kini sudah aktif dan dapat langsung diedit di Dashboard.
                </>
              ) : isCancelled ? (
                <>
                  Bukti transfer untuk pesanan{" "}
                  <strong className="text-slate-900 font-mono">#{currentOrderId}</strong> belum sesuai. Silakan unggah
                  ulang bukti transfer yang valid atau hubungi CS kami.
                </>
              ) : (
                <>
                  Terima kasih! Bukti transfer Anda untuk pesanan{" "}
                  <strong className="text-slate-900 font-mono">#{currentOrderId}</strong> telah kami terima dan sedang
                  dicek secara manual oleh Tim Invity. Anda dapat memeriksa statusnya secara berkala.
                </>
              )}
            </p>

            <p className="text-[11px] sm:text-xs text-slate-400 font-medium pt-1">
              {isVerified
                ? "Paket Anda aktif untuk 1 tahun ke depan."
                : "Estimasi proses: 15–30 menit (Jam Operasional: 08.00 - 21.00 WIB)"}
            </p>
          </div>

          {/* Tombol Refresh Status Pembayaran (Requirement Pengguna) */}
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => fetchOrderStatus(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 py-2 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/70 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#F97316] ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Memeriksa Status..." : "Segarkan Status Pembayaran"}</span>
            </button>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 4. DETAIL PESANAN CARD (Dengan Header ID Pesanan Menonjol & Besar) */}
        {/* ================================================================= */}
        <section className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
          {/* Top Dedicated ID Pesanan Section (Besar & Distinct Sesuai Permintaan) */}
          <div className="p-5 sm:p-6 bg-slate-50/90 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-400">
                ID Pesanan
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                  #{currentOrderId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyOrderId(currentOrderId)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                  title="Salin ID Pesanan"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Status Pill on Top Header */}
            <div>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Terverifikasi</span>
                </span>
              ) : isCancelled ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>Ditolak</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Menunggu Konfirmasi</span>
                </span>
              )}
            </div>
          </div>

          {/* Details Table Rows */}
          <div className="p-5 sm:p-6 divide-y divide-[#E2E8F0]/80 text-xs sm:text-sm">
            {/* Paket */}
            <div className="py-3.5 flex items-center justify-between gap-4 first:pt-0">
              <span className="text-slate-500 font-medium">Paket</span>
              <span className="font-bold text-slate-900 text-right">
                {order?.planName || "Paket Promo All-In-One"}
              </span>
            </div>

            {/* Total Pembayaran */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <span className="text-slate-500 font-medium">Total Pembayaran</span>
              <span className="font-bold text-slate-900 text-sm sm:text-base font-mono text-right">
                {formatRupiah(order?.amount || 79000)}
              </span>
            </div>

            {/* Metode Pembayaran */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <span className="text-slate-500 font-medium">Metode Pembayaran</span>
              <span className="font-semibold text-slate-800 text-right">
                {order?.paymentMethodName || "Transfer Manual (BCA)"}
              </span>
            </div>

            {/* Bukti Transfer (Dengan Tombol Preview Sesuai Permintaan) */}
            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <span className="text-slate-500 font-medium">Bukti Transfer</span>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs">
                  <FileText className="w-3.5 h-3.5 text-[#F97316]" />
                  <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">
                    {order?.proofImageUrl ? "bukti-transfer.jpg" : "Bukti Pembayaran"}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">(Sudah Terunggah)</span>
                </div>

                {/* Tombol Preview Bukti Transfer */}
                {order?.proofImageUrl && (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(order.proofImageUrl || null)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-[#F97316] border border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Bukti</span>
                  </button>
                )}
              </div>
            </div>

            {/* Status Pesanan */}
            <div className="py-3.5 flex items-center justify-between gap-4 last:pb-0">
              <span className="text-slate-500 font-medium">Status</span>
              <div>
                {isVerified ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                    Terverifikasi
                  </span>
                ) : isCancelled ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 font-bold text-xs">
                    Dibatalkan / Ditolak
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs">
                    Menunggu Konfirmasi
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 5. ACTION BUTTONS (Masuk Dashboard Aktif HANYA Jika Terverifikasi)  */}
        {/* ================================================================= */}
        <section className="space-y-3">
          {/* Tombol Masuk ke Dashboard */}
          {isVerified ? (
            <Link
              to="/dashboard"
              className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center"
            >
              <div className="flex items-center gap-2">
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </div>
              <span className="text-[11px] text-orange-100 font-normal">
                Pembayaran terverifikasi! Mulai isi data undangan Anda sekarang
              </span>
            </Link>
          ) : (
            <button
              type="button"
              disabled
              title="Tombol ini akan aktif otomatis setelah bukti pembayaran diverifikasi oleh admin."
              className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold bg-slate-200 text-slate-400 border border-slate-300/80 cursor-not-allowed flex flex-col items-center justify-center gap-0.5 select-none"
            >
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Masuk ke Dashboard</span>
              </div>
              <span className="text-[11px] text-slate-500 font-normal">
                Tombol akan aktif otomatis setelah pembayaran terverifikasi
              </span>
            </button>
          )}

          {/* Tombol Konfirmasi Cepat via WhatsApp */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-6 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <span className="text-emerald-600 text-base">💬</span>
            <span>Konfirmasi Cepat via WhatsApp</span>
          </a>
        </section>
      </main>

      {/* ================================================================= */}
      {/* 6. MODAL LIGHTBOX PREVIEW BUKTI TRANSFER (Requirement Pengguna)    */}
      {/* ================================================================= */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-3 p-4 sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F97316]" />
                <h3 className="font-bold text-sm text-slate-900">Preview Bukti Transfer</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Tutup preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Container */}
            <div className="relative max-h-[70vh] overflow-auto bg-slate-100 rounded-xl flex items-center justify-center p-2">
              <img
                src={previewImage}
                alt="Bukti Transfer Pembayaran"
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Pesanan #{currentOrderId}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Tab Baru</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#F97316] text-white hover:bg-[#EA580C] transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatusPage;

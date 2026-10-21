"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

interface VerificationItem {
  id: string;
  orderId: string;
  tier: string;
  amount: number | string;
  paymentType: string;
  paymentStatus: string;
  proofImageUrl?: string | null;
  createdAt: string;
  clientPhone?: string | null;
  groomName?: string;
  brideName?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  invitation?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export default function VerifikasiManualAdminPage() {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModalItem, setActiveModalItem] = useState<VerificationItem | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(
    null
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("WAITING_VERIFICATION");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("ALL");

  const createWhatsAppMessage = (item: VerificationItem) => {
    const coupleName =
      (item.groomName && item.brideName ? `${item.groomName} & ${item.brideName}` : "") ||
      item.user?.name ||
      "Mempelai";
    const formattedAmount = `Rp ${Number(item.amount).toLocaleString("id-ID")}`;
    const invTitle = item.invitation?.title ? ` ("${item.invitation.title}")` : "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const verificationUrl = `${origin}/payment-status?orderId=${encodeURIComponent(item.orderId)}`;

    return (
      `Halo Kak ${coupleName}, salam hangat dari Tim Fasaro Invity.\n\n` +
      `Kami sedang memverifikasi pembayaran untuk pesanan undangan Anda:\n` +
      `• No. Pesanan: ${item.orderId}\n` +
      `• Paket: ${item.tier} (${formattedAmount})${invTitle}\n\n` +
      `Mohon maaf, bukti transfer yang diunggah belum sesuai atau belum terbaca dengan jelas pada sistem kami.\n` +
      `Bolehkah dibantu kirimkan ulang foto bukti transfer yang jelas (menampilkan nominal transfer, tanggal/jam, serta nomor rekening tujuan)?\n\n` +
      `Kakak juga dapat mengecek status verifikasi pembayaran melalui tautan berikut:\n` +
      `${verificationUrl}\n\n` +
      `Terima kasih banyak atas kerja samanya ya Kak`
    );
  };

  const handleChatWhatsApp = (item: VerificationItem) => {
    let phone = item.clientPhone;
    if (!phone || !phone.trim()) {
      const input = window.prompt(
        `Nomor WhatsApp mempelai belum terdata di profil.\nSilakan masukkan nomor WhatsApp untuk ${item.user?.name || "mempelai"}:`,
        ""
      );
      if (!input || !input.trim()) return;
      phone = input.trim();
    }

    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith("8")) {
      cleanPhone = "62" + cleanPhone;
    }

    const message = createWhatsAppMessage(item);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const fetchItems = async (status: string, type: string) => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (type && type !== "ALL") params.set("paymentType", type);

      const res = await fetch(`/api/admin/verify-payment?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  const refreshList = () => {
    fetchItems(statusFilter, paymentTypeFilter);
  };

  useEffect(() => {
    fetchItems(statusFilter, paymentTypeFilter);
  }, [statusFilter, paymentTypeFilter]);

  const handleAction = async (transactionId: string, action: "APPROVE" | "REJECT") => {
    setProcessingId(transactionId);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, action }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal memproses aksi verifikasi");
      }

      setFeedback({
        type: "success",
        msg:
          action === "APPROVE"
            ? "Transaksi berhasil disetujui & undangan diaktifkan 365 hari!"
            : "Transaksi berhasil ditolak.",
      });

      setItems((prev) =>
        prev
          .map((item) =>
            item.id === transactionId
              ? {
                  ...item,
                  paymentStatus: action === "APPROVE" ? "SETTLEMENT" : "CANCELLED",
                }
              : item
          )
          .filter((item) => (statusFilter === "WAITING_VERIFICATION" ? item.id !== transactionId : true))
      );
    } catch (err) {
      setFeedback({
        type: "error",
        msg: err instanceof Error ? err.message : "Terjadi kesalahan",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Instant multi-field client-side search
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const orderId = (item.orderId || "").toLowerCase();
      const userName = (item.user?.name || "").toLowerCase();
      const userEmail = (item.user?.email || "").toLowerCase();
      const phone = (item.clientPhone || "").toLowerCase();
      const groom = (item.groomName || "").toLowerCase();
      const bride = (item.brideName || "").toLowerCase();
      const invTitle = (item.invitation?.title || "").toLowerCase();
      const invSlug = (item.invitation?.slug || "").toLowerCase();
      const tier = (item.tier || "").toLowerCase();
      const paymentType = (item.paymentType || "").toLowerCase();
      const amountStr = String(item.amount || "");

      return (
        orderId.includes(q) ||
        userName.includes(q) ||
        userEmail.includes(q) ||
        phone.includes(q) ||
        groom.includes(q) ||
        bride.includes(q) ||
        invTitle.includes(q) ||
        invSlug.includes(q) ||
        tier.includes(q) ||
        paymentType.includes(q) ||
        amountStr.includes(q)
      );
    });
  }, [items, searchQuery]);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("WAITING_VERIFICATION");
    setPaymentTypeFilter("ALL");
  };

  return (
    <div className="min-h-screen bg-[#F3F6FB] text-slate-900 py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-orange-50 text-[#F97316] border border-orange-100 text-[11px] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verifikasi Manual</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Verifikasi Pembayaran QRIS & Transfer Bank
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Validasi bukti transfer pengguna untuk mengaktifkan status undangan &amp; masa berlaku paket.
            </p>
          </div>

          <button
            onClick={refreshList}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold border border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Muat Ulang</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan Order ID (FSR-...), nama, email, no HP, judul undangan, paket..."
                className="w-full pl-10 pr-9 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-1 focus:ring-[#F97316] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Hapus kata kunci pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-lg border border-[#E2E8F0] bg-white text-slate-700 font-medium focus:outline-none focus:border-[#F97316] shadow-xs cursor-pointer"
              >
                <option value="WAITING_VERIFICATION">Menunggu Verifikasi (Pending)</option>
                <option value="SETTLEMENT">Sudah Disetujui (Settlement)</option>
                <option value="CANCELLED">Ditolak / Batal (Cancelled)</option>
                <option value="ALL">Semua Status</option>
              </select>

              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-lg border border-[#E2E8F0] bg-white text-slate-700 font-medium focus:outline-none focus:border-[#F97316] shadow-xs cursor-pointer"
              >
                <option value="ALL">Semua Metode Manual</option>
                <option value="MANUAL_BANK">Transfer Bank</option>
                <option value="MANUAL_QRIS">QRIS Manual</option>
              </select>
            </div>
          </div>

          {/* Results Summary & Clear Button */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <div>
              Menampilkan <span className="font-bold text-slate-800">{filteredItems.length}</span> transaksi manual
              {searchQuery && (
                <span>
                  {" "}
                  untuk pencarian &quot;<strong className="text-slate-800">{searchQuery}</strong>&quot;
                </span>
              )}
            </div>
            {(searchQuery || statusFilter !== "WAITING_VERIFICATION" || paymentTypeFilter !== "ALL") && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[#F97316] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Reset Filter &amp; Pencarian</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Order ID &amp; Waktu</th>
                  <th className="py-3.5 px-5">Pengguna &amp; Undangan</th>
                  <th className="py-3.5 px-5">Paket &amp; Nominal</th>
                  <th className="py-3.5 px-5">Bukti Transfer</th>
                  <th className="py-3.5 px-5 text-right">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Memuat antrean verifikasi...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                        <AlertCircle className="w-6 h-6 text-slate-300" />
                        <p className="text-xs font-medium text-slate-600">
                          {searchQuery
                            ? `Tidak ada transaksi yang cocok dengan pencarian "${searchQuery}".`
                            : "Tidak ada antrean pembayaran manual yang ditemukan."}
                        </p>
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="text-xs font-semibold text-[#F97316] hover:underline cursor-pointer"
                          >
                            Hapus kata kunci pencarian
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-5 align-top">
                        <span className="font-mono font-semibold text-slate-900">
                          {item.orderId}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(item.createdAt).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded bg-orange-50 text-[#F97316] font-semibold text-[10px] border border-orange-100">
                            {item.paymentType}
                          </span>
                          {item.paymentStatus !== "WAITING_VERIFICATION" && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                item.paymentStatus === "SETTLEMENT"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : item.paymentStatus === "CANCELLED"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {item.paymentStatus === "SETTLEMENT"
                                ? "Sukses"
                                : item.paymentStatus === "CANCELLED"
                                ? "Batal"
                                : item.paymentStatus}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-5 align-top">
                        <p className="font-semibold text-slate-900">
                          {item.user?.name || "User"}
                        </p>
                        <p className="text-slate-500 text-[11px]">{item.user?.email}</p>
                        {item.clientPhone && (
                          <button
                            type="button"
                            onClick={() => handleChatWhatsApp(item)}
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 hover:underline font-medium mt-0.5 cursor-pointer"
                            title="Klik untuk chat WhatsApp mempelai"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{item.clientPhone}</span>
                          </button>
                        )}
                        {item.invitation && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#F97316]">
                            <span className="font-medium">{item.invitation.title}</span>
                            <a
                              href={`/invitation/${item.invitation.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-5 align-top">
                        <span className="font-semibold text-slate-800">
                          {item.tier}
                        </span>
                        <p className="text-xs font-semibold text-[#F97316] mt-0.5">
                          Rp {Number(item.amount).toLocaleString("id-ID")}
                        </p>
                      </td>

                      <td className="py-3.5 px-5 align-top">
                        {item.proofImageUrl ? (
                          <button
                            type="button"
                            onClick={() => setActiveModalItem(item)}
                            className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#E2E8F0] hover:border-[#F97316] transition-colors cursor-pointer group"
                            title="Klik untuk melihat bukti transfer & chat WhatsApp"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.proofImageUrl}
                              alt="Bukti Transfer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Tidak ada foto</span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 align-top text-right">
                        {item.paymentStatus === "WAITING_VERIFICATION" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleChatWhatsApp(item)}
                              className="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-2xs transition-colors cursor-pointer"
                              title="Chat WhatsApp mempelai untuk konfirmasi / verifikasi bukti transfer"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Chat WA</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAction(item.id, "APPROVE")}
                              disabled={processingId === item.id}
                              className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAction(item.id, "REJECT")}
                              disabled={processingId === item.id}
                              className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </div>
                        ) : item.paymentStatus === "SETTLEMENT" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Disetujui</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleChatWhatsApp(item)}
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium"
                              title="Chat WhatsApp Mempelai"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Chat WA</span>
                            </button>
                          </div>
                        ) : item.paymentStatus === "CANCELLED" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-semibold text-[11px] border border-rose-200">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Ditolak</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleChatWhatsApp(item)}
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium"
                              title="Chat WhatsApp Mempelai"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Chat WA</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-semibold text-[11px] border border-amber-200">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{item.paymentStatus}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleChatWhatsApp(item)}
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium"
                              title="Chat WhatsApp Mempelai"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Chat WA</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Proof Image & WhatsApp Verification Modal */}
      {activeModalItem && activeModalItem.proofImageUrl && (
        <div
          onClick={() => setActiveModalItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <div>
                <h4 className="font-semibold text-xs text-slate-800">Detail Bukti Transfer</h4>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {activeModalItem.orderId} • {activeModalItem.user?.name || "Mempelai"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="w-full max-h-[60vh] overflow-y-auto rounded-xl flex items-center justify-center bg-[#F3F6FB] border border-[#E2E8F0] p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeModalItem.proofImageUrl}
                alt="Bukti Transfer Detail"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            {/* Modal WhatsApp Follow-up Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 mt-3 border-t border-[#E2E8F0]">
              <div className="text-[11px] text-slate-500">
                <p className="font-semibold text-slate-700">Bukti tidak sesuai / nominal berbeda?</p>
                <p className="text-[10px] text-slate-400">Hubungi mempelai via WhatsApp untuk klarifikasi bukti transfer.</p>
              </div>
              <button
                type="button"
                onClick={() => handleChatWhatsApp(activeModalItem)}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat WA Mempelai</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

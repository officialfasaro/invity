"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
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
  const [activeModalImg, setActiveModalImg] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(
    null
  );

  const refreshList = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/verify-payment?status=WAITING_VERIFICATION");
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

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/verify-payment?status=WAITING_VERIFICATION")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!ignore && json) {
          setItems(json.data || []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

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

      // Remove from list
      setItems((prev) => prev.filter((item) => item.id !== transactionId));
    } catch (err) {
      setFeedback({
        type: "error",
        msg: err instanceof Error ? err.message : "Terjadi kesalahan",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6FB] text-slate-900 py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-[#F97316] border border-orange-100 text-[11px] font-semibold mb-2">
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
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold border border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
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
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                      Tidak ada antrean verifikasi manual pending saat ini.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
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
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-orange-50 text-[#F97316] font-semibold text-[10px] border border-orange-100">
                          {item.paymentType}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 align-top">
                        <p className="font-semibold text-slate-900">
                          {item.user?.name || "User"}
                        </p>
                        <p className="text-slate-500 text-[11px]">{item.user?.email}</p>
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
                            onClick={() => setActiveModalImg(item.proofImageUrl as string)}
                            className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#E2E8F0] hover:border-[#F97316] transition-colors"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.proofImageUrl}
                              alt="Bukti Transfer"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Tidak ada foto</span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(item.id, "APPROVE")}
                            disabled={processingId === item.id}
                            className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>

                          <button
                            onClick={() => handleAction(item.id, "REJECT")}
                            disabled={processingId === item.id}
                            className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 disabled:opacity-50 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Proof Image Modal */}
      {activeModalImg && (
        <div
          onClick={() => setActiveModalImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <h4 className="font-semibold text-xs text-slate-800">Bukti Transfer</h4>
              <button
                onClick={() => setActiveModalImg(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Tutup
              </button>
            </div>
            <div className="w-full max-h-[70vh] overflow-y-auto rounded-xl flex items-center justify-center bg-[#F3F6FB] border border-[#E2E8F0] p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeModalImg}
                alt="Bukti Transfer Detail"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

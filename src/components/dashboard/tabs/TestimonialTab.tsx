"use client";

import React, { useEffect, useState } from "react";
import {
  Heart,
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface TestimonialData {
  id?: string;
  couple: string;
  city: string;
  rating: number;
  comment: string;
  weddingDate: string;
  createdAt?: string;
}

interface TestimonialTabProps {
  groomNickname?: string;
  brideNickname?: string;
  defaultDate?: string;
  defaultCity?: string;
  onSuccessNotification?: (message: string) => void;
}

export const TestimonialTab: React.FC<TestimonialTabProps> = ({
  groomNickname = "",
  brideNickname = "",
  defaultDate = "",
  defaultCity = "",
  onSuccessNotification,
}) => {
  const [couple, setCouple] = useState("");
  const [city, setCity] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<TestimonialData | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Initialize & Load Existing Testimonial
  useEffect(() => {
    let isMounted = true;

    fetch("/api/dashboard/testimonial")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!isMounted) return;
        if (json?.data) {
          const item = json.data as TestimonialData;
          setSubmittedData(item);
          setCouple(item.couple || "");
          setCity(item.city || "");
          setWeddingDate(item.weddingDate || "");
          setRating(item.rating || 5);
          setComment(item.comment || "");
        } else {
          // Pre-fill with wedding info if available
          const defaultCouple =
            groomNickname && brideNickname
              ? `${groomNickname} & ${brideNickname}`
              : "";
          setCouple(defaultCouple);
          setCity(defaultCity || "Indonesia");
          setWeddingDate(defaultDate || "2026");
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [groomNickname, brideNickname, defaultDate, defaultCity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 5) {
      setStatusMessage({
        type: "error",
        text: "Mohon tulis ulasan pengalaman Anda minimal 5 karakter.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/dashboard/testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couple: couple.trim() || `${groomNickname} & ${brideNickname}`,
          city: city.trim() || "Indonesia",
          weddingDate: weddingDate.trim() || "2026",
          rating,
          comment: comment.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan testimoni.");
      }

      setSubmittedData(json.data);
      setStatusMessage({
        type: "success",
        text: "Terima kasih banyak! Testimoni Anda berhasil dikirim dan tersimpan.",
      });

      if (onSuccessNotification) {
        onSuccessNotification("Testimoni pernikahan Anda berhasil disimpan!");
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Memuat data testimoni Anda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-orange-50 border border-orange-100 text-[#F97316] text-[11px] font-semibold">
            <Heart className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
            <span>Cerita Pengalaman Mempelai</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Beri Testimoni untuk Invity
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Bagikan kesan dan pengalaman bahagia Anda saat menggunakan undangan digital Invity.
            Ulasan Anda akan membantu pasangan pengantin lainnya yang sedang mempersiapkan hari bahagianya.
          </p>
        </div>

        {submittedData && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Testimoni Anda Telah Tersimpan</span>
          </div>
        )}
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium border flex items-center gap-2.5 shadow-2xs ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-5">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h3 className="text-sm font-bold text-slate-900">Form Ulasan Pasangan</h3>
            <p className="text-xs text-slate-500">
              Isi data di bawah ini untuk membagikan pengalaman Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating Bintang */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Penilaian Bintang (Rating)
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
                    title={`Beri ${star} Bintang`}
                  >
                    <Star
                      className={`w-6 h-6 transition-all ${
                        star <= rating
                          ? "fill-[#F97316] text-[#F97316] scale-105"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {rating === 5
                    ? "⭐⭐⭐⭐⭐ Sangat Puas"
                    : rating === 4
                    ? "⭐⭐⭐⭐ Puas"
                    : rating === 3
                    ? "⭐⭐⭐ Cukup"
                    : `${rating} Bintang`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Pasangan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Nama Pasangan
                </label>
                <input
                  type="text"
                  value={couple}
                  onChange={(e) => setCouple(e.target.value)}
                  placeholder="Contoh: Versa &amp; Mekar"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              {/* Kota / Domisili */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Kota / Asal
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Contoh: Bogor / Jakarta"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>
            </div>

            {/* Tanggal Pernikahan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Bulan &amp; Tahun Pernikahan
              </label>
              <input
                type="text"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                placeholder="Contoh: Oktober 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#F97316]"
              />
            </div>

            {/* Komentar Ulasan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Ulasan / Pesan Pengalaman Anda
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
                placeholder="Ceritakan pengalaman Anda: kemudahan membuat undangan, tampilan tema, respon dari para tamu, atau fitur yang paling membantu..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#F97316] leading-relaxed resize-y"
              />
              <span className="text-[11px] text-slate-400">
                {comment.length} karakter (minimal 5 karakter)
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-98"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? "Menyimpan Testimoni..."
                    : submittedData
                    ? "Perbarui Testimoni"
                    : "Kirim Testimoni Sekarang"}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Preview Card: 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 space-y-3.5 text-left">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Pratinjau Tampilan Testimoni
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Live Preview
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Beginilah ulasan Anda akan ditampilkan kepada publik di halaman depan website Invity by Fasaro:
            </p>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3.5 relative overflow-hidden">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating ? "fill-[#F97316] text-[#F97316]" : "text-slate-200"
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs text-slate-700 italic leading-relaxed">
                &ldquo;{comment.trim() || "Tamu-tamu kami sangat terkesan dengan undangan digitalnya! Desainnya sangat elegan dan musiknya berputar halus."}&rdquo;
              </p>

              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">
                    {couple.trim() || `${groomNickname || "Mempelai"} & ${brideNickname || "Mempelai"}`}
                  </h4>
                  <p className="text-[11px] text-slate-500">{city.trim() || "Indonesia"}</p>
                </div>
                <span className="text-[10px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {weddingDate.trim() || "2026"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100/80 text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Privasi &amp; Penayangan</span>
              </p>
              <p className="text-slate-500 leading-normal">
                Testimoni Anda akan ditampilkan di beranda utama ketika telah terkumpul 5 testimoni atau lebih dari para pengantin Invity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialTab;

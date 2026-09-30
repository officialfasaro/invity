"use client";

import React from "react";
import Link from "next/link";
import { Hammer, MessageCircle, RefreshCw, ShieldCheck } from "lucide-react";

interface MaintenanceNoticeProps {
  title?: string;
  message?: string;
  estimatedEnd?: string;
  whatsappNumber?: string;
  isAdminBypass?: boolean;
}

export const MaintenanceNotice: React.FC<MaintenanceNoticeProps> = ({
  title = "Website Sedang Dalam Pemeliharaan Terjadwal",
  message = "Kami sedang melakukan peningkatan sistem dan infrastruktur server untuk menghadirkan pengalaman yang lebih cepat dan handal. Seluruh data undangan Anda aman.",
  estimatedEnd = "Segera kembali dalam beberapa saat",
  whatsappNumber = "085716697416",
  isAdminBypass = false,
}) => {
  if (isAdminBypass) {
    return (
      <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-amber-600/30">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>
              <strong>Mode Pemeliharaan Aktif:</strong> Pengunjung umum dibatasi. Anda dapat mengakses sistem karena memiliki hak akses Administrator.
            </span>
          </div>
          <Link
            href="/admin"
            className="px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-colors"
          >
            Buka Panel Admin
          </Link>
        </div>
      </div>
    );
  }

  const rawDigits = whatsappNumber.replace(/[^0-9]/g, "");
  const cleanWaNumber = rawDigits.startsWith("0") ? "62" + rawDigits.slice(1) : rawDigits || "6285716697416";

  return (
    <div className="min-h-screen bg-[#F3F6FB] flex items-center justify-center p-4 selection:bg-[#F97316] selection:text-white">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-[#E2E8F0] p-8 sm:p-10 text-center space-y-6 shadow-sm">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto text-[#F97316]">
          <Hammer className="w-8 h-8" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[11px] font-bold uppercase tracking-wider text-[#F97316]">
            Pemeliharaan Sistem
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {message}
          </p>
        </div>

        {/* Estimated Time Card */}
        {estimatedEnd && (
          <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Perkiraan Waktu Selesai
            </span>
            <p className="text-sm font-semibold text-slate-800">{estimatedEnd}</p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Ulang Halaman</span>
          </button>

          {cleanWaNumber && (
            <a
              href={`https://wa.me/${cleanWaNumber}?text=Halo%20Admin%20Fasaro,%20saya%20butuh%20bantuan%20mengenai%20undangan%20saya`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-xs font-semibold border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hubungi CS WhatsApp</span>
            </a>
          )}
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-slate-400 pt-2 border-t border-[#E2E8F0]">
          © {new Date().getFullYear()} Fasaro Digital Invitation. Semua hak dilindungi.
        </p>
      </div>
    </div>
  );
};

export default MaintenanceNotice;

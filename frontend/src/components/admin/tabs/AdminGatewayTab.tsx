"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  QrCode,
  Save,
  Shield,
  PhoneCall,
  FileText,
  Building,
  CheckCircle2,
} from "lucide-react";
import { SettingItem } from "./AdminCmsContentTab";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface AdminGatewayTabProps {
  settings: SettingItem[];
  onSaveSettings: (updatedSettings: SettingItem[]) => Promise<void>;
  isSaving: boolean;
}

export const AdminGatewayTab: React.FC<AdminGatewayTabProps> = ({
  settings,
  onSaveSettings,
  isSaving,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};
    for (const item of settings) {
      map[item.key] = item.value;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(map);
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const currentMode = formData.payment_active_mode || "MANUAL_ONLY";

  const handleSelectMode = (mode: "MANUAL_ONLY" | "BOTH" | "GATEWAY_ONLY") => {
    setFormData((prev) => {
      const next: Record<string, string> = { ...prev, payment_active_mode: mode };
      // Also sync boolean feature flags for backward compatibility
      if (mode === "MANUAL_ONLY") {
        next.feature_manual_payment = "true";
        next.feature_midtrans_payment = "false";
      } else if (mode === "GATEWAY_ONLY") {
        next.feature_manual_payment = "false";
        next.feature_midtrans_payment = "true";
      } else {
        next.feature_manual_payment = "true";
        next.feature_midtrans_payment = "true";
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SettingItem[] = settings.map((s) => ({
      ...s,
      value: formData[s.key] !== undefined ? formData[s.key] : s.value,
    }));

    // Ensure any newly configured keys that might not exist in settings yet are included
    const extraKeys = [
      "payment_active_mode",
      "manual_bank_name",
      "manual_account_number",
      "manual_account_holder",
      "manual_whatsapp_confirmation",
      "manual_payment_instructions",
      "manual_qris_bank_info",
      "manual_qris_image_url",
      "midtrans_server_key",
      "feature_midtrans_payment",
      "feature_manual_payment",
    ];

    for (const k of extraKeys) {
      if (formData[k] !== undefined && !updated.some((item) => item.key === k)) {
        updated.push({
          id: `custom-${k}`,
          key: k,
          value: formData[k],
          category: "gateway",
          label: k,
          description: "",
          isPublic: true,
        });
      }
    }

    await onSaveSettings(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* 1. Mode Pembayaran Aktif */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-sans font-bold text-slate-900">
              Pilihan Mode Pembayaran Platform
            </h2>
            <p className="text-xs text-slate-500">
              Atur metode pembayaran yang diaktifkan untuk klien saat upgrade / aktivasi paket di dashboard.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Opsi 1: Manual Only */}
          <div
            onClick={() => handleSelectMode("MANUAL_ONLY")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
              currentMode === "MANUAL_ONLY"
                ? "border-[#F97316] bg-orange-50/30 ring-1 ring-orange-200"
                : "border-[#E2E8F0] bg-white hover:border-slate-300"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-orange-100 text-[#F97316] text-[10px] font-bold uppercase">
                  Rekomendasi
                </span>
                {currentMode === "MANUAL_ONLY" && (
                  <CheckCircle2 className="w-4 h-4 text-[#F97316]" />
                )}
              </div>
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#F97316]" />
                <span>Hanya Transfer Manual</span>
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Paling cocok untuk saat ini. Menampilkan rekening Bank &amp; QRIS resmi Fasaro. Klien transfer lalu konfirmasi bukti via WhatsApp atau upload bukti.
              </p>
            </div>
          </div>

          {/* Opsi 2: Keduanya (Both) */}
          <div
            onClick={() => handleSelectMode("BOTH")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
              currentMode === "BOTH"
                ? "border-[#F97316] bg-orange-50/30 ring-1 ring-orange-200"
                : "border-[#E2E8F0] bg-white hover:border-slate-300"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                  Opsi Lengkap
                </span>
                {currentMode === "BOTH" && (
                  <CheckCircle2 className="w-4 h-4 text-[#F97316]" />
                )}
              </div>
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-slate-700" />
                <span>Keduanya (Otomatis &amp; Manual)</span>
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Klien dapat memilih apakah ingin checkout instan lewat Payment Gateway (Midtrans) atau transfer manual bank/QRIS.
              </p>
            </div>
          </div>

          {/* Opsi 3: Gateway Only */}
          <div
            onClick={() => handleSelectMode("GATEWAY_ONLY")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
              currentMode === "GATEWAY_ONLY"
                ? "border-[#F97316] bg-orange-50/30 ring-1 ring-orange-200"
                : "border-[#E2E8F0] bg-white hover:border-slate-300"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                  Otomatis
                </span>
                {currentMode === "GATEWAY_ONLY" && (
                  <CheckCircle2 className="w-4 h-4 text-[#F97316]" />
                )}
              </div>
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-slate-700" />
                <span>Hanya Gateway Midtrans</span>
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Hanya checkout otomatis via Midtrans. Gunakan opsi ini jika akun Midtrans production Anda sudah diverifikasi dan siap dipakai.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pengaturan Rekening Bank & QRIS Manual */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-7 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-sans font-bold text-slate-900">
              Informasi Rekening Bank &amp; Konfirmasi Manual
            </h2>
            <p className="text-xs text-slate-500">
              Data ini langsung ditampilkan pada dashboard klien saat melakukan transfer pembayaran manual.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Nama Bank */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Nama Bank</label>
            <input
              type="text"
              value={formData.manual_bank_name || "BCA"}
              onChange={(e) => handleChange("manual_bank_name", e.target.value)}
              placeholder="Contoh: BCA / Mandiri / BRI"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316]"
            />
          </div>

          {/* Nomor Rekening */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Nomor Rekening</label>
            <input
              type="text"
              value={formData.manual_account_number || "8291039481"}
              onChange={(e) => handleChange("manual_account_number", e.target.value)}
              placeholder="Contoh: 8291039481"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 font-mono focus:outline-none focus:border-[#F97316]"
            />
          </div>

          {/* Atas Nama Rekening */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Atas Nama Pemilik</label>
            <input
              type="text"
              value={formData.manual_account_holder || "PT Fasaro Digital"}
              onChange={(e) => handleChange("manual_account_holder", e.target.value)}
              placeholder="Contoh: PT Fasaro Digital"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316]"
            />
          </div>
        </div>

        {/* WhatsApp Konfirmasi */}
        <div className="space-y-1.5 text-xs pt-1">
          <label className="font-semibold text-slate-700 flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nomor WhatsApp Admin untuk Konfirmasi Bukti Bayar</span>
          </label>
          <input
            type="text"
            value={formData.manual_whatsapp_confirmation || "085716697416"}
            onChange={(e) => handleChange("manual_whatsapp_confirmation", e.target.value)}
            placeholder="085716697416 (Bisa format 08... atau 628...)"
            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 font-mono focus:outline-none focus:border-[#F97316]"
          />
          <p className="text-[10px] text-slate-400">
            Setelah transfer, klien dapat mengklik tombol &ldquo;Konfirmasi via WhatsApp&rdquo; yang langsung membuka chat ke nomor ini dengan format pesan otomatis.
          </p>
        </div>

        {/* Instruksi Transfer */}
        <div className="space-y-1.5 text-xs pt-1">
          <label className="font-semibold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Catatan Panduan / Instruksi Transfer untuk Klien</span>
          </label>
          <textarea
            rows={3}
            value={
              formData.manual_payment_instructions ||
              "Transfer sesuai nominal paket ke rekening atau QRIS di atas. Setelah transfer, upload bukti transfer di form ini atau kirimkan konfirmasi via WhatsApp agar paket Anda segera diaktifkan."
            }
            onChange={(e) => handleChange("manual_payment_instructions", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316]"
          />
        </div>

        {/* Direct Upload QRIS Image */}
        <div className="pt-2 border-t border-[#E2E8F0]">
          <ImageUploadField
            label="Unggah Gambar Kode QRIS Resmi Fasaro"
            value={formData.manual_qris_image_url || ""}
            onChange={(url) => handleChange("manual_qris_image_url", url)}
            folder="qris"
            helperText="Unggah gambar QRIS statis toko Fasaro. Pengguna tinggal scan kode QRIS ini menggunakan GoPay, OVO, Dana, ShopeePay, atau BCA Mobile."
          />
        </div>
      </div>

      {/* 3. Konfigurasi Midtrans Server Key */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-sans font-bold text-slate-900">
              Konfigurasi Payment Gateway Midtrans (Opsional)
            </h2>
            <p className="text-xs text-slate-500">
              Isi jika sudah memiliki akun Midtrans aktif. Jika belum siap, biarkan mode pembayaran di atas tetap &ldquo;Hanya Transfer Manual&rdquo;.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Midtrans Server Key</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                (midtrans_server_key - RAHASIA)
              </span>
            </label>
            <input
              type="text"
              value={formData.midtrans_server_key || ""}
              onChange={(e) => handleChange("midtrans_server_key", e.target.value)}
              placeholder="SB-Mid-server-..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 font-mono focus:outline-none focus:border-[#F97316]"
            />
            <p className="text-[10px] text-slate-400">
              Kunci Server Key dari dashboard Midtrans (Sandbox atau Production).
            </p>
          </div>
        </div>
      </div>

      {/* Tombol Simpan */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Menyimpan Pengaturan..." : "Simpan Pengaturan Pembayaran"}</span>
        </button>
      </div>
    </form>
  );
};

export default AdminGatewayTab;

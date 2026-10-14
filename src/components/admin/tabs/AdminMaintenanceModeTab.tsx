"use client";

import React, { useState, useEffect } from "react";
import { Power, Save, ShieldAlert } from "lucide-react";
import { SettingItem } from "./AdminCmsContentTab";

interface AdminMaintenanceModeTabProps {
  settings: SettingItem[];
  onSaveSettings: (updatedSettings: SettingItem[]) => Promise<void>;
  isSaving: boolean;
}

export const AdminMaintenanceModeTab: React.FC<AdminMaintenanceModeTabProps> = ({
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

  const handleToggle = async () => {
    const isCurrentlyOn = formData.maintenance_mode === "true";
    const nextVal = isCurrentlyOn ? "false" : "true";

    const nextFormData: Record<string, string> = { ...formData, maintenance_mode: nextVal };
    setFormData(nextFormData);

    const updated: SettingItem[] = settings.map((s) => ({
      ...s,
      value: s.key === "maintenance_mode" ? nextVal : (nextFormData[s.key] ?? s.value),
    }));

    await onSaveSettings(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SettingItem[] = settings.map((s) => ({
      ...s,
      value: formData[s.key] !== undefined ? formData[s.key] : s.value,
    }));
    await onSaveSettings(updated);
  };

  const isMaintenanceOn = formData.maintenance_mode === "true";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div
        className={`rounded-xl border p-6 sm:p-7 space-y-5 transition-all shadow-xs ${
          isMaintenanceOn
            ? "bg-rose-50/70 border-rose-200"
            : "bg-white border-[#E2E8F0]"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isMaintenanceOn
                  ? "bg-rose-600 text-white"
                  : "bg-orange-50 border border-orange-100 text-[#F97316]"
              }`}
            >
              {isMaintenanceOn ? (
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              ) : (
                <Power className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-sans font-bold text-slate-900">
                  Mode Pemeliharaan Website (Maintenance Mode)
                </h2>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isMaintenanceOn
                      ? "bg-rose-600 text-white"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {isMaintenanceOn ? "SEDANG AKTIF" : "NORMAL (TAYANG)"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isMaintenanceOn
                  ? "Pengunjung umum dialihkan ke halaman pemeliharaan. Akses bypass hanya untuk Administrator."
                  : "Website beroperasi normal dan dapat diakses oleh seluruh pengunjung serta tamu undangan."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 shadow-xs ${
              isMaintenanceOn
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-rose-600 hover:bg-rose-700 text-white"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>
              {isMaintenanceOn ? "Buka Akses Website (Matikan)" : "Aktifkan Mode Pemeliharaan"}
            </span>
          </button>
        </div>

        {/* Customization Details */}
        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Judul Layar Pemeliharaan</label>
            <input
              type="text"
              value={formData.maintenance_title || ""}
              onChange={(e) => handleChange("maintenance_title", e.target.value)}
              placeholder="Website Sedang Dalam Pemeliharaan Terjadwal"
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Pesan Detail Pengunjung</label>
            <textarea
              rows={3}
              value={formData.maintenance_message || ""}
              onChange={(e) => handleChange("maintenance_message", e.target.value)}
              placeholder="Kami sedang melakukan peningkatan sistem dan infrastruktur server..."
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316] leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Perkiraan Waktu Selesai</label>
            <input
              type="text"
              value={formData.maintenance_estimated_end || ""}
              onChange={(e) => handleChange("maintenance_estimated_end", e.target.value)}
              placeholder="Contoh: 16 September 2026, 12:00 WIB"
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 focus:outline-none focus:border-[#F97316]"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#E2E8F0] flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Menyimpan..." : "Simpan Pengaturan Pemeliharaan"}</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default AdminMaintenanceModeTab;

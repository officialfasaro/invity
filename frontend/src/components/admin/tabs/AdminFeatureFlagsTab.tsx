"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  CreditCard,
  Music,
  QrCode,
  Radio,
  Smartphone,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { SettingItem } from "./AdminCmsContentTab";

interface AdminFeatureFlagsTabProps {
  settings: SettingItem[];
  onSaveSettings: (updatedSettings: SettingItem[]) => Promise<void>;
  isSaving: boolean;
}

export const AdminFeatureFlagsTab: React.FC<AdminFeatureFlagsTabProps> = ({
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

  const handleToggle = async (key: string) => {
    if (isSaving) return;
    const currentVal = formData[key] !== "false";
    const nextVal = currentVal ? "false" : "true";

    const nextFormData: Record<string, string> = { ...formData, [key]: nextVal };
    setFormData(nextFormData);

    const updated: SettingItem[] = settings.map((s) => ({
      ...s,
      value: s.key === key ? nextVal : (nextFormData[s.key] ?? s.value),
    }));

    await onSaveSettings(updated);
  };

  const featureList = [
    {
      key: "feature_registration",
      label: "Pendaftaran Akun Pengguna Baru",
      desc: "Izinkan pengguna baru mendaftar di halaman registrasi",
      icon: <Users className="w-4 h-4 text-slate-700" />,
    },
    {
      key: "feature_midtrans_payment",
      label: "Payment Gateway Otomatis (Midtrans)",
      desc: "Aktifkan checkout kartu kredit & QRIS dinamis Midtrans",
      icon: <CreditCard className="w-4 h-4 text-slate-700" />,
    },
    {
      key: "feature_manual_payment",
      label: "Transfer Manual Bank & Upload QRIS",
      desc: "Aktifkan opsi transfer rekening Fasaro & upload bukti bayar",
      icon: <QrCode className="w-4 h-4 text-slate-700" />,
    },
    {
      key: "feature_digital_gift",
      label: "Fitur Amplop Digital Kado",
      desc: "Tampilkan modul amplop kado rekening pada seluruh undangan",
      icon: <Zap className="w-4 h-4 text-slate-700" />,
    },
    {
      key: "feature_rsvp",
      label: "Formulir Konfirmasi Kehadiran (RSVP)",
      desc: "Izinkan tamu mengisi konfirmasi kehadiran dan jumlah tamu",
      icon: <CheckCircle2 className="w-4 h-4 text-slate-700" />,
    },
    {
      key: "feature_wishes",
      label: "Buku Tamu & Doa Ucapan Selamat",
      desc: "Tampilkan dinding ucapan doa dan reaksi emoji pada undangan",
      icon: <Sparkles className="w-4 h-4 text-slate-700" />,
    },
    {
      key: "feature_music",
      label: "Pemutar Musik Latar (Autoplay Audio)",
      desc: "Aktifkan tombol kontrol audio musik tema pada undangan",
      icon: <Music className="w-4 h-4 text-slate-700" />,
    },
    {
      key: "feature_pwa_banner",
      label: "Banner Ajakan Unduh Aplikasi PWA",
      desc: "Tampilkan prompt instalasi PWA di perangkat mobile pengguna",
      icon: <Smartphone className="w-4 h-4 text-slate-700" />,
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-sans font-bold text-slate-900">
                Saklar Fitur Website (Feature Flags)
              </h2>
              <p className="text-xs text-slate-500">
                Matikan atau aktifkan fitur secara instan untuk kebutuhan pemeliharaan tanpa redeploy kode.
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Klik kotak saklar untuk toggle langsung</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {featureList.map((feat) => {
            const isEnabled = formData[feat.key] !== "false";
            return (
              <div
                key={feat.key}
                onClick={() => void handleToggle(feat.key)}
                className={`p-4 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isEnabled
                    ? "bg-white border-[#E2E8F0] hover:border-orange-300 shadow-xs"
                    : "bg-slate-50/70 border-slate-200 opacity-70"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 mt-0.5 shrink-0">
                    {feat.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {feat.label}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {feat.desc}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-11 h-6 flex items-center rounded-full p-1 duration-200 shrink-0 ${
                    isEnabled ? "bg-[#F97316]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
                      isEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminFeatureFlagsTab;

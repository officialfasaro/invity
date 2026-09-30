"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, X } from "lucide-react";

interface AnnouncementBannerProps {
  initialSettings?: Record<string, string>;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  initialSettings,
}) => {
  const [settings, setSettings] = useState<Record<string, string> | null>(
    initialSettings || null
  );
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // If not provided from parent, fetch from public settings API
    if (!initialSettings) {
      fetch("/api/public/settings")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setSettings(json.data);
          }
        })
        .catch(() => {
          // Silent fallback
        });
    }

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem("fasaro_announcement_dismissed");
    if (dismissed === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDismissed(true);
    }
  }, [initialSettings]);

  if (isDismissed || !settings) return null;

  const isEnabled = settings.announcement_enabled === "true";
  const text = settings.announcement_text;
  const type = settings.announcement_type || "info";

  if (!isEnabled || !text) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("fasaro_announcement_dismissed", "true");
  };

  const getStyle = () => {
    switch (type) {
      case "warning":
        return {
          wrapper: "bg-amber-500 text-slate-950 border-b border-amber-600/20",
          icon: <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950" />,
          closeBtn: "text-slate-900/80 hover:text-slate-950 hover:bg-amber-600/20",
        };
      case "promo":
        return {
          wrapper: "bg-emerald-600 text-white border-b border-emerald-700/20",
          icon: <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />,
          closeBtn: "text-white/80 hover:text-white hover:bg-emerald-700/30",
        };
      case "info":
      default:
        return {
          wrapper: "bg-[#F97316] text-white border-b border-orange-600/20",
          icon: <AlertCircle className="w-4 h-4 shrink-0 text-white" />,
          closeBtn: "text-white/80 hover:text-white hover:bg-orange-600/30",
        };
    }
  };

  const style = getStyle();

  return (
    <aside
      aria-label="Pengumuman Penting"
      className={`w-full py-2 px-4 transition-all ${style.wrapper}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-[13px] font-medium">
        <div className="flex items-center gap-2.5 min-w-0">
          {style.icon}
          <p className="truncate sm:whitespace-normal leading-tight">{text}</p>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Tutup Pengumuman"
          className={`p-1 rounded-md transition-colors shrink-0 ${style.closeBtn}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default AnnouncementBanner;

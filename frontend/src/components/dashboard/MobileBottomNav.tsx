"use client";

import React from "react";
import {
  CreditCard,
  Edit3,
  Palette,
  UserCheck,
  Users,
} from "lucide-react";

export type AdminTabId = "editor" | "theme" | "guests" | "rsvp" | "billing";

interface MobileBottomNavProps {
  activeTab: AdminTabId;
  onChangeTab: (tab: AdminTabId) => void;
  guestCount: number;
  rsvpCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  guestCount,
  rsvpCount,
}) => {
  const tabs: Array<{
    id: AdminTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: "editor", label: "Konten", icon: Edit3 },
    { id: "theme", label: "Tema", icon: Palette },
    { id: "guests", label: "Tamu", icon: Users, badge: guestCount },
    { id: "rsvp", label: "RSVP", icon: UserCheck, badge: rsvpCount },
    { id: "billing", label: "Paket", icon: CreditCard },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/98 border-t border-[#E2E8F0] backdrop-blur-md px-1 py-1 flex items-center justify-around shadow-md safe-area-pb">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl min-h-[50px] min-w-[56px] transition-colors relative ${
              isActive
                ? "text-[#F97316]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <span className="absolute -top-1 -right-2.5 px-1 min-w-[14px] h-[14px] rounded-full bg-[#F97316] text-white text-[9px] font-bold flex items-center justify-center">
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-1 ${isActive ? "font-bold text-[#F97316]" : "font-medium"}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;

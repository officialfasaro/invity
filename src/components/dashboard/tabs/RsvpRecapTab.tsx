"use client";

import React from "react";
import {
  Activity,
  CheckCircle2,
  Eye,
  HelpCircle,
  MessageSquare,
  Smartphone,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

export interface RsvpItem {
  id: string;
  guestName: string;
  status: string;
  attendeeCount: number;
  sessionChosen?: string | null;
  createdAt: string;
}

export interface WishItem {
  id: string;
  senderName: string;
  message: string;
  reaction?: string | null;
  createdAt: string | Date;
}

export interface InvitationAnalyticsData {
  totalViews: number;
  todayViews: number;
  mobilePercent: number;
}

export interface RsvpRecapData {
  totalResponses: number;
  attendingCount: number;
  notAttendingCount: number;
  tentativeCount: number;
  totalPax: number;
  rsvps: RsvpItem[];
  analytics?: InvitationAnalyticsData;
}

interface RsvpRecapTabProps {
  rsvpRecap: RsvpRecapData | null;
  wishes?: WishItem[];
  isLoading: boolean;
  liveCount?: number;
}

export const RsvpRecapTab: React.FC<RsvpRecapTabProps> = ({
  rsvpRecap,
  wishes = [],
  isLoading,
  liveCount = 0,
}) => {
  const totalResponses = rsvpRecap?.totalResponses || 0;
  const attendingCount = rsvpRecap?.attendingCount || 0;
  const notAttendingCount = rsvpRecap?.notAttendingCount || 0;
  const tentativeCount = rsvpRecap?.tentativeCount || 0;
  const totalPax = rsvpRecap?.totalPax || 0;
  const rsvps = rsvpRecap?.rsvps || [];

  const totalViews = rsvpRecap?.analytics?.totalViews || 0;
  const todayViews = rsvpRecap?.analytics?.todayViews || 0;
  const mobilePercent = rsvpRecap?.analytics?.mobilePercent ?? 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Statistik Pengunjung & Kehadiran (RSVP)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Pantau pengunjung undangan dan konfirmasi kehadiran para tamu secara realtime.
        </p>
      </div>

      {/* Visitor Analytics & Live Presence Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Aktivitas Pengunjung Undangan
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{liveCount} Sedang Membuka Undangan</span>
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Sedang Online */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Sedang Online</span>
              <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 pt-0.5">
              <span className="text-2xl font-bold text-slate-900">{liveCount}</span>
              <span className="text-xs text-slate-500">Orang</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">Real-time detik ini</p>
          </div>

          {/* 2. Total Kunjungan */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Kunjungan</span>
              <div className="p-1 rounded-md bg-orange-50 text-[#F97316]">
                <Eye className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 pt-0.5">
              <span className="text-2xl font-bold text-slate-900">{totalViews}</span>
              <span className="text-xs text-slate-500">Kali Dilihat</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Akumulasi seluruh tamu</p>
          </div>

          {/* 3. Hari Ini */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Kunjungan Hari Ini</span>
              <div className="p-1 rounded-md bg-sky-50 text-sky-600">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 pt-0.5">
              <span className="text-2xl font-bold text-slate-900">{todayViews}</span>
              <span className="text-xs text-slate-500">Tamu</span>
            </div>
            <p className="text-[11px] text-sky-600 font-medium">Akses hari ini</p>
          </div>

          {/* 4. Perangkat Smartphone */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Perangkat Tamu</span>
              <div className="p-1 rounded-md bg-slate-100 text-slate-600">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 pt-0.5">
              <span className="text-2xl font-bold text-slate-900">{mobilePercent}%</span>
              <span className="text-xs text-slate-500">Mobile</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Smartphone / HP</p>
          </div>
        </div>
      </div>

      {/* RSVP Section Divider */}
      <div className="pt-2 border-t border-[#E2E8F0]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Konfirmasi Kehadiran Tamu (RSVP)
        </span>
      </div>

      {/* Metric Cards Grid (Mobile 2 cols, Desktop 4 cols) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Hadir */}
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Konfirmasi Hadir</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-bold text-slate-900">{attendingCount}</span>
            <span className="text-xs text-slate-500">Undangan</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">
            Total {totalPax} Pax Hadir
          </p>
        </div>

        {/* Tidak Hadir */}
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tidak Bisa Hadir</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-bold text-slate-900">{notAttendingCount}</span>
            <span className="text-xs text-slate-500">Undangan</span>
          </div>
          <p className="text-[11px] text-rose-600 font-medium">
            Berhalangan Hadir
          </p>
        </div>

        {/* Ragu-ragu */}
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Masih Ragu</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-bold text-slate-900">{tentativeCount}</span>
            <span className="text-xs text-slate-500">Undangan</span>
          </div>
          <p className="text-[11px] text-amber-600 font-medium">
            Menunggu Kepastian
          </p>
        </div>

        {/* Total Respons */}
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Respons</span>
            <div className="p-1.5 rounded-lg bg-orange-50 text-[#F97316]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-bold text-slate-900">{totalResponses}</span>
            <span className="text-xs text-slate-500">Respons</span>
          </div>
          <p className="text-[11px] text-[#F97316] font-medium">
            Telah Merespons
          </p>
        </div>
      </div>

      {/* List of RSVP Responses */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
            Daftar Konfirmasi Tamu ({rsvps.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Memuat data kehadiran...
          </div>
        ) : rsvps.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">
              Belum ada tamu yang mengirimkan konfirmasi kehadiran.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {rsvps.map((r) => {
              const isHadir = r.status === "HADIR";
              const isTidakHadir = r.status === "TIDAK_HADIR";

              return (
                <div
                  key={r.id}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{r.guestName}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(r.createdAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {r.sessionChosen && ` • Sesi: ${r.sessionChosen}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-medium text-slate-700">
                      {r.attendeeCount} Pax
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-none text-[10px] font-semibold border ${
                        isHadir
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isTidakHadir
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {isHadir ? "Hadir" : isTidakHadir ? "Tidak Hadir" : "Ragu-ragu"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Wishes Section (Buku Ucapan & Doa) */}
      {wishes && wishes.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Buku Doa &amp; Ucapan Selamat ({wishes.length})</span>
            </h3>
          </div>

          <div className="divide-y divide-[#E2E8F0] max-h-96 overflow-y-auto">
            {wishes.map((w) => (
              <div key={w.id} className="p-4 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{w.senderName}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(w.createdAt).toLocaleString("id-ID", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed break-words">{w.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RsvpRecapTab;

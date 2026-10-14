"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertOctagon,
  Check,
  CheckCircle2,
  Clock,
  Cloud,
  Database,
  Download,
  HardDrive,
  RefreshCw,
  RotateCcw,
  Server,
  CloudUpload,
  Trash2,
  X,
} from "lucide-react";
export interface MaintenanceHealthData {
  serverStatus: string;
  timestamp: string;
  uptimeSeconds: number;
  nodeEnv: string;
  database: {
    status: string;
    latencyMs: number;
    provider: string;
  };
  memory: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
  };
  metrics: {
    totalUsers: number;
    totalInvitations: number;
    totalTransactions: number;
    totalWishes: number;
    totalRsvps: number;
    totalSettings: number;
  };
}

interface AdminSystemToolsTabProps {
  diagnostics: MaintenanceHealthData | null;
  isLoadingDiagnostics: boolean;
  onRefreshDiagnostics: () => Promise<void>;
}

export const AdminSystemToolsTab: React.FC<AdminSystemToolsTabProps> = ({
  diagnostics,
  isLoadingDiagnostics,
  onRefreshDiagnostics,
}) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const handlePingDb = async () => {
    setActiveAction("ping");
    setActionResult(null);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping_db" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal ping database");
      setActionResult({
        type: "success",
        msg: `Koneksi database prima! Latensi query respon: ${json.latencyMs} ms.`,
      });
      void onRefreshDiagnostics();
    } catch (err) {
      setActionResult({
        type: "error",
        msg: err instanceof Error ? err.message : "Gagal ping database",
      });
    } finally {
      setActiveAction(null);
    }
  };

  const handleClearCache = async () => {
    setActiveAction("cache");
    setActionResult(null);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_cache" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membersihkan cache");
      setActionResult({
        type: "success",
        msg: json.message || "Cache halaman publik berhasil dibersihkan.",
      });
    } catch (err) {
      setActionResult({
        type: "error",
        msg: err instanceof Error ? err.message : "Gagal membersihkan cache",
      });
    } finally {
      setActiveAction(null);
    }
  };

  const handleSeedDefaults = async () => {
    setActiveAction("seed");
    setActionResult(null);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed_defaults" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal sinkronisasi");
      setActionResult({
        type: "success",
        msg: json.message || "Pengaturan bawaan berhasil disinkronkan ke database.",
      });
      void onRefreshDiagnostics();
    } catch (err) {
      setActionResult({
        type: "error",
        msg: err instanceof Error ? err.message : "Gagal sinkronisasi",
      });
    } finally {
      setActiveAction(null);
    }
  };

  const handleExportBackup = async () => {
    setActiveAction("backup");
    setActionResult(null);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export_backup" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengekspor data");

      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(json.backup, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `fasaro-backup-${new Date().toISOString().split("T")[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setActionResult({
        type: "success",
        msg: "Cadangan data sistem berhasil diunduh ke komputer Anda.",
      });
    } catch (err) {
      setActionResult({
        type: "error",
        msg: err instanceof Error ? err.message : "Gagal mengunduh cadangan data",
      });
    } finally {
      setActiveAction(null);
    }
  };

  const handleResetSales = async () => {
    const confirmed = window.confirm(
      "PERINGATAN: Apakah Anda yakin ingin mereset seluruh data transaksi penjualan admin?\\n\\nSemua riwayat transaksi pembayaran dan omset akan dihapus secara permanen."
    );
    if (!confirmed) return;

    setActiveAction("reset_sales");
    setActionResult(null);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_sales" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mereset data penjualan");
      setActionResult({
        type: "success",
        msg: json.message || "Seluruh data penjualan admin berhasil direset ke 0.",
      });
      void onRefreshDiagnostics();
    } catch (err) {
      setActionResult({
        type: "error",
        msg: err instanceof Error ? err.message : "Gagal mereset data penjualan",
      });
    } finally {
      setActiveAction(null);
    }
  };

  const handleTestSanity = async () => {
    setActiveAction("sanity_test");
    setActionResult(null);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_sanity" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal tes koneksi Sanity");
      setActionResult({
        type: json.success ? "success" : "error",
        msg: json.message || "Status Sanity berhasil diperiksa.",
      });
    } catch (err) {
      setActionResult({
        type: "error",
        msg: err instanceof Error ? err.message : "Gagal tes koneksi Sanity",
      });
    } finally {
      setActiveAction(null);
    }
  };

  const handleSyncSanity = async () => {
    const confirmed = window.confirm(
      "Apakah Anda ingin menyinkronkan seluruh data undangan dan pengaturan situs ke Sanity CMS sekarang?"
    );
    if (!confirmed) return;

    setActiveAction("sanity_sync");
    setActionResult(null);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_all_to_sanity" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal sinkron ke Sanity");
      setActionResult({
        type: "success",
        msg: json.message || "Data berhasil disinkronkan ke Sanity CMS.",
      });
    } catch (err) {
      setActionResult({
        type: "error",
        msg: err instanceof Error ? err.message : "Gagal sinkron ke Sanity",
      });
    } finally {
      setActiveAction(null);
    }
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (d > 0) parts.push(`${d} hari`);
    if (h > 0) parts.push(`${h} jam`);
    parts.push(`${m} menit`);
    return parts.join(" ");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Feedback Banner */}
      {actionResult && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium border flex items-center justify-between gap-3 animate-in fade-in ${
            actionResult.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionResult.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{actionResult.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionResult(null)}
            className="p-1 text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. HEALTH DIAGNOSTICS */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-sans font-bold text-slate-900">
                Diagnostik Kesehatan Server &amp; Database
              </h2>
              <p className="text-xs text-slate-500">
                Metrik operasional real-time dari database PostgreSQL dan runtime server Next.js.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void onRefreshDiagnostics()}
            disabled={isLoadingDiagnostics}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isLoadingDiagnostics ? "animate-spin text-[#F97316]" : "text-slate-500"
              }`}
            />
            <span>Perbarui Metrik</span>
          </button>
        </div>

        {diagnostics ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Database</span>
                  <Database className="w-3.5 h-3.5 text-[#F97316]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-900 font-sans">
                    {diagnostics.database.latencyMs} ms
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">PostgreSQL Prima</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Server Uptime</span>
                  <Clock className="w-3.5 h-3.5 text-[#F97316]" />
                </div>
                <p className="font-bold text-slate-900 font-sans truncate">
                  {formatUptime(diagnostics.uptimeSeconds)}
                </p>
                <p className="text-[10px] text-slate-400">Node {diagnostics.nodeEnv}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Memori Heap</span>
                  <HardDrive className="w-3.5 h-3.5 text-[#F97316]" />
                </div>
                <p className="font-bold text-slate-900 font-sans">
                  {diagnostics.memory.heapUsedMb} MB
                </p>
                <p className="text-[10px] text-slate-400">
                  Total: {diagnostics.memory.heapTotalMb} MB
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Total Kunci Sistem</span>
                  <Server className="w-3.5 h-3.5 text-[#F97316]" />
                </div>
                <p className="font-bold text-slate-900 font-sans">
                  {diagnostics.metrics.totalSettings} Kunci
                </p>
                <p className="text-[10px] text-slate-400">Tersimpan di DB</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-slate-600">
                <span>
                  <strong>{diagnostics.metrics.totalUsers}</strong> Pengguna
                </span>
                <span>•</span>
                <span>
                  <strong>{diagnostics.metrics.totalInvitations}</strong> Undangan
                </span>
                <span>•</span>
                <span>
                  <strong>{diagnostics.metrics.totalTransactions}</strong> Transaksi
                </span>
                <span>•</span>
                <span>
                  <strong>{diagnostics.metrics.totalRsvps}</strong> Tamu RSVP
                </span>
                <span>•</span>
                <span>
                  <strong>{diagnostics.metrics.totalWishes}</strong> Doa Ucapan
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Pembaruan: {new Date(diagnostics.timestamp).toLocaleTimeString("id-ID")}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-500">
            {isLoadingDiagnostics
              ? "Memuat metrik diagnostik sistem..."
              : "Klik tombol 'Perbarui Metrik' untuk memuat metrik kesehatan server."}
          </div>
        )}
      </div>

      {/* 2. MAINTENANCE ACTIONS */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-sans font-bold text-slate-900">
              Aksi Operasi Pemeliharaan (Maintenance Operations)
            </h2>
            <p className="text-xs text-slate-500">
              Operasi 1-klik untuk pengujian latensi DB, pembersihan memori cache, serta unduh cadangan data sistem.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <button
            type="button"
            onClick={handlePingDb}
            disabled={Boolean(activeAction)}
            className="p-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-left space-y-2.5 transition-all group disabled:opacity-50 shadow-xs"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className={`w-4 h-4 ${activeAction === "ping" ? "animate-spin" : ""}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-[#F97316]">
                Uji Latensi DB
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ping koneksi PostgreSQL untuk mengukur waktu respon
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleClearCache}
            disabled={Boolean(activeAction)}
            className="p-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-left space-y-2.5 transition-all group disabled:opacity-50 shadow-xs"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <RefreshCw className={`w-4 h-4 ${activeAction === "cache" ? "animate-spin" : ""}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-[#F97316]">
                Bersihkan Cache
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Revalidasi halaman publik dan hapus cache memori
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleSeedDefaults}
            disabled={Boolean(activeAction)}
            className="p-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-left space-y-2.5 transition-all group disabled:opacity-50 shadow-xs"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Check className={`w-4 h-4 ${activeAction === "seed" ? "animate-spin" : ""}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-[#F97316]">
                Sinkron Bawaan
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pastikan seluruh kunci default tersimpan di database
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportBackup}
            disabled={Boolean(activeAction)}
            className="p-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-left space-y-2.5 transition-all group disabled:opacity-50 shadow-xs"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Download className={`w-4 h-4 ${activeAction === "backup" ? "animate-spin" : ""}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-[#F97316]">
                Unduh Cadangan
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Export snapshot data sistem dalam format JSON
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleResetSales}
            disabled={Boolean(activeAction)}
            className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-left space-y-2.5 transition-all group disabled:opacity-50 shadow-xs"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <RotateCcw className={`w-4 h-4 ${activeAction === "reset_sales" ? "animate-spin" : ""}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900 group-hover:text-rose-700">
                Reset Data Penjualan
              </p>
              <p className="text-[11px] text-rose-600 mt-0.5">
                Kosongkan semua riwayat transaksi pembayaran ke Rp 0
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleTestSanity}
            disabled={Boolean(activeAction)}
            className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-50 text-left space-y-2.5 transition-all group disabled:opacity-50 shadow-xs"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
              <Cloud className={`w-4 h-4 ${activeAction === "sanity_test" ? "animate-spin" : ""}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-sky-900 group-hover:text-sky-700">
                Uji Sanity CMS
              </p>
              <p className="text-[11px] text-sky-600 mt-0.5">
                Cek status koneksi Sanity Project (3bb1fiht)
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleSyncSanity}
            disabled={Boolean(activeAction)}
            className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-left space-y-2.5 transition-all group disabled:opacity-50 shadow-xs"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <CloudUpload className={`w-4 h-4 ${activeAction === "sanity_sync" ? "animate-pulse" : ""}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-900 group-hover:text-indigo-700">
                Sync Massal ke Sanity
              </p>
              <p className="text-[11px] text-indigo-600 mt-0.5">
                Kirim seluruh data undangan aktif ke Sanity
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemToolsTab;

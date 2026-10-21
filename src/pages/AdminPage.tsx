"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Edit2,
  ExternalLink,
  LogIn,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AdminCmsContentTab, SettingItem } from "@/components/admin/tabs/AdminCmsContentTab";
import { AdminPricingTab } from "@/components/admin/tabs/AdminPricingTab";
import { AdminMaintenanceModeTab } from "@/components/admin/tabs/AdminMaintenanceModeTab";
import { AdminFeatureFlagsTab } from "@/components/admin/tabs/AdminFeatureFlagsTab";
import { AdminGatewayTab } from "@/components/admin/tabs/AdminGatewayTab";
import { AdminSystemToolsTab, MaintenanceHealthData } from "@/components/admin/tabs/AdminSystemToolsTab";
import {
  AdminOverviewTab,
  SalesAnalytics,
  TransactionItem,
} from "@/components/admin/tabs/AdminOverviewTab";
import { AdminUserRolesTab } from "@/components/admin/tabs/AdminUserRolesTab";
import { ALL_FEATURES } from "@/types/wedding";

export type AdminTab =
  | "overview"
  | "clients"
  | "themes"
  | "cms"
  | "pricing"
  | "maintenance"
  | "features"
  | "gateway"
  | "system"
  | "roles";

interface MetricsData {
  totalUsers: number;
  totalActiveInvitations: number;
  pendingPaymentsCount: number;
  monthlyRevenue: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
  }>;
}

interface ClientData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  invitation: {
    id: string;
    title: string;
    slug: string;
    themeId: string;
    activeUntil: string | null;
    isActive: boolean;
    tier: string;
    status: string;
  } | null;
}

interface ThemeItem {
  id: string;
  themeKey: string;
  name: string;
  category: string;
  thumbnail: string;
  previewUrl: string | null;
  isActive: boolean;
  isPremium: boolean;
  features?: string[];
}

function MasterAdminContent() {
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get("tab") as AdminTab | null;
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  useEffect(() => {
    if (tabFromQuery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  const [diagnostics, setDiagnostics] = useState<MaintenanceHealthData | null>(null);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Client Edit Modal
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [editTier, setEditTier] = useState("ELEGANT");
  const [editAddDays, setEditAddDays] = useState(0);
  const [editIsLifetime, setEditIsLifetime] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editCustomDays, setEditCustomDays] = useState<string>("");
  const [isSavingClient, setIsSavingClient] = useState(false);

  // Theme Add/Edit Modal
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [themeForm, setThemeForm] = useState<{
    themeKey: string;
    name: string;
    category: string;
    thumbnail: string;
    isPremium: boolean;
    isActive: boolean;
    features: string[];
  }>({
    themeKey: "",
    name: "",
    category: "Modern Chic",
    thumbnail: "",
    isPremium: false,
    isActive: true,
    features: ALL_FEATURES.map((f) => f.id),
  });

  // Notification / Feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchAllData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsLoading(true);
      setFeedback(null);
    }
    try {
      const [resMetrics, resClients, resThemes, resSettings, resPayments] = await Promise.all([
        fetch("/api/admin/metrics"),
        fetch("/api/admin/clients"),
        fetch("/api/admin/themes"),
        fetch("/api/admin/settings"),
        fetch("/api/admin/payments"),
      ]);

      if (resMetrics.ok) {
        const json = await resMetrics.json();
        setMetrics(json.data);
      }
      if (resClients.ok) {
        const json = await resClients.json();
        setClients(json.data || []);
      }
      if (resThemes.ok) {
        const json = await resThemes.json();
        setThemes(json.data || []);
      }
      if (resSettings.ok) {
        const json = await resSettings.json();
        setSettings(json.data || []);
      }
      if (resPayments.ok) {
        const json = await resPayments.json();
        setTransactions(json.data?.transactions || []);
        setSalesAnalytics(json.data?.analytics || null);
      }
    } catch {
      setFeedback({ type: "error", msg: "Gagal memuat data dashboard admin." });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAllData(false);
  }, [fetchAllData]);

  // Impersonate Login
  const handleImpersonate = async (targetUserId: string) => {
    if (!confirm("Masuk ke dashboard sebagai klien ini?")) return;
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      const json = await res.json();
      if (res.ok && json.redirectUrl) {
        window.location.assign(json.redirectUrl);
      } else {
        throw new Error(json.error || "Gagal impersonasi");
      }
    } catch (err) {
      setFeedback({
        type: "error",
        msg: err instanceof Error ? err.message : "Gagal impersonasi login",
      });
    }
  };

  // Save Client Edit
  const handleSaveClientEdit = async () => {
    if (!editingClient) return;
    setIsSavingClient(true);
    try {
      const parsedCustom = editCustomDays ? parseInt(editCustomDays, 10) : NaN;
      const days = !isNaN(parsedCustom) ? parsedCustom : editAddDays;

      const res = await fetch("/api/admin/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingClient.id,
          invitationId: editingClient.invitation?.id,
          tier: editTier,
          addDays: editIsLifetime ? 36500 : days,
          isLifetime: editIsLifetime,
          isActive: editIsActive,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui klien");

      setFeedback({ type: "success", msg: "Hak akses dan paket langganan berhasil diperbarui!" });
      setEditingClient(null);
      fetchAllData();
    } catch (err) {
      setFeedback({
        type: "error",
        msg: err instanceof Error ? err.message : "Gagal memperbarui klien",
      });
    } finally {
      setIsSavingClient(false);
    }
  };

  // Save Theme
  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/admin/themes";
      const method = editingThemeId ? "PUT" : "POST";
      const body = editingThemeId ? { id: editingThemeId, ...themeForm } : themeForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan tema");

      setFeedback({
        type: "success",
        msg: editingThemeId ? "Tema berhasil diperbarui!" : "Tema baru berhasil ditambahkan!",
      });
      setIsThemeModalOpen(false);
      setEditingThemeId(null);
      setThemeForm({
        themeKey: "",
        name: "",
        category: "Modern Chic",
        thumbnail: "",
        isPremium: false,
        isActive: true,
        features: ALL_FEATURES.map((f) => f.id),
      });
      fetchAllData();
    } catch (err) {
      setFeedback({
        type: "error",
        msg: err instanceof Error ? err.message : "Gagal menyimpan tema",
      });
    }
  };

  // Delete Theme with Ecosystem Cleanup
  const handleDeleteTheme = async (id: string, name: string) => {
    if (
      !confirm(
        `Hapus tema "${name}" dari katalog?\n\nSistem akan otomatis membersihkan ekosistem tema ini: seluruh undangan aktif yang menggunakannya akan dialihkan ke tema Minimalist secara aman dan file aset terkait akan dibersihkan.`
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/themes?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menghapus tema");
      setFeedback({
        type: "success",
        msg: json.message || `Tema "${name}" berhasil dihapus dan ekosistemnya telah dibersihkan.`,
      });
      fetchAllData();
    } catch (err) {
      setFeedback({
        type: "error",
        msg: err instanceof Error ? err.message : "Gagal menghapus tema.",
      });
    }
  };

  // Fetch Diagnostics for Maintenance Tab
  const fetchDiagnostics = useCallback(async () => {
    setIsLoadingDiagnostics(true);
    try {
      const res = await fetch("/api/admin/maintenance");
      if (res.ok) {
        const json = await res.json();
        setDiagnostics(json.data);
      }
    } catch {
      // Silent error
    } finally {
      setIsLoadingDiagnostics(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "system" && !diagnostics) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchDiagnostics();
    }
  }, [activeTab, diagnostics, fetchDiagnostics]);

  // Save Settings
  const handleSaveSettings = async (updatedSettings: SettingItem[]) => {
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: updatedSettings }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan pengaturan");
      setFeedback({ type: "success", msg: "Pengaturan sistem berhasil disimpan!" });
      setSettings(updatedSettings);
    } catch (err) {
      setFeedback({
        type: "error",
        msg: err instanceof Error ? err.message : "Gagal menyimpan pengaturan",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const slug = c.invitation?.slug || "";
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slug.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === "ALL") return true;
    if (statusFilter === "NO_INVITATION") return !c.invitation;
    return c.invitation?.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium border flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.msg}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 0: DASHBOARD & ANALISA PENJUALAN (Requirement 4 & 5) */}
      {activeTab === "overview" && (
        <AdminOverviewTab
          metrics={metrics}
          analytics={salesAnalytics}
          transactions={transactions}
          clients={clients}
          isLoading={isLoading}
          onRefresh={() => void fetchAllData(true)}
          onNavigateTab={(tab, filter) => {
            setActiveTab(tab as AdminTab);
            if (filter) setStatusFilter(filter);
          }}
        />
      )}

      {/* Active Section Module Header (Only visible on subpages, NOT on overview) */}
      {activeTab !== "overview" && (
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Modul Aktif
            </span>
            <span className="text-sm font-bold text-slate-900">
              {activeTab === "clients" && `Manajemen Klien & Undangan (${clients.length})`}
              {activeTab === "themes" && `Katalog Desain Template (${themes.length})`}
              {activeTab === "cms" && "Konten Website, Hero & Live Showcase"}
              {activeTab === "pricing" && "Pengaturan Paket Harga & Live Preview"}
              {activeTab === "maintenance" && "Mode Pemeliharaan & Darurat"}
              {activeTab === "features" && "Saklar Fitur Platform (Feature Flags)"}
              {activeTab === "gateway" && "Gateway Pembayaran & QRIS Toko"}
              {activeTab === "system" && "Kesehatan Database & Alat Pemeliharaan"}
              {activeTab === "roles" && "Pengaturan Hak Akses & Peran Pengguna"}
            </span>
          </div>

          <button
            onClick={() => void fetchAllData(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#F97316]" : "text-slate-500"}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>
      )}

      {/* TAB 1: MANAJEMEN KLIEN */}
      {activeTab === "clients" && (
        <div className="space-y-4">
          {/* Quick Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                  : "bg-white text-slate-600 border-[#E2E8F0] hover:bg-slate-50"
              }`}
            >
              Semua Klien ({clients.length})
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "ACTIVE"
                  ? "bg-[#F97316] text-white border-[#F97316] shadow-2xs"
                  : "bg-white text-slate-600 border-[#E2E8F0] hover:bg-slate-50"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${statusFilter === "ACTIVE" ? "bg-white" : "bg-emerald-500"}`}></span>
              <span>Undangan Aktif ({clients.filter((c) => c.invitation?.status === "ACTIVE").length})</span>
            </button>
            <button
              onClick={() => setStatusFilter("NO_INVITATION")}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                statusFilter === "NO_INVITATION"
                  ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                  : "bg-white text-slate-600 border-[#E2E8F0] hover:bg-slate-50"
              }`}
            >
              Belum Buat Undangan ({clients.filter((c) => !c.invitation).length})
            </button>
          </div>

          {/* Controls: Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, email, atau slug..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 whitespace-nowrap">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-700 focus:outline-none focus:border-[#F97316] shadow-xs cursor-pointer"
              >
                <option value="ALL">Semua Status ({clients.length})</option>
                <option value="ACTIVE">Aktif &amp; Tayang ({clients.filter((c) => c.invitation?.status === "ACTIVE").length})</option>
                <option value="EXPIRED">Expired ({clients.filter((c) => c.invitation?.status === "EXPIRED").length})</option>
                <option value="INACTIVE">Nonaktif ({clients.filter((c) => c.invitation?.status === "INACTIVE").length})</option>
                <option value="NO_INVITATION">Belum Buat Undangan ({clients.filter((c) => !c.invitation).length})</option>
              </select>
            </div>
          </div>

          {/* Clients Table */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E2E8F0] bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Pengantin</th>
                    <th className="py-3 px-4">Subdomain / Slug</th>
                    <th className="py-3 px-4">Paket</th>
                    <th className="py-3 px-4">Masa Aktif</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Tidak ada klien yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => {
                      const inv = client.invitation;
                      return (
                        <tr key={client.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{client.name}</div>
                            <div className="text-[11px] text-slate-500">{client.email}</div>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            {inv ? (
                              <a
                                href={`/invitation/${inv.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#F97316] hover:underline inline-flex items-center gap-1"
                              >
                                <span>/{inv.slug}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {inv ? (
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  inv.tier === "ULTIMATE"
                                    ? "bg-orange-50 text-[#F97316] border border-orange-200"
                                    : inv.tier === "ELEGANT"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : inv.tier === "STARTER"
                                    ? "bg-slate-100 text-slate-700 border border-[#E2E8F0]"
                                    : inv.tier === "FREE"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-50 text-slate-500 border border-[#E2E8F0]"
                                }`}
                              >
                                {inv.tier}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Belum Ada Undangan</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-[11px] text-slate-500">
                            {(() => {
                              if (!inv?.activeUntil) {
                                return (
                                  <span className="text-slate-400">
                                    {inv?.status === "ACTIVE" ? "Aktif" : "Belum Berlangganan"}
                                  </span>
                                );
                              }
                              const d = new Date(inv.activeUntil);
                              const now = new Date();
                              if (d.getFullYear() - now.getFullYear() > 20) {
                                return (
                                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[10px]">
                                    Selamanya (Lifetime)
                                  </span>
                                );
                              }
                              return d.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              });
                            })()}
                          </td>

                          <td className="py-3.5 px-4">
                            {inv ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                  inv.status === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : inv.status === "EXPIRED"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                              >
                                {inv.status}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">No Draft</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingClient(client);
                                const validTiers = ["FREE", "STARTER", "ELEGANT", "ULTIMATE"];
                                const currentTier = inv?.tier;
                                if (currentTier && validTiers.includes(currentTier)) {
                                  setEditTier(currentTier);
                                } else {
                                  setEditTier("ELEGANT");
                                }
                                setEditIsActive(inv?.isActive ?? true);
                                setEditAddDays(0);
                                setEditIsLifetime(false);
                                setEditCustomDays("");
                              }}
                              className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
                              title={inv ? "Kelola Hak Akses & Paket" : "Beri Paket Langganan & Inisialisasi"}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {client.role !== "ADMIN" && (
                              <button
                                onClick={() => handleImpersonate(client.id)}
                                className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-blue-100 border border-orange-200 text-[#F97316] text-xs font-medium transition-colors inline-flex items-center gap-1"
                                title="Login sebagai Klien ini"
                              >
                                <LogIn className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-[10px]">Impersonate</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KATALOG TEMA */}
      {activeTab === "themes" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500">
                Katalog tema yang dapat dipilih langsung oleh pengantin tanpa kehilangan data.
              </p>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Sanity CMS Linked (CDN Aktif)
              </span>
            </div>
            <button
              onClick={() => {
                setEditingThemeId(null);
                setThemeForm({
                  themeKey: "",
                  name: "",
                  category: "Modern Chic",
                  thumbnail: "",
                  isPremium: false,
                  isActive: true,
                  features: ALL_FEATURES.map((f) => f.id),
                });
                setIsThemeModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tema Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden flex flex-col group hover:border-[#F97316]/40 transition-all shadow-xs"
              >
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={theme.thumbnail || "/images/placeholder-theme.jpg"}
                    alt={theme.name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/95 text-slate-700 border border-[#E2E8F0]">
                      {theme.category}
                    </span>
                    {theme.isPremium ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F97316] text-white">
                        PREMIUM
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-[#E2E8F0]">
                        FREE
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-sans font-semibold text-sm text-slate-900">{theme.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-slate-400">Key: {theme.themeKey}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {theme.features?.length ?? 10}/10 Fitur
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        theme.isActive ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {theme.isActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>{theme.isActive ? "Aktif di Katalog" : "Nonaktif"}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingThemeId(theme.id);
                          setThemeForm({
                            themeKey: theme.themeKey,
                            name: theme.name,
                            category: theme.category,
                            thumbnail: theme.thumbnail,
                            isPremium: theme.isPremium,
                            isActive: theme.isActive,
                            features: theme.features || ALL_FEATURES.map((f) => f.id),
                          });
                          setIsThemeModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-slate-600 text-xs"
                        title="Edit Tema"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTheme(theme.id, theme.name)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs"
                        title="Hapus Tema"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: KONTEN WEBSITE & SHOWCASE */}
      {activeTab === "cms" && (
        <AdminCmsContentTab
          settings={settings}
          onSaveSettings={handleSaveSettings}
          isSaving={isSavingSettings}
        />
      )}

      {/* TAB 4: PAKET HARGA & LIVE PREVIEW */}
      {activeTab === "pricing" && (
        <AdminPricingTab
          settings={settings}
          onSaveSettings={handleSaveSettings}
          isSaving={isSavingSettings}
        />
      )}

      {/* TAB 5: MODE PEMELIHARAAN */}
      {activeTab === "maintenance" && (
        <AdminMaintenanceModeTab
          settings={settings}
          onSaveSettings={handleSaveSettings}
          isSaving={isSavingSettings}
        />
      )}

      {/* TAB 6: SAKLAR FITUR (FEATURE FLAGS) */}
      {activeTab === "features" && (
        <AdminFeatureFlagsTab
          settings={settings}
          onSaveSettings={handleSaveSettings}
          isSaving={isSavingSettings}
        />
      )}

      {/* TAB 7: GATEWAY & QRIS */}
      {activeTab === "gateway" && (
        <AdminGatewayTab
          settings={settings}
          onSaveSettings={handleSaveSettings}
          isSaving={isSavingSettings}
        />
      )}

      {/* TAB 8: KESEHATAN & ALAT SISTEM */}
      {activeTab === "system" && (
        <AdminSystemToolsTab
          diagnostics={diagnostics}
          isLoadingDiagnostics={isLoadingDiagnostics}
          onRefreshDiagnostics={fetchDiagnostics}
        />
      )}

      {/* TAB 9: PENGATURAN HAK AKSES PENGGUNA */}
      {activeTab === "roles" && (
        <AdminUserRolesTab
          onNotify={(type, msg) => setFeedback({ type, msg })}
        />
      )}

      {/* MODAL: EDIT CLIENT / GRANT ACCESS & SUBSCRIPTION */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl bg-white border border-[#E2E8F0] p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sans font-bold text-base text-slate-900">Kelola Langganan &amp; Hak Akses</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-[#F97316] border border-orange-200">
                    Super Admin Override
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingClient.name} &bull; {editingClient.email}
                </p>
              </div>
              <button
                onClick={() => setEditingClient(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Status Saat Ini */}
              <div className="p-3 bg-slate-50 rounded-lg border border-[#E2E8F0] grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Paket Saat Ini</span>
                  <span className="font-bold text-slate-800 text-[11px]">
                    {editingClient.invitation?.tier || "Belum Ada"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status Undangan</span>
                  <span className={`font-bold text-[11px] ${editingClient.invitation?.status === "ACTIVE" ? "text-emerald-600" : "text-slate-600"}`}>
                    {editingClient.invitation?.status || "NO_INVITATION"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Masa Aktif</span>
                  <span className="font-semibold text-slate-700 text-[11px]">
                    {editingClient.invitation?.activeUntil
                      ? new Date(editingClient.invitation.activeUntil).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Belum Ada"}
                  </span>
                </div>
              </div>

              {/* Tier Selection */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-800 flex items-center justify-between">
                  <span>Pilih Paket Langganan:</span>
                  <span className="text-[11px] font-normal text-slate-500">Bebas diberikan oleh Super Admin</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: "ULTIMATE",
                      name: "Ultimate (VIP)",
                      price: "Rp 279.000",
                      badge: "Fitur Lengkap",
                      desc: "Tamu tak terbatas & semua tema",
                    },
                    {
                      id: "ELEGANT",
                      name: "Elegant",
                      price: "Rp 149.000",
                      badge: "Populer",
                      desc: "Musik, galeri, RSVP & story",
                    },
                    {
                      id: "STARTER",
                      name: "Starter",
                      price: "Rp 39.000",
                      badge: "Esensial",
                      desc: "Undangan dasar standar",
                    },
                    {
                      id: "FREE",
                      name: "Free / Trial",
                      price: "Rp 0",
                      badge: "Trial",
                      desc: "Akses uji coba gratis",
                    },
                  ].map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setEditTier(pkg.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all relative ${
                        editTier === pkg.id
                          ? "border-[#F97316] bg-orange-50/50 shadow-xs"
                          : "border-[#E2E8F0] bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{pkg.name}</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0] text-slate-600">
                          {pkg.badge}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-through mt-0.5">{pkg.price}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Gratis (Super Admin Override)</div>
                    </button>
                  ))}
                </div>

                {/* Reset Option */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setEditTier("RESET")}
                    className={`w-full py-1.5 px-3 rounded-lg border text-xs font-medium transition-colors text-center ${
                      editTier === "RESET"
                        ? "bg-rose-50 border-rose-300 text-rose-700 font-bold"
                        : "bg-white border-[#E2E8F0] text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Cabut / Reset Paket (Kembalikan ke Belum Berlangganan)
                  </button>
                </div>
              </div>

              {/* Add Validity Days / Lifetime */}
              {editTier !== "RESET" && (
                <div className="space-y-2">
                  <label className="font-semibold text-slate-800 flex items-center justify-between">
                    <span>Masa Aktif Undangan:</span>
                    <span className="text-[11px] font-normal text-slate-500">Tentukan masa berlaku</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Tetap (0 Hari)", days: 0, isLife: false },
                      { label: "+30 Hari", days: 30, isLife: false },
                      { label: "+90 Hari", days: 90, isLife: false },
                      { label: "+365 Hari (1 Thn)", days: 365, isLife: false },
                      { label: "👑 Selamanya (Lifetime)", days: 36500, isLife: true },
                    ].map((btn) => {
                      const isSelected = btn.isLife ? editIsLifetime : (!editIsLifetime && editAddDays === btn.days && !editCustomDays);
                      return (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => {
                            setEditIsLifetime(btn.isLife);
                            setEditAddDays(btn.days);
                            setEditCustomDays("");
                          }}
                          className={`py-2 px-2 rounded-lg text-center font-medium border text-xs transition-colors ${
                            isSelected
                              ? "bg-orange-50 text-[#F97316] border-[#F97316] font-bold"
                              : "bg-white border-[#E2E8F0] text-slate-600 hover:bg-slate-50"
                          } ${btn.isLife ? "col-span-2" : ""}`}
                        >
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Days Input */}
                  {!editIsLifetime && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-slate-500 text-[11px] whitespace-nowrap">Atau tambah kustom hari:</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Contoh: 60"
                        value={editCustomDays}
                        onChange={(e) => {
                          setEditCustomDays(e.target.value);
                          setEditIsLifetime(false);
                        }}
                        className="w-24 py-1 px-2.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-800 text-xs focus:outline-none focus:border-[#F97316]"
                      />
                      <span className="text-slate-500 text-[11px]">hari tambahan</span>
                    </div>
                  )}
                </div>
              )}

              {/* Status Toggle */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-slate-800">Status Undangan:</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="isActive"
                      checked={editIsActive}
                      onChange={() => setEditIsActive(true)}
                      className="accent-[#F97316]"
                    />
                    <span>Aktif &amp; Terbuka untuk Tamu</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="isActive"
                      checked={!editIsActive}
                      onChange={() => setEditIsActive(false)}
                      className="accent-[#F97316]"
                    />
                    <span>Nonaktifkan (Tutup Sementara)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
              <p className="text-[11px] text-slate-400">
                Akses diberikan gratis instan oleh Super Admin.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  disabled={isSavingClient}
                  className="px-4 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveClientEdit}
                  disabled={isSavingClient}
                  className="px-4 py-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isSavingClient ? "Menyimpan..." : "Simpan Hak Akses"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT THEME */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form
            onSubmit={handleSaveTheme}
            className="w-full max-w-md rounded-xl bg-white border border-[#E2E8F0] p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-bold text-base text-slate-900">
                {editingThemeId ? "Edit Tema" : "Tambah Tema Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Theme Key (ID):</label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingThemeId)}
                  value={themeForm.themeKey}
                  onChange={(e) => setThemeForm({ ...themeForm, themeKey: e.target.value })}
                  placeholder="contoh: modern-gold"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 font-mono disabled:opacity-50 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Tema:</label>
                <input
                  type="text"
                  required
                  value={themeForm.name}
                  onChange={(e) => setThemeForm({ ...themeForm, name: e.target.value })}
                  placeholder="contoh: Modern Gold Luxury"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Kategori:</label>
                <select
                  value={themeForm.category}
                  onChange={(e) => setThemeForm({ ...themeForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-800 focus:outline-none focus:border-[#F97316]"
                >
                  <option value="Botanical">Botanical</option>
                  <option value="Editorial">Editorial</option>
                  <option value="Gothic">Gothic</option>
                  <option value="Royal">Royal</option>
                  <option value="3D">3D</option>
                  <option value="Modern Chic">Modern Chic</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">URL Gambar Thumbnail:</label>
                <input
                  type="url"
                  required
                  value={themeForm.thumbnail}
                  onChange={(e) => setThemeForm({ ...themeForm, thumbnail: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-900 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={themeForm.isPremium}
                    onChange={(e) =>
                      setThemeForm({ ...themeForm, isPremium: e.target.checked })
                    }
                  />
                  <span>Tema Premium (Berbayar)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={themeForm.isActive}
                    onChange={(e) => setThemeForm({ ...themeForm, isActive: e.target.checked })}
                  />
                  <span>Aktif di Katalog</span>
                </label>
              </div>

              {/* Checklist 10 Fitur Tema */}
              <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">
                    Fitur Aktif Template ({themeForm.features?.length ?? 0}/10):
                  </label>
                  <div className="flex gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() =>
                        setThemeForm({
                          ...themeForm,
                          features: ALL_FEATURES.map((f) => f.id),
                        })
                      }
                      className="text-[#F97316] hover:underline"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setThemeForm({ ...themeForm, features: [] })}
                      className="text-slate-500 hover:underline"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg border border-[#E2E8F0] bg-slate-50 max-h-44 overflow-y-auto">
                  {ALL_FEATURES.map((f) => {
                    const isChecked = themeForm.features?.includes(f.id);
                    return (
                      <label
                        key={f.id}
                        className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors text-[11px] ${
                          isChecked
                            ? "bg-white text-slate-800 font-medium shadow-2xs"
                            : "text-slate-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const cur = themeForm.features || [];
                            const next = e.target.checked
                              ? [...cur, f.id]
                              : cur.filter((id) => id !== f.id);
                            setThemeForm({ ...themeForm, features: next });
                          }}
                          className="accent-[#F97316]"
                        />
                        <span className="truncate">{f.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-xs"
              >
                {editingThemeId ? "Perbarui Tema" : "Tambah Tema"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function MasterAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">
          Memuat Pusat Kendali Admin...
        </div>
      }
    >
      <MasterAdminContent />
    </Suspense>
  );
}

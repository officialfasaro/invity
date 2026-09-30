"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  Eye,
  Heart,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";

export interface TransactionItem {
  id: string;
  orderId: string;
  amount: number;
  paymentType: "GATEWAY" | "MANUAL_QRIS" | "MANUAL_BANK";
  paymentStatus: "PENDING" | "WAITING_VERIFICATION" | "SETTLEMENT" | "EXPIRED" | "CANCELLED";
  tier: "FREE" | "STARTER" | "ELEGANT" | "ULTIMATE";
  proofImageUrl?: string | null;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  invitation?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export interface SalesAnalytics {
  totalAllTimeRevenue: number;
  monthlySettledRevenue: number;
  totalTransactionsCount: number;
  settledCount: number;
  waitingVerificationCount: number;
  pendingCount: number;
  expiredOrCancelledCount: number;
  tierBreakdown: Record<string, { count: number; totalAmount: number }>;
  methodBreakdown: Record<string, { count: number; totalAmount: number }>;
}

export interface MetricsData {
  totalUsers: number;
  totalActiveInvitations: number;
  pendingPaymentsCount: number;
  monthlyRevenue: number;
}

interface AdminOverviewTabProps {
  metrics: MetricsData | null;
  analytics: SalesAnalytics | null;
  transactions: TransactionItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  metrics,
  analytics,
  transactions,
  isLoading,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [previewProof, setPreviewProof] = useState<{ url: string; orderId: string; userName: string } | null>(null);

  // Format Currency IDR
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Format Date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      tx.orderId.toLowerCase().includes(q) ||
      tx.user.name.toLowerCase().includes(q) ||
      tx.user.email.toLowerCase().includes(q) ||
      Boolean(tx.invitation?.title?.toLowerCase().includes(q)) ||
      Boolean(tx.invitation?.slug?.toLowerCase().includes(q));

    const matchStatus = statusFilter === "ALL" || tx.paymentStatus === statusFilter;
    const matchTier = tierFilter === "ALL" || tx.tier === tierFilter;

    return matchSearch && matchStatus && matchTier;
  });

  const totalRevenue = analytics?.totalAllTimeRevenue ?? 0;
  const starterAmount = analytics?.tierBreakdown?.STARTER?.totalAmount ?? 0;
  const elegantAmount = analytics?.tierBreakdown?.ELEGANT?.totalAmount ?? 0;
  const ultimateAmount = analytics?.tierBreakdown?.ULTIMATE?.totalAmount ?? 0;

  const starterCount = analytics?.tierBreakdown?.STARTER?.count ?? 0;
  const elegantCount = analytics?.tierBreakdown?.ELEGANT?.count ?? 0;
  const ultimateCount = analytics?.tierBreakdown?.ULTIMATE?.count ?? 0;
  const totalSettledCount = analytics?.settledCount || 1; // avoid divide by zero

  const starterPct = Math.round((starterCount / totalSettledCount) * 100);
  const elegantPct = Math.round((elegantCount / totalSettledCount) * 100);
  const ultimatePct = Math.round((ultimateCount / totalSettledCount) * 100);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-sans font-bold text-slate-900 tracking-tight">
              Pusat Kendali Super Admin &amp; Analisa Penjualan
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-[#F97316] border border-orange-200">
              LIVE MONITOR
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau pertumbuhan pengguna, analisa omset transaksi paket undangan, dan riwayat pembayaran platform.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#F97316]" : "text-slate-500"}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. Executive Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Users */}
        <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Pengguna</span>
            <div className="p-2 rounded-lg bg-orange-50 text-[#F97316]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-sans text-slate-900 tracking-tight">
            {metrics?.totalUsers ?? 0}
          </p>
          <p className="text-[11px] text-slate-500">Akun terdaftar dalam database</p>
        </div>

        {/* Card 2: Active Invitations */}
        <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Undangan Aktif</span>
            <div className="p-2 rounded-lg bg-orange-50 text-[#F97316]">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-sans text-slate-900 tracking-tight">
            {metrics?.totalActiveInvitations ?? 0}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">Status tayang &amp; siap diakses tamu</p>
        </div>

        {/* Card 3: Monthly Revenue */}
        <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Omset Bulan Ini</span>
            <div className="p-2 rounded-lg bg-orange-50 text-[#F97316]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-sans text-slate-900 tracking-tight">
            {formatIDR(metrics?.monthlyRevenue ?? analytics?.monthlySettledRevenue ?? 0)}
          </p>
          <p className="text-[11px] text-slate-500">Settlement bulan berjalan</p>
        </div>

        {/* Card 4: Total Revenue All-Time */}
        <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Omset Kumulatif</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-sans text-slate-900 tracking-tight">
            {formatIDR(totalRevenue)}
          </p>
          <p className="text-[11px] text-slate-500">Total settlement sepanjang masa</p>
        </div>

        {/* Card 5: Verification Queue */}
        <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Antrean Verifikasi</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-sans text-slate-900 tracking-tight">
            {metrics?.pendingPaymentsCount ?? analytics?.waitingVerificationCount ?? 0}
          </p>
          <Link
            href="/admin/verifikasi-manual"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F97316] hover:underline"
          >
            <span>Buka Halaman Verifikasi</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 3. Section: Analisa Penjualan Paket & Metode Pembayaran */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Kolom 1 & 2: Breakdown Performa Paket */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#F97316]" />
                <span>Analisa Penjualan Berdasarkan Paket</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rincian transaksi berhasil (settlement) untuk tiap tingkatan langganan.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-600">
              Total Lunas: {analytics?.settledCount ?? 0} Pesanan
            </span>
          </div>

          <div className="space-y-4">
            {/* Paket Starter */}
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    PAKET STARTER
                  </span>
                  <span className="text-xs text-slate-600 font-medium">{starterCount} Terjual</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">{formatIDR(starterAmount)}</span>
                  <span className="text-[11px] text-slate-500 ml-2">({starterPct}%)</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(starterPct, 100)}%` }}
                />
              </div>
            </div>

            {/* Paket Elegant */}
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    PAKET ELEGANT
                  </span>
                  <span className="text-xs text-slate-600 font-medium">{elegantCount} Terjual</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">{formatIDR(elegantAmount)}</span>
                  <span className="text-[11px] text-slate-500 ml-2">({elegantPct}%)</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(elegantPct, 100)}%` }}
                />
              </div>
            </div>

            {/* Paket Ultimate */}
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    PAKET ULTIMATE
                  </span>
                  <span className="text-xs text-slate-600 font-medium">{ultimateCount} Terjual</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">{formatIDR(ultimateAmount)}</span>
                  <span className="text-[11px] text-slate-500 ml-2">({ultimatePct}%)</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(ultimatePct, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kolom 3: Metode Bayar & Distribusi Status */}
        <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#F97316]" />
              <span>Metode Pembayaran</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Sebaran saluran pembayaran pelanggan</p>
          </div>

          <div className="space-y-3">
            {/* Gateway Midtrans */}
            <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-blue-50 text-blue-600">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Midtrans Gateway</div>
                  <div className="text-[11px] text-slate-500">
                    {analytics?.methodBreakdown?.GATEWAY?.count ?? 0} Transaksi Lunas
                  </div>
                </div>
              </div>
              <div className="text-right text-xs font-bold text-slate-900">
                {formatIDR(analytics?.methodBreakdown?.GATEWAY?.totalAmount ?? 0)}
              </div>
            </div>

            {/* QRIS Toko */}
            <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-orange-50 text-[#F97316]">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">QRIS Toko</div>
                  <div className="text-[11px] text-slate-500">
                    {analytics?.methodBreakdown?.MANUAL_QRIS?.count ?? 0} Transaksi Lunas
                  </div>
                </div>
              </div>
              <div className="text-right text-xs font-bold text-slate-900">
                {formatIDR(analytics?.methodBreakdown?.MANUAL_QRIS?.totalAmount ?? 0)}
              </div>
            </div>

            {/* Transfer Bank Manual */}
            <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-emerald-50 text-emerald-600">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Transfer Bank Manual</div>
                  <div className="text-[11px] text-slate-500">
                    {analytics?.methodBreakdown?.MANUAL_BANK?.count ?? 0} Transaksi Lunas
                  </div>
                </div>
              </div>
              <div className="text-right text-xs font-bold text-slate-900">
                {formatIDR(analytics?.methodBreakdown?.MANUAL_BANK?.totalAmount ?? 0)}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-50">
              <div className="text-slate-500 text-[10px]">Menunggu Verifikasi</div>
              <div className="font-bold text-amber-600 text-sm">
                {analytics?.waitingVerificationCount ?? 0}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <div className="text-slate-500 text-[10px]">Pending (Belum Bayar)</div>
              <div className="font-bold text-slate-700 text-sm">
                {analytics?.pendingCount ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section: Riwayat Transaksi & Informasi Pembayaran (Requirement 3) */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F97316]" />
              <span>Riwayat Informasi Pembayaran Master Admin</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar seluruh transaksi pembayaran, verifikasi struk transfer, dan status langganan.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Menampilkan <strong>{filteredTransactions.length}</strong> transaksi
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. Order, Nama Pelanggan, Email, atau Subdomain..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-xs text-slate-900 focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 rounded-lg border border-[#E2E8F0] bg-white text-xs text-slate-700 focus:border-[#F97316] outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="SETTLEMENT">Lunas (Settlement)</option>
              <option value="WAITING_VERIFICATION">Menunggu Verifikasi</option>
              <option value="PENDING">Pending (Belum Bayar)</option>
              <option value="CANCELLED">Dibatalkan</option>
              <option value="EXPIRED">Kadaluarsa</option>
            </select>

            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="py-2 px-3 rounded-lg border border-[#E2E8F0] bg-white text-xs text-slate-700 focus:border-[#F97316] outline-none cursor-pointer"
            >
              <option value="ALL">Semua Paket</option>
              <option value="STARTER">Starter</option>
              <option value="ELEGANT">Elegant</option>
              <option value="ULTIMATE">Ultimate</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-3.5">Order ID &amp; Tanggal</th>
                <th className="py-3 px-3.5">Pelanggan</th>
                <th className="py-3 px-3.5">Paket &amp; Undangan</th>
                <th className="py-3 px-3.5">Nominal</th>
                <th className="py-3 px-3.5">Metode</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-center">Bukti / Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                    Tidak ditemukan transaksi pembayaran yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-mono">
                      <div className="font-bold text-slate-900">{tx.orderId}</div>
                      <div className="text-[11px] text-slate-400 font-sans">{formatDate(tx.createdAt)}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900">{tx.user.name}</div>
                      <div className="text-[11px] text-slate-500">{tx.user.email}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            tx.tier === "ULTIMATE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : tx.tier === "ELEGANT"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {tx.tier}
                        </span>
                      </div>
                      {tx.invitation?.slug ? (
                        <a
                          href={`/${tx.invitation.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-slate-500 hover:text-[#F97316] inline-flex items-center gap-0.5 mt-0.5"
                        >
                          <span>/{tx.invitation.slug}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 block mt-0.5">&mdash;</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-900">
                      {formatIDR(tx.amount)}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="text-[11px] font-medium text-slate-600">
                        {tx.paymentType === "GATEWAY"
                          ? "Midtrans"
                          : tx.paymentType === "MANUAL_QRIS"
                          ? "QRIS Toko"
                          : "Transfer Bank"}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          tx.paymentStatus === "SETTLEMENT"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : tx.paymentStatus === "WAITING_VERIFICATION"
                            ? "bg-blue-50 text-blue-700 border border-blue-200 animate-pulse"
                            : tx.paymentStatus === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {tx.paymentStatus === "SETTLEMENT" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {tx.paymentStatus === "WAITING_VERIFICATION" && <Clock className="w-3 h-3 text-blue-600" />}
                        {tx.paymentStatus === "PENDING" && <Clock className="w-3 h-3 text-amber-600" />}
                        {tx.paymentStatus === "SETTLEMENT"
                          ? "Lunas"
                          : tx.paymentStatus === "WAITING_VERIFICATION"
                          ? "Perlu Verifikasi"
                          : tx.paymentStatus === "PENDING"
                          ? "Menunggu Bayar"
                          : tx.paymentStatus === "CANCELLED"
                          ? "Dibatalkan"
                          : "Expired"}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {tx.proofImageUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewProof({
                                url: tx.proofImageUrl!,
                                orderId: tx.orderId,
                                userName: tx.user.name,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Buka Struk Bukti Transfer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#F97316]" />
                            <span>Lihat Bukti</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">&mdash;</span>
                        )}

                        {tx.paymentStatus === "WAITING_VERIFICATION" && (
                          <Link
                            href="/admin/verifikasi-manual"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F97316] hover:bg-[#EA580C] text-white text-[11px] font-semibold transition-colors shadow-2xs"
                          >
                            <span>Proses</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal Popup Viewer Bukti Pembayaran */}
      {previewProof && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewProof(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0] bg-slate-50">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Bukti Transfer Pembayaran</h3>
                <p className="text-[11px] text-slate-500">
                  Order: <strong className="font-mono text-slate-800">{previewProof.orderId}</strong> &bull; {previewProof.userName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProof(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center bg-slate-100 min-h-[250px] max-h-[70vh] overflow-y-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewProof.url}
                alt="Bukti Struk Transfer"
                className="max-h-[65vh] w-auto object-contain rounded-lg border border-slate-200 shadow-xs"
              />
            </div>

            <div className="p-3.5 border-t border-[#E2E8F0] bg-white flex items-center justify-between">
              <a
                href={previewProof.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F97316] hover:underline"
              >
                <span>Buka Gambar Ukuran Asli</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <Link
                href="/admin/verifikasi-manual"
                className="px-3.5 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                Verifikasi Transaksi Ini
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

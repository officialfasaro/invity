"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Key,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";

export interface UserRoleItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  invitation: {
    id: string;
    title: string;
    slug: string;
    isActive: boolean;
    tier: string;
  } | null;
}

interface AdminUserRolesTabProps {
  onNotify?: (type: "success" | "error", message: string) => void;
}

export function AdminUserRolesTab({ onNotify }: AdminUserRolesTabProps) {
  const [users, setUsers] = useState<UserRoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");

  // Edit Role Modal State
  const [selectedUser, setSelectedUser] = useState<UserRoleItem | null>(null);
  const [targetRole, setTargetRole] = useState<"ADMIN" | "USER">("USER");
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchUsers = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users/role");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal memuat data hak akses pengguna");
      }
      setUsers(json.data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat pengguna";
      onNotify?.("error", msg);
    } finally {
      setIsLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchUsers();
  }, [fetchUsers]);

  const handleOpenEditModal = (user: UserRoleItem) => {
    setSelectedUser(user);
    setTargetRole(user.role);
    setErrorMsg(null);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setErrorMsg(null);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    if (selectedUser.role === targetRole) {
      handleCloseModal();
      return;
    }

    setIsUpdating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/users/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: targetRole,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal memperbarui hak akses");
      }

      onNotify?.("success", json.message || "Hak akses pengguna berhasil diperbarui");
      handleCloseModal();
      void fetchUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui hak akses";
      setErrorMsg(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filtered & Sorted Users: Master Admin at the very top (Root Admin first, then other admins), followed by regular users (newest first)
  const filteredUsers = users
    .filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.invitation && u.invitation.slug.toLowerCase().includes(q));

      if (!matchSearch) return false;
      if (roleFilter === "ALL") return true;
      return u.role === roleFilter;
    })
    .sort((a, b) => {
      if (a.email === "admin@admin.com") return -1;
      if (b.email === "admin@admin.com") return 1;

      if (a.role === "ADMIN" && b.role !== "ADMIN") return -1;
      if (b.role === "ADMIN" && a.role !== "ADMIN") return 1;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const totalRegularUsers = users.filter((u) => u.role === "USER").length;

  return (
    <div className="space-y-6">
      {/* 1. Header Information */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-50 text-[#F97316]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pengaturan Hak Akses &amp; Peran Pengguna
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tentukan dan kelola tingkat hak akses pengguna: Master Admin (kendali penuh platform) atau Klien / Pengguna Biasa.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => void fetchUsers(true)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer shrink-0 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#F97316]" : "text-slate-500"}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* 2. Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Pengguna</span>
            <span className="text-2xl font-bold text-slate-900 mt-0.5 block">{totalUsers}</span>
            <span className="text-[10px] text-slate-400">Terdaftar di sistem</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Master Admin</span>
            <span className="text-2xl font-bold text-[#F97316] mt-0.5 block">{totalAdmins}</span>
            <span className="text-[10px] text-[#F97316] font-semibold">Akses penuh /admin</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Pengguna Biasa (Klien)</span>
            <span className="text-2xl font-bold text-slate-700 mt-0.5 block">{totalRegularUsers}</span>
            <span className="text-[10px] text-slate-400">Akses klien /dashboard</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau email pengguna..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Filter Hak Akses:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "ALL" | "ADMIN" | "USER")}
            className="py-2 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-700 focus:outline-none focus:border-[#F97316] shadow-xs cursor-pointer"
          >
            <option value="ALL">Semua Hak Akses ({users.length})</option>
            <option value="ADMIN">Hanya Master Admin ({totalAdmins})</option>
            <option value="USER">Hanya Pengguna Biasa ({totalRegularUsers})</option>
          </select>
        </div>
      </div>

      {/* 4. User Table */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E2E8F0] bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Tanggal Daftar</th>
                <th className="py-3 px-4">Undangan &amp; Paket</th>
                <th className="py-3 px-4">Hak Akses Saat Ini</th>
                <th className="py-3 px-4 text-right">Aksi Hak Akses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isRootAdmin = user.email === "admin@admin.com";
                  const isAdmin = user.role === "ADMIN";

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isAdmin
                                ? "bg-orange-100 text-[#F97316] border border-orange-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {user.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 truncate">
                                {user.name}
                              </span>
                              {isRootAdmin && (
                                <span className="text-[9.5px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                                  Root Super Admin
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Invitation & Tier */}
                      <td className="py-3.5 px-4">
                        {user.invitation ? (
                          <div className="space-y-0.5">
                            <a
                              href={`/invitation/${user.invitation.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#F97316] hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                            >
                              <span>/{user.invitation.slug}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                            <div>
                              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                                {user.invitation.tier}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Belum membuat undangan</span>
                        )}
                      </td>

                      {/* Current Role Badge */}
                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-orange-50 text-[#F97316] border border-orange-200 shadow-2xs">
                            <Shield className="w-3 h-3 fill-current" />
                            <span>Master Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <User className="w-3 h-3 text-slate-500" />
                            <span>Pengguna Biasa</span>
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        {isRootAdmin ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 text-xs cursor-not-allowed border border-slate-200"
                            title="Akun Root Super Admin terlindungi"
                          >
                            <Lock className="w-3 h-3" />
                            <span className="text-[10px]">Terkunci (Root)</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-orange-50 hover:border-orange-200 hover:text-[#F97316] text-slate-700 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Ubah Hak Akses</span>
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

      {/* 5. Modal: Ubah Hak Akses Pengguna */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center border border-orange-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Atur Hak Akses Pengguna
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Pilih peran dan wewenang untuk pengguna ini
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isUpdating}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Selected User Info Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {selectedUser.name}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {selectedUser.email}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Peran Saat Ini:</span>
                  <span className="text-[11px] font-bold text-slate-700">
                    {selectedUser.role === "ADMIN" ? "Master Admin" : "Pengguna Biasa"}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Role Options */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-700 block">
                  Pilih Hak Akses Baru:
                </span>

                {/* Option 1: Master Admin */}
                <label
                  onClick={() => setTargetRole("ADMIN")}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    targetRole === "ADMIN"
                      ? "border-[#F97316] bg-orange-50/50 shadow-xs"
                      : "border-[#E2E8F0] bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="targetRole"
                    value="ADMIN"
                    checked={targetRole === "ADMIN"}
                    onChange={() => setTargetRole("ADMIN")}
                    className="mt-0.5 text-[#F97316] focus:ring-[#F97316] cursor-pointer"
                  />
                  <div className="space-y-1 text-xs min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        Master Admin (ADMIN)
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-orange-100 text-[#F97316]">
                        Akses Penuh
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Memiliki hak akses ke panel Master Admin (<code>/admin</code>), dapat mengelola seluruh klien, melakukan verifikasi transaksi manual, mengubah harga &amp; tema, mengatur saklar fitur, dan mengelola hak akses user lain.
                    </p>
                  </div>
                </label>

                {/* Option 2: Regular User */}
                <label
                  onClick={() => setTargetRole("USER")}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    targetRole === "USER"
                      ? "border-[#F97316] bg-orange-50/50 shadow-xs"
                      : "border-[#E2E8F0] bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="targetRole"
                    value="USER"
                    checked={targetRole === "USER"}
                    onChange={() => setTargetRole("USER")}
                    className="mt-0.5 text-[#F97316] focus:ring-[#F97316] cursor-pointer"
                  />
                  <div className="space-y-1 text-xs min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        Pengguna Biasa (USER)
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-slate-100 text-slate-600">
                        Klien Standar
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Hanya memiliki hak akses ke panel klien (<code>/dashboard</code>) untuk membuat dan mengelola undangan pribadi. Tidak memiliki hak akses ke menu administrasi master admin.
                    </p>
                  </div>
                </label>
              </div>

              {/* Notice Banner */}
              {targetRole === "ADMIN" && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Penting:</strong> Memberikan hak akses Admin memberikan kuasa penuh atas data pengguna dan konfigurasi finansial platform. Pastikan pengguna ini terpercaya.
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[#E2E8F0] bg-slate-50/50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F97316] hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Simpan Hak Akses</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

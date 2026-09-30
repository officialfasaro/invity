"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Edit3,
  ExternalLink,
  Lock,
  Palette,
  Save,
  Sparkles,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import MobileTopBar from "./MobileTopBar";
import MobileBottomNav, { AdminTabId } from "./MobileBottomNav";
import ContentEditorTab from "./tabs/ContentEditorTab";
import ThemeSelectorTab from "./tabs/ThemeSelectorTab";
import GuestBookTab, { GuestItem } from "./tabs/GuestBookTab";
import RsvpRecapTab, { RsvpRecapData, WishItem } from "./tabs/RsvpRecapTab";
import BillingUpgradeTab from "./tabs/BillingUpgradeTab";
import ThemeRenderer from "@/components/templates/ThemeRenderer";
import DeviceFrame from "@/components/templates/device/DeviceFrame";
import { ThemeId, WeddingInvitationData } from "@/types/wedding";

export default function UserAdminPanel() {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTabId>("editor");

  // Loading & Saving States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // User Auth & Session
  const [userEmail, setUserEmail] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeUntil, setActiveUntil] = useState<string | null>(null);

  // Invitation General States
  const [invitationId, setInvitationId] = useState<string>("");
  const [title, setTitle] = useState("Pernikahan Mempelai");
  const [slug, setSlug] = useState("mempelai");
  const [themeId, setThemeId] = useState<ThemeId>("minimalist");
  const [isActive, setIsActive] = useState(true);
  const [tier, setTier] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);

  // Couple Info
  const [groomName, setGroomName] = useState("");
  const [groomNickname, setGroomNickname] = useState("");
  const [groomFather, setGroomFather] = useState("");
  const [groomMother, setGroomMother] = useState("");
  const [groomInstagram, setGroomInstagram] = useState("");
  const [groomPhoto, setGroomPhoto] = useState("");

  const [brideName, setBrideName] = useState("");
  const [brideNickname, setBrideNickname] = useState("");
  const [brideFather, setBrideFather] = useState("");
  const [brideMother, setBrideMother] = useState("");
  const [brideInstagram, setBrideInstagram] = useState("");
  const [bridePhoto, setBridePhoto] = useState("");
  const [greetingMessage, setGreetingMessage] = useState("");
  const [desktopCoverImage, setDesktopCoverImage] = useState("");
  const [useVideoAsDesktopCover, setUseVideoAsDesktopCover] = useState(false);

  // Schedules
  const [schedules, setSchedules] = useState<
    Array<{
      id?: string;
      eventName: string;
      date: string;
      startTime: string;
      endTime: string;
      venueName: string;
      address: string;
      mapsUrl: string;
    }>
  >([]);

  // Galleries & Media
  const [galleries, setGalleries] = useState<
    Array<{ imageUrl: string; caption: string; sortOrder: number }>
  >([]);
  const [musicUrl, setMusicUrl] = useState<string>("");
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState<string>("");

  // Bank Accounts
  const [bankAccounts, setBankAccounts] = useState<
    Array<{
      id?: string;
      bankName: string;
      accountNumber: string;
      accountHolder: string;
      qrisImageUrl?: string;
    }>
  >([]);

  // Stories
  const [stories, setStories] = useState<
    Array<{ date: string; title: string; story: string; imageUrl?: string }>
  >([]);

  // Guests & RSVPs
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [rsvpRecap, setRsvpRecap] = useState<RsvpRecapData | null>(null);
  const [wishes, setWishes] = useState<WishItem[]>([]);

  // Load Dashboard Data
  const loadDashboardData = useCallback(async (showIndicator = false) => {
    try {
      if (showIndicator) {
        setIsLoading(true);
      }
      const [resInv, resGuests, resRsvp] = await Promise.all([
        fetch("/api/dashboard/invitation"),
        fetch("/api/dashboard/guests"),
        fetch("/api/dashboard/rsvp-recap"),
      ]);

      if (resInv.ok) {
        const json = await resInv.json();
        const data = json.data;
        if (data) {
          setInvitationId(data.id || "");
          setTitle(data.title || "Pernikahan Mempelai");
          setSlug(data.slug || "mempelai");
          setThemeId((data.themeId as ThemeId) || "minimalist");
          setIsActive(data.isActive !== undefined ? data.isActive : true);
          const incomingTier = (data.tier as string) || null;
          setTier(incomingTier);
          const incomingIsPaid = Boolean(data.isPaid);
          setIsPaid(incomingIsPaid);
          setUserEmail(data.userEmail || "");
          setIsAdmin(Boolean(data.isAdmin || data.userEmail === "admin@admin.com"));
          setActiveUntil(data.activeUntil || null);

          const c = data.coupleInfo || {};
          setGroomName(c.groomName || "");
          setGroomNickname(c.groomNickname || "");
          setGroomFather(c.groomFather || "");
          setGroomMother(c.groomMother || "");
          setGroomInstagram(c.groomInstagram || "");
          setGroomPhoto(c.groomPhoto || "");

          setBrideName(c.brideName || "");
          setBrideNickname(c.brideNickname || "");
          setBrideFather(c.brideFather || "");
          setBrideMother(c.brideMother || "");
          setBrideInstagram(c.brideInstagram || "");
          setBridePhoto(c.bridePhoto || "");
          setGreetingMessage(c.greetingMessage || "");
          setDesktopCoverImage(c.desktopCoverImage || "");
          setUseVideoAsDesktopCover(Boolean(c.useVideoAsDesktopCover));
          setStories(Array.isArray(c.stories) ? c.stories : []);

          setMusicUrl(data.musicUrl || c.musicUrl || "");
          setYoutubeVideoUrl(data.youtubeVideoUrl || c.youtubeVideoUrl || "");

          if (Array.isArray(data.eventSchedules)) {
            setSchedules(
              data.eventSchedules.map((s: {
                id?: string;
                eventName: string;
                date: string | Date;
                startTime: string;
                endTime?: string | null;
                venueName: string;
                address: string;
                mapsUrl?: string | null;
              }) => ({
                id: s.id,
                eventName: s.eventName,
                date: typeof s.date === "string" ? s.date : new Date(s.date).toISOString().split("T")[0],
                startTime: s.startTime || "08:00",
                endTime: s.endTime || "10:00",
                venueName: s.venueName || "",
                address: s.address || "",
                mapsUrl: s.mapsUrl || "",
              }))
            );
          }

          if (Array.isArray(data.galleries)) {
            setGalleries(
              data.galleries.map((g: { imageUrl: string; caption?: string | null; sortOrder: number }) => ({
                imageUrl: g.imageUrl,
                caption: g.caption || "",
                sortOrder: g.sortOrder || 0,
              }))
            );
          }

          if (Array.isArray(data.bankAccounts)) {
            setBankAccounts(
              data.bankAccounts.map((b: {
                id?: string;
                bankName: string;
                accountNumber: string;
                accountHolder: string;
                qrisImageUrl?: string | null;
              }) => ({
                id: b.id,
                bankName: b.bankName,
                accountNumber: b.accountNumber,
                accountHolder: b.accountHolder,
                qrisImageUrl: b.qrisImageUrl || undefined,
              }))
            );
          }

          if (Array.isArray(data.wishes)) {
            setWishes(data.wishes);
          }
        }
      }

      if (resGuests.ok) {
        const json = await resGuests.json();
        setGuests(json.data?.guests || []);
      }

      if (resRsvp.ok) {
        const json = await resRsvp.json();
        setRsvpRecap(json.data || null);
      }
    } catch {
      setNotification({
        type: "error",
        message: "Gagal memuat data undangan. Silakan periksa koneksi internet Anda.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        await loadDashboardData();
      } catch {
        // Handled in loadDashboardData
      }
    };

    if (isMounted) {
      void fetchInitialData();
    }

    return () => {
      isMounted = false;
    };
  }, [loadDashboardData]);

  // Handle Save Invitation
  const handleSaveInvitation = async () => {
    if (!isPaid && !isAdmin) {
      setNotification({
        type: "error",
        message: "Akun Anda belum memiliki paket aktif. Silakan pilih dan aktifkan paket di menu Langganan & Paket untuk menyimpan perubahan.",
      });
      return;
    }

    if (!groomNickname.trim() || !brideNickname.trim()) {
      setNotification({
        type: "error",
        message: "Nama panggilan mempelai pria dan wanita wajib diisi — nama panggilan digunakan untuk tautan undangan.",
      });
      setActiveTab("editor");
      return;
    }

    setIsSaving(true);
    setNotification(null);

    const payload = {
      title,
      slug,
      themeId,
      isActive,
      musicUrl: musicUrl || undefined,
      youtubeVideoUrl: youtubeVideoUrl || undefined,
      coupleInfo: {
        groomName,
        groomNickname,
        groomFather: groomFather || undefined,
        groomMother: groomMother || undefined,
        groomInstagram: groomInstagram || undefined,
        groomPhoto: groomPhoto || undefined,
        brideName,
        brideNickname,
        brideFather: brideFather || undefined,
        brideMother: brideMother || undefined,
        brideInstagram: brideInstagram || undefined,
        bridePhoto: bridePhoto || undefined,
        greetingMessage: greetingMessage || undefined,
        desktopCoverImage: desktopCoverImage || undefined,
        useVideoAsDesktopCover: Boolean(useVideoAsDesktopCover),
        stories:
          stories.length > 0
            ? stories.map((s) => ({
                date: s.date,
                title: s.title,
                story: s.story,
                imageUrl:
                  tier === "STARTER" && !isAdmin
                    ? undefined
                    : s.imageUrl?.trim() || undefined,
              }))
            : undefined,
        musicUrl: musicUrl || undefined,
        youtubeVideoUrl: youtubeVideoUrl || undefined,
      },
      schedules: schedules.map((s) => ({
        eventName: s.eventName,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime || undefined,
        venueName: s.venueName,
        address: s.address,
        mapsUrl: s.mapsUrl || undefined,
      })),
      eventSchedules: schedules.map((s) => ({
        eventName: s.eventName,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime || undefined,
        venueName: s.venueName,
        address: s.address,
        mapsUrl: s.mapsUrl || undefined,
      })),
      galleries: galleries
        .filter((g) => g.imageUrl && g.imageUrl.trim() !== "")
        .map((g, idx) => ({
          imageUrl: g.imageUrl.trim(),
          caption: g.caption || undefined,
          sortOrder: idx,
        })),
      bankAccounts: bankAccounts
        .filter(
          (b) =>
            b.bankName &&
            (b.accountNumber.trim() !== "" || b.accountHolder.trim() !== "")
        )
        .map((b) => ({
          bankName: b.bankName,
          accountNumber: b.accountNumber.trim(),
          accountHolder: b.accountHolder.trim(),
          qrisImageUrl:
            tier === "STARTER" && !isAdmin
              ? undefined
              : b.qrisImageUrl || undefined,
        })),
    };

    try {
      const res = await fetch("/api/dashboard/invitation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan undangan");
      }

      setNotification({
        type: "success",
        message: "Perubahan undangan berhasil disimpan & langsung aktif di website!",
      });
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Guest Handlers
  const handleAddGuest = async (guestName: string, phone: string, guestQuota: number) => {
    try {
      const res = await fetch("/api/dashboard/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: guestName,
          phoneNumber: phone || undefined,
          quota: guestQuota,
        }),
      });

      if (!res.ok) throw new Error("Gagal menambah tamu");
      const json = await res.json();
      if (json.data) {
        setGuests((prev) => [...prev, json.data]);
        setNotification({
          type: "success",
          message: `Tamu "${guestName}" berhasil ditambahkan!`,
        });
        return true;
      }
      return false;
    } catch {
      setNotification({
        type: "error",
        message: "Gagal menambahkan tamu baru.",
      });
      return false;
    }
  };

  const handleBulkAddGuests = async (
    guestList: Array<{ name: string; phoneNumber?: string; quota?: number }>
  ) => {
    try {
      const res = await fetch("/api/dashboard/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: guestList }),
      });

      if (!res.ok) throw new Error("Gagal mengimpor daftar tamu");
      const json = await res.json();
      if (Array.isArray(json.data)) {
        setGuests((prev) => [...prev, ...json.data.filter(Boolean)]);
        setNotification({
          type: "success",
          message: `Berhasil mengimpor ${json.data.length} tamu!`,
        });
        return true;
      }
      return false;
    } catch {
      setNotification({
        type: "error",
        message: "Gagal mengimpor tamu.",
      });
      return false;
    }
  };

  const handleDeleteGuest = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/guests?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus tamu");
      setGuests((prev) => prev.filter((g) => g.id !== id));
      setNotification({
        type: "success",
        message: "Tamu berhasil dihapus.",
      });
      return true;
    } catch {
      setNotification({
        type: "error",
        message: "Gagal menghapus tamu.",
      });
      return false;
    }
  };

  const handleUpdateGuest = async (id: string, guestName: string, phone: string, guestQuota: number) => {
    try {
      const res = await fetch("/api/dashboard/guests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: guestName,
          phoneNumber: phone || null,
          quota: guestQuota,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memperbarui tamu");
      }

      setGuests((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                name: guestName,
                phoneNumber: phone || null,
                quota: guestQuota,
              }
            : g
        )
      );

      setNotification({
        type: "success",
        message: `Data tamu "${guestName}" berhasil diperbarui.`,
      });
      return true;
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal memperbarui tamu.",
      });
      return false;
    }
  };

  // Toggle Check-in Handler
  const handleToggleCheckin = async (id: string, action?: "checkin" | "undo") => {
    try {
      const res = await fetch("/api/dashboard/guests/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengubah status check-in");

      setGuests((prev) =>
        prev.map((g) => (g.id === id ? { ...g, checkedInAt: json.data.checkedInAt } : g))
      );
      setNotification({
        type: "success",
        message: json.message,
      });
      return true;
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal mengubah status check-in",
      });
      return false;
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  // Data for Live Simulation
  const previewData: WeddingInvitationData = {
    id: invitationId || "preview",
    slug,
    title,
    themeId,
    coupleInfo: {
      groomName: groomName || "Mempelai Pria",
      groomNickname: groomNickname || groomName || "Pria",
      groomFather: groomFather || undefined,
      groomMother: groomMother || undefined,
      groomInstagram: groomInstagram || undefined,
      groomPhoto: groomPhoto || undefined,
      brideName: brideName || "Mempelai Wanita",
      brideNickname: brideNickname || brideName || "Wanita",
      brideFather: brideFather || undefined,
      brideMother: brideMother || undefined,
      brideInstagram: brideInstagram || undefined,
      bridePhoto: bridePhoto || undefined,
      greetingMessage,
      desktopCoverImage: desktopCoverImage || undefined,
      useVideoAsDesktopCover: Boolean(useVideoAsDesktopCover),
      stories,
    },
    isActive,
    eventSchedules: schedules.length > 0 ? schedules : [
      {
        eventName: "Akad Nikah",
        date: "2026-10-24T08:00:00.000Z",
        startTime: "08:00",
        endTime: "10:00",
        venueName: "Masjid Agung Al-Falah",
        address: "Jl. Diponegoro No. 12, Surabaya",
        mapsUrl: "https://maps.google.com",
      },
    ],
    galleries: galleries.length > 0 ? galleries : [
      {
        imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
        caption: "Prewedding 1",
        sortOrder: 0,
      },
    ],
    bankAccounts: bankAccounts.length > 0 ? bankAccounts : [
      {
        bankName: "BCA",
        accountNumber: "8291039481",
        accountHolder: "Rian Pratama",
      },
    ],
    musicUrl,
  };

  const desktopTabs = [
    { id: "editor" as const, label: "Konten Undangan", icon: Edit3 },
    { id: "theme" as const, label: "Pilihan Tema", icon: Palette },
    { id: "guests" as const, label: `Buku Tamu (${guests.length})`, icon: Users },
    { id: "rsvp" as const, label: "Rekap RSVP", icon: UserCheck },
    { id: "billing" as const, label: "Langganan & Paket", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#F3F6FB] text-slate-900 flex flex-col font-sans pb-28 md:pb-12 selection:bg-[#F97316] selection:text-white">
      {/* 1. Mobile-First Top Bar */}
      <MobileTopBar
        title={title}
        slug={slug}
        tier={tier}
        isPaid={isPaid}
        isAdmin={isAdmin}
        userEmail={userEmail}
        activeUntil={activeUntil}
        isLoading={isLoading}
        onOpenPreview={() => setShowMobilePreview(true)}
        onLogout={handleLogout}
        onUpgradeClick={() => setActiveTab("billing")}
        onSelectPlanClick={() => setActiveTab("billing")}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-5 w-full space-y-5">
        {/* Unpaid Package Alert Banner */}
        {tier && !isPaid && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F97316] shrink-0" />
              <span>
                Paket Anda: <strong className="text-amber-950">Paket {tier} (Menunggu Pembayaran)</strong>. Selesaikan pembayaran untuk mengaktifkan seluruh fitur dan masa aktif undangan.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("billing")}
              className="px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Bayar Sekarang
            </button>
          </div>
        )}

        {/* Unselected Plan Alert Banner */}
        {!tier && (
          <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F97316] shrink-0" />
              <span>
                Anda belum memilih paket undangan pernikahan. Silakan pilih paket untuk mulai mengaktifkan seluruh fitur.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("billing")}
              className="px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Pilih Paket Sekarang
            </button>
          </div>
        )}
        {/* Toast / Notification Banner */}
        {notification && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium border flex items-center justify-between gap-3 shadow-xs animate-in fade-in ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Starter Tier Notice Banner */}
        {(tier === "STARTER" || tier === "FREE") && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F97316] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                  <span>Status: Paket Starter</span>
                  {activeUntil && (
                    <span className="text-[10px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                      Aktif s/d {new Date(activeUntil).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Paket Starter mencakup 1 tema (Clean Minimalist), maks. 10 foto galeri, dan 2 rekening bank. Mau aktifkan seluruh tema adat/luxury &amp; fitur tanpa batas?
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("billing")}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade Paket</span>
            </button>
          </div>
        )}

        {/* Desktop Navigation Tabs (Hidden on mobile) */}
        <div className="hidden md:flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-1.5">
            {desktopTabs.map((tab) => {
              const Icon = tab.icon;
              const isActiveTab = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold min-h-[40px] transition-colors ${
                    isActiveTab
                      ? "bg-[#F97316] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Save Button */}
          {activeTab === "editor" && (
            <button
              type="button"
              onClick={handleSaveInvitation}
              disabled={isSaving || (!isPaid && !isAdmin)}
              className={`inline-flex items-center gap-2 py-2 px-4 rounded-lg text-white text-xs font-semibold min-h-[40px] shadow-xs transition-colors ${
                !isPaid && !isAdmin
                  ? "bg-slate-400 cursor-not-allowed opacity-80"
                  : "bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 cursor-pointer"
              }`}
            >
              {!isPaid && !isAdmin ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Mode Pratinjau (Terkunci)</span>
                </>
              ) : (
                <>
                  <Save className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
                  <span>{isSaving ? "Menyimpan..." : "Simpan Undangan"}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Tab Content Display */}
        {activeTab === "editor" && (
          <ContentEditorTab
            tier={tier}
            onUpgradeClick={() => setActiveTab("billing")}
            isReadOnly={!isPaid && !isAdmin}
            title={title}
            setTitle={setTitle}
            slug={slug}
            setSlug={setSlug}
            groomName={groomName}
            setGroomName={setGroomName}
            groomNickname={groomNickname}
            setGroomNickname={setGroomNickname}
            groomFather={groomFather}
            setGroomFather={setGroomFather}
            groomMother={groomMother}
            setGroomMother={setGroomMother}
            groomInstagram={groomInstagram}
            setGroomInstagram={setGroomInstagram}
            groomPhoto={groomPhoto}
            setGroomPhoto={setGroomPhoto}
            brideName={brideName}
            setBrideName={setBrideName}
            brideNickname={brideNickname}
            setBrideNickname={setBrideNickname}
            brideFather={brideFather}
            setBrideFather={setBrideFather}
            brideMother={brideMother}
            setBrideMother={setBrideMother}
            brideInstagram={brideInstagram}
            setBrideInstagram={setBrideInstagram}
            bridePhoto={bridePhoto}
            setBridePhoto={setBridePhoto}
            greetingMessage={greetingMessage}
            setGreetingMessage={setGreetingMessage}
            desktopCoverImage={desktopCoverImage}
            setDesktopCoverImage={setDesktopCoverImage}
            useVideoAsDesktopCover={useVideoAsDesktopCover}
            setUseVideoAsDesktopCover={setUseVideoAsDesktopCover}
            schedules={schedules}
            setSchedules={setSchedules}
            galleries={galleries}
            setGalleries={setGalleries}
            musicUrl={musicUrl}
            setMusicUrl={setMusicUrl}
            youtubeVideoUrl={youtubeVideoUrl}
            setYoutubeVideoUrl={setYoutubeVideoUrl}
            bankAccounts={bankAccounts}
            setBankAccounts={setBankAccounts}
            stories={stories}
            setStories={setStories}
            onSave={handleSaveInvitation}
            isSaving={isSaving}
          />
        )}

        {activeTab === "theme" && (
          <ThemeSelectorTab
            currentThemeId={themeId}
            slug={slug}
            tier={tier}
            onUpgradeClick={() => setActiveTab("billing")}
            onSelectTheme={async (newThemeId) => {
              if (!isPaid && !isAdmin) {
                setNotification({
                  type: "error",
                  message: "Pilihan tema hanya dapat disimpan setelah akun memiliki paket aktif. Silakan lakukan pembayaran di menu Langganan & Paket.",
                });
                setActiveTab("billing");
                return;
              }
              if ((tier === "STARTER" || tier === "FREE") && newThemeId !== "minimalist" && !isAdmin) {
                setNotification({
                  type: "error",
                  message: "Paket Starter hanya dapat menggunakan 1 pilihan tema (Clean Minimalist). Silakan upgrade ke Paket Elegant atau Ultimate untuk membuka seluruh koleksi tema.",
                });
                setActiveTab("billing");
                return;
              }
              setThemeId(newThemeId);
              try {
                const res = await fetch("/api/dashboard/invitation", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ themeId: newThemeId }),
                });
                const json = await res.json();
                if (!res.ok) {
                  throw new Error(json.error || "Gagal mengubah tema");
                }
                setNotification({
                  type: "success",
                  message: `Tema berhasil diubah menjadi "${newThemeId}"!`,
                });
              } catch (err) {
                setNotification({
                  type: "error",
                  message: err instanceof Error ? err.message : "Gagal mengubah tema",
                });
              }
            }}
            onOpenPreview={() => setShowMobilePreview(true)}
          />
        )}

        {activeTab === "guests" && (
          <GuestBookTab
            guests={guests}
            slug={slug}
            weddingTitle={title}
            coupleInfo={{
              groomName,
              groomNickname,
              groomFather,
              groomMother,
              brideName,
              brideNickname,
              brideFather,
              brideMother,
            }}
            schedules={schedules}
            onAddGuest={handleAddGuest}
            onBulkAddGuests={handleBulkAddGuests}
            onUpdateGuest={handleUpdateGuest}
            onDeleteGuest={handleDeleteGuest}
            onToggleCheckin={handleToggleCheckin}
            onGuestUpdated={(updatedGuest) => {
              setGuests((prev) =>
                prev.map((g) =>
                  g.id === updatedGuest.id ? { ...g, checkedInAt: updatedGuest.checkedInAt } : g
                )
              );
            }}
          />
        )}

        {activeTab === "rsvp" && (
          <RsvpRecapTab
            rsvpRecap={rsvpRecap}
            wishes={wishes}
            isLoading={isLoading}
          />
        )}

        {activeTab === "billing" && (
          <BillingUpgradeTab
            currentTier={tier}
            isPaid={isPaid}
            invitationId={invitationId}
            onPaymentSubmitted={() => loadDashboardData(true)}
          />
        )}
      </main>

      {/* 3. Mobile Floating Quick Save Bar (Only visible in editor tab on mobile) */}
      {activeTab === "editor" && (
        <div className="fixed bottom-16 left-0 right-0 z-30 md:hidden px-4 py-2 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
          <button
            type="button"
            onClick={handleSaveInvitation}
            disabled={isSaving || (!isPaid && !isAdmin)}
            className={`pointer-events-auto w-full py-3 px-4 rounded-xl font-semibold text-xs shadow-md flex items-center justify-center gap-2 min-h-[46px] transition-colors ${
              !isPaid && !isAdmin
                ? "bg-slate-400 text-white cursor-not-allowed opacity-90"
                : "bg-[#F97316] hover:bg-[#EA580C] text-white"
            }`}
          >
            {!isPaid && !isAdmin ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Mode Pratinjau (Terkunci)</span>
              </>
            ) : (
              <>
                <Save className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />
                <span>{isSaving ? "Menyimpan Perubahan..." : "Simpan Perubahan Undangan"}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 4. Mobile Fixed Bottom Navigation Bar (<md) */}
      <MobileBottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        guestCount={guests.length}
        rsvpCount={rsvpRecap?.totalResponses || 0}
      />

      {/* 5. Modal: Live Smartphone Simulation Preview with Template Device */}
      {showMobilePreview && (
        <div
          onClick={() => setShowMobilePreview(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center max-h-[96vh]"
          >
            {/* Top Close Button & Bar */}
            <div className="w-full max-w-[340px] sm:max-w-[360px] flex items-center justify-between px-3.5 py-2 mb-2.5 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md shadow-lg shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-300 font-medium">Simulasi HP</span>
                <a
                  href={`/invitation/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#F97316] hover:underline font-medium"
                  title="Buka website undangan di tab baru"
                >
                  <span>Buka Web</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <button
                onClick={() => setShowMobilePreview(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                aria-label="Tutup Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Template Device Frame using /templates/device/mobile.png */}
            <DeviceFrame className="w-[320px] sm:w-[350px]">
              <ThemeRenderer
                data={previewData}
                forcedThemeId={themeId}
                guestName="Bapak Budi & Rekan"
                showCover={false}
                isEmbedded={true}
              />
            </DeviceFrame>

            {/* Bottom info */}
            <div className="pt-2 shrink-0 text-center">
              <p className="text-[10px] text-slate-300">
                Tema Aktif: <span className="text-[#F97316] font-bold uppercase">{themeId}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

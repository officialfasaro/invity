"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, Clock, CheckCircle2, AlertCircle, ChevronRight, X } from "lucide-react";

export interface UserNotification {
  id: string;
  type: "WAITING_VERIFICATION" | "PAYMENT_VERIFIED" | "PAYMENT_CANCELLED";
  title: string;
  message: string;
  orderId?: string;
  createdAt: string;
  link: string;
  isRead?: boolean;
}

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load read notifications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("fasaro_read_notifications");
      if (stored) {
        setReadIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchNotifications = () => {
    fetch("/api/payment/my-notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          setNotifications(json.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    try {
      localStorage.setItem("fasaro_read_notifications", JSON.stringify(Array.from(allIds)));
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = (id: string) => {
    const newRead = new Set(readIds);
    newRead.add(id);
    setReadIds(newRead);
    try {
      localStorage.setItem("fasaro_read_notifications", JSON.stringify(Array.from(newRead)));
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          fetchNotifications();
        }}
        aria-label="Notifikasi Pengguna"
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-hidden"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#F97316] text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <>
          {/* Backdrop on mobile for easy dismiss */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-2xs md:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-x-3 top-[68px] max-w-sm mx-auto md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:w-96 md:max-w-none md:mx-0 rounded-2xl bg-white border border-[#E2E8F0] shadow-xl z-50 overflow-hidden text-left animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-slate-900">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#F97316] text-[10px] font-bold">
                  {unreadCount} baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] text-[#F97316] hover:underline font-semibold cursor-pointer px-1.5 py-0.5"
                >
                  Tandai Dibaca
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Tutup notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0]/70">
            {notifications.length > 0 ? (
              notifications.map((notif) => {
                const isRead = readIds.has(notif.id);
                return (
                  <Link
                    key={notif.id}
                    to={notif.link}
                    onClick={() => handleNotificationClick(notif.id)}
                    className={`block p-3.5 transition-colors hover:bg-slate-50 ${
                      !isRead ? "bg-orange-50/30" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Status Icon */}
                      <div className="shrink-0 mt-0.5">
                        {notif.type === "PAYMENT_VERIFIED" ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : notif.type === "WAITING_VERIFICATION" ? (
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4
                            className={`text-xs leading-snug truncate ${
                              !isRead
                                ? "font-bold text-slate-900"
                                : "font-semibold text-slate-700"
                            }`}
                          >
                            {notif.title}
                          </h4>
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0" />
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-400">
                          <span>
                            {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="flex items-center text-[#F97316] font-medium">
                            Lihat <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center text-slate-400 space-y-1.5">
                <Bell className="w-6 h-6 mx-auto stroke-1 opacity-60" />
                <p className="text-xs font-medium text-slate-500">Belum ada notifikasi baru</p>
                <p className="text-[11px] text-slate-400">
                  Aktivitas verifikasi pembayaran dan pesanan akan muncul di sini.
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    )}
    </div>
  );
};

export default NotificationBell;

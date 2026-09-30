"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { Download, Smartphone, Share2, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(display-mode: standalone)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getStandaloneSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone)
  );
}

function getIosSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

function getDismissedSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("fasaro_pwa_dismissed") === "true";
}

function getFalse(): boolean {
  return false;
}

function getTrue(): boolean {
  return true;
}

const emptySubscribe = () => () => {};

export default function PwaInstallBanner() {
  const isStandalone = useSyncExternalStore(subscribeStandalone, getStandaloneSnapshot, getFalse);
  const isIos = useSyncExternalStore(emptySubscribe, getIosSnapshot, getFalse);
  const isInitiallyDismissed = useSyncExternalStore(emptySubscribe, getDismissedSnapshot, getTrue);

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.update().catch(() => {});
        })
        .catch((err) => {
          console.warn("[PWA] Service worker registration failed:", err);
        });
    }

    // 2. Listen for Android/Chrome/Edge beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowIosGuide(false);
    try {
      localStorage.setItem("fasaro_pwa_dismissed", "true");
    } catch {
      // ignore storage errors
    }
  };

  // If already standalone or user dismissed, don't render
  if (isStandalone || isInitiallyDismissed || isDismissed) {
    return null;
  }

  // Only show if prompt is available OR if on iOS mobile browser
  if (!isInstallable && !isIos) {
    return null;
  }

  return (
    <aside
      aria-label="Unduh Aplikasi Fasaro"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xl text-slate-900 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Pasang Aplikasi Fasaro
                </h4>
                <span className="text-[10px] font-bold text-[#F97316] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                  PWA Mobile
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Akses undangan lebih cepat langsung dari layar utama ponsel Anda tanpa perlu membuka browser lagi.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup banner instalasi"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons or iOS Guide */}
        {showIosGuide && isIos ? (
          <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 text-slate-800 text-xs space-y-2">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Cara Pasang di Safari iPhone / iPad:</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700">
              <li>Ketuk ikon <strong>Bagikan</strong> (Share) di menu bawah Safari.</li>
              <li>Gulir ke bawah dan pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> (Add to Home Screen).</li>
              <li>Ketuk <strong>Tambah</strong> di sudut kanan atas. Selesai!</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="mt-1 text-[11px] font-semibold text-[#F97316] hover:underline cursor-pointer"
            >
              Tutup Petunjuk
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isIos ? "Petunjuk Pasang di iPhone" : "Install Sekarang"}</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="py-2.5 px-3 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
            >
              Nanti Saja
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

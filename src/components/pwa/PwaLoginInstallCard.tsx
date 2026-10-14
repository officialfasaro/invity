"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { CheckCircle2, Download, HelpCircle, Share2, Smartphone } from "lucide-react";

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

function getFalse(): boolean {
  return false;
}

const emptySubscribe = () => () => {};

export default function PwaLoginInstallCard() {
  const isStandalone = useSyncExternalStore(subscribeStandalone, getStandaloneSnapshot, getFalse);
  const isIos = useSyncExternalStore(emptySubscribe, getIosSnapshot, getFalse);

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Listen for browser install prompt
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
      setShowIosGuide((prev) => !prev);
      return;
    }

    if (!deferredPrompt) {
      setShowIosGuide(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstallable(false);
        setDeferredPrompt(null);
        setInstallSuccess(true);
      }
    } catch {
      // User cancelled or browser rejected
    }
  };

  return (
    <section
      aria-label="Aplikasi Pengantin Invity PWA"
      className="w-full p-5 rounded-none bg-white border border-[#E2E8F0] shadow-xs space-y-3.5 text-slate-900"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 text-[#F97316] flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="grow">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-slate-900">
              Aplikasi Pengantin (PWA)
            </h2>
            <span className="text-[10px] font-bold text-[#F97316] bg-orange-50 px-1.5 py-0.5 border border-orange-200 uppercase">
              Khusus Pengantin
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Pasang aplikasi ke layar utama HP atau Laptop untuk mengedit undangan &amp; memantau tamu dengan lebih mudah tanpa perlu membuka browser dan searching lagi.
          </p>
        </div>
      </div>

      {/* Standalone status or Install actions */}
      {isStandalone || installSuccess ? (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Aplikasi Invity sudah terpasang di perangkat Anda</span>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full py-2.5 px-4 rounded-none bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-[0.99]"
          >
            <Download className="w-4 h-4" />
            <span>
              {isIos
                ? "Petunjuk Pasang di iPhone / iPad"
                : isInstallable
                ? "Install Aplikasi Pengantin (PWA)"
                : "Pasang Aplikasi ke Layar Utama"}
            </span>
          </button>

          {!isIos && (
            <button
              type="button"
              onClick={() => setShowIosGuide((prev) => !prev)}
              className="w-full text-center text-[11px] text-slate-500 hover:text-[#F97316] font-medium transition-colors cursor-pointer py-0.5 inline-flex items-center justify-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showIosGuide ? "Sembunyikan petunjuk manual" : "Cara pasang manual (iPhone / PC)"}</span>
            </button>
          )}

          {/* Manual installation guide */}
          {showIosGuide && (
            <div className="p-3.5 rounded-none bg-orange-50/70 border border-orange-200 text-slate-800 text-xs space-y-2 animate-in fade-in duration-200">
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Petunjuk Pemasangan Cepat:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-700 leading-relaxed">
                <li>
                  <strong>Pengguna iPhone/iPad (Safari):</strong> Ketuk tombol <strong>Bagikan</strong> (Share), gulir ke bawah lalu pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> (Add to Home Screen).
                </li>
                <li>
                  <strong>Pengguna Android (Chrome/Edge):</strong> Ketuk menu titik tiga (⋮) di pojok kanan atas browser, lalu pilih <strong>&quot;Install Invity&quot;</strong> atau <strong>&quot;Tambahkan ke Layar Utama&quot;</strong>.
                </li>
                <li>
                  <strong>Pengguna Laptop / PC:</strong> Klik ikon install (⊕) di bilah alamat browser sebelah kanan atas untuk memasang ke Desktop.
                </li>
              </ol>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

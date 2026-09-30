"use client";

import React, { useState } from "react";
import { Check, Copy, Gift, QrCode, X } from "lucide-react";
import { BankAccountItem } from "@/types/wedding";

interface DigitalGiftBoxProps {
  bankAccounts: BankAccountItem[];
  hideHeader?: boolean;
  themeStyle?: {
    cardClass?: string;
    badgeClass?: string;
    buttonClass?: string;
    titleClass?: string;
    subtitleClass?: string;
    accountNumberClass?: string;
    accountHolderClass?: string;
    qrisButtonClass?: string;
    iconClass?: string;
  };
}

export const DigitalGiftBox: React.FC<DigitalGiftBoxProps> = ({
  bankAccounts,
  hideHeader = false,
  themeStyle,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedQris, setSelectedQris] = useState<{ url: string; bank: string } | null>(
    null
  );

  if (!bankAccounts || bankAccounts.length === 0) {
    return null;
  }

  const hasAnyQris = bankAccounts.some(
    (account) =>
      typeof account.qrisImageUrl === "string" &&
      account.qrisImageUrl.trim() !== "" &&
      !account.qrisImageUrl.includes("FASARO-DEMO-QRIS") &&
      !account.qrisImageUrl.includes("demo-qris")
  );

  const handleCopy = async (accountNumber: string, index: number) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full my-8">
      {!hideHeader && (
        <div className="text-center mb-6">
          <div
            className={`inline-flex p-3 rounded-full mb-2 ${
              themeStyle?.iconClass ?? "bg-amber-100 text-amber-700"
            }`}
          >
            <Gift className="w-6 h-6" />
          </div>
          <h3
            className={`text-xl font-serif font-bold ${
              themeStyle?.titleClass ?? "text-stone-900"
            }`}
          >
            Kado Digital &amp; Tanda Kasih
          </h3>
          <p
            className={`text-xs font-medium mt-1 max-w-sm mx-auto leading-relaxed ${
              themeStyle?.subtitleClass ?? "text-stone-600"
            }`}
          >
            Doa restu Anda merupakan karunia terindah bagi kami. Bagi yang berkenan memberikan
            tanda kasih, dapat melalui rekening{hasAnyQris ? "/QRIS" : ""} berikut:
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {bankAccounts.map((account, index) => {
          const hasValidAccountQris = Boolean(
            account.qrisImageUrl &&
              account.qrisImageUrl.trim() !== "" &&
              !account.qrisImageUrl.includes("FASARO-DEMO-QRIS") &&
              !account.qrisImageUrl.includes("demo-qris")
          );

          return (
            <div
              key={account.id ?? `${account.bankName}-${index}`}
              className={`p-5 rounded-2xl border shadow-sm transition-all hover:shadow-md ${
                themeStyle?.cardClass ??
                "bg-white/90 border-stone-200 text-stone-900"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                    themeStyle?.badgeClass ??
                    "bg-stone-100 text-stone-800 border border-stone-200"
                  }`}
                >
                  {account.bankName}
                </span>
                {hasValidAccountQris && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedQris({
                        url: account.qrisImageUrl as string,
                        bank: account.bankName,
                      })
                    }
                    className={`inline-flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors ${
                      themeStyle?.qrisButtonClass ?? "text-amber-600 hover:text-amber-700"
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Lihat QRIS</span>
                  </button>
                )}
              </div>

            <div className="my-2">
              <p
                className={`text-lg font-mono font-bold tracking-wider ${
                  themeStyle?.accountNumberClass ?? "text-inherit"
                }`}
              >
                {account.accountNumber}
              </p>
              <p
                className={`text-xs font-medium mt-0.5 ${
                  themeStyle?.accountHolderClass ?? "opacity-75"
                }`}
              >
                a.n. {account.accountHolder}
              </p>
            </div>

            <button
              onClick={() => handleCopy(account.accountNumber, index)}
              className={`w-full mt-3 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                copiedIndex === index
                  ? "bg-emerald-600 text-white"
                  : themeStyle?.buttonClass ??
                    "bg-stone-100 hover:bg-stone-200 text-stone-800"
              }`}
            >
              {copiedIndex === index ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Nomor Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Nomor Rekening</span>
                </>
              )}
            </button>
            </div>
          );
        })}
      </div>

      {/* QRIS Modal */}
      {selectedQris && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xs bg-white rounded-3xl p-6 text-center shadow-2xl">
            <button
              onClick={() => setSelectedQris(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="font-bold text-stone-900 mb-1">Scan QRIS</h4>
            <p className="text-xs text-stone-700 font-medium mb-4">{selectedQris.bank}</p>
            <div className="w-48 h-48 mx-auto p-2 border rounded-2xl bg-white flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedQris.url}
                alt={`QRIS ${selectedQris.bank}`}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs text-stone-600 font-medium mt-4">
              Buka aplikasi e-wallet / mobile banking Anda dan scan kode QR di atas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalGiftBox;

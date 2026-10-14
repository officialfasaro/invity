"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, Loader2, Send, Users } from "lucide-react";

interface RsvpFormSectionProps {
  invitationId: string;
  defaultGuestName?: string;
  hideHeader?: boolean;
  themeStyle?: {
    cardClass?: string;
    buttonClass?: string;
    inputClass?: string;
    titleClass?: string;
    subtitleClass?: string;
    labelClass?: string;
    statusButtonClass?: string;
    statusButtonActiveClass?: string;
    iconClass?: string;
    submittedTitleClass?: string;
    submittedSubtitleClass?: string;
  };
}

export const RsvpFormSection: React.FC<RsvpFormSectionProps> = ({
  invitationId,
  defaultGuestName = "",
  hideHeader = false,
  themeStyle,
}) => {
  const [guestName, setGuestName] = useState(defaultGuestName);
  const [status, setStatus] = useState<"ATTENDING" | "NOT_ATTENDING" | "UNCERTAIN">(
    "ATTENDING"
  );
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [sessionChosen, setSessionChosen] = useState("Akad & Resepsi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!guestName.trim()) {
      setErrorMessage("Mohon isi nama Anda");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/public/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          guestName: guestName.trim(),
          status,
          attendeeCount,
          sessionChosen,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal mengirim konfirmasi kehadiran");
      }

      setIsSubmitted(true);
      if (status === "ATTENDING") {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full my-8 max-w-md mx-auto">
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-lg ${
          themeStyle?.cardClass ??
          "bg-white/95 border-stone-200 text-stone-900"
        }`}
      >
        {!hideHeader && (
          <div className="text-center mb-6">
            <div
              className={`inline-flex p-3 rounded-full mb-2 ${
                themeStyle?.iconClass ?? "bg-rose-100 text-rose-600"
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <h3
              className={`text-xl font-serif font-bold ${
                themeStyle?.titleClass ?? "text-stone-900"
              }`}
            >
              Konfirmasi Kehadiran (RSVP)
            </h3>
            <p
              className={`text-xs font-medium mt-1 leading-relaxed ${
                themeStyle?.subtitleClass ?? "text-stone-600"
              }`}
            >
              Bantu kami mempersiapkan jamuan terbaik dengan mengonfirmasi kehadiran Anda.
            </p>
          </div>
        )}

        {isSubmitted ? (
          <div className="text-center py-6 animate-in fade-in zoom-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4
              className={`text-base font-bold ${
                themeStyle?.submittedTitleClass ?? themeStyle?.titleClass ?? "text-stone-900"
              }`}
            >
              Terima Kasih atas Konfirmasi Anda!
            </h4>
            <p
              className={`text-xs font-medium mt-1 ${
                themeStyle?.submittedSubtitleClass ?? themeStyle?.subtitleClass ?? "text-stone-600"
              }`}
            >
              Jawaban Anda telah kami simpan. Sampai jumpa di hari bahagia!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {errorMessage}
              </div>
            )}

            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  themeStyle?.labelClass ?? "text-stone-700"
                }`}
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Masukkan nama Anda..."
                className={`w-full py-2.5 px-3.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  themeStyle?.inputClass ??
                  "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400"
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  themeStyle?.labelClass ?? "text-stone-700"
                }`}
              >
                Konfirmasi
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "ATTENDING", label: "Hadir" },
                  { key: "NOT_ATTENDING", label: "Tidak Hadir" },
                  { key: "UNCERTAIN", label: "Ragu-ragu" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setStatus(item.key as "ATTENDING" | "NOT_ATTENDING" | "UNCERTAIN")
                    }
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                      status === item.key
                        ? themeStyle?.statusButtonActiveClass ??
                          "bg-amber-600 border-amber-600 text-white shadow-sm"
                        : themeStyle?.statusButtonClass ??
                          "bg-white border-stone-200 text-stone-700 hover:border-amber-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {status === "ATTENDING" && (
              <>
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      themeStyle?.labelClass ?? "text-stone-700"
                    }`}
                  >
                    Jumlah Tamu
                  </label>
                  <select
                    value={attendeeCount}
                    onChange={(e) => setAttendeeCount(parseInt(e.target.value, 10))}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      themeStyle?.inputClass ??
                      "bg-stone-50 border-stone-300 text-stone-900"
                    }`}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num} className="text-stone-900 bg-white">
                        {num} Orang
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      themeStyle?.labelClass ?? "text-stone-700"
                    }`}
                  >
                    Sesi Acara
                  </label>
                  <select
                    value={sessionChosen}
                    onChange={(e) => setSessionChosen(e.target.value)}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      themeStyle?.inputClass ??
                      "bg-stone-50 border-stone-300 text-stone-900"
                    }`}
                  >
                    <option value="Akad & Resepsi" className="text-stone-900 bg-white">
                      Akad &amp; Resepsi
                    </option>
                    <option value="Resepsi Saja" className="text-stone-900 bg-white">
                      Resepsi Saja
                    </option>
                    <option value="Akad Nikah Saja" className="text-stone-900 bg-white">
                      Akad Nikah Saja
                    </option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold transition-all shadow-md hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 cursor-pointer ${
                themeStyle?.buttonClass ??
                "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Konfirmasi...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Konfirmasi</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RsvpFormSection;

"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { WishItem } from "@/types/wedding";

interface WishesWallSectionProps {
  invitationId: string;
  hideHeader?: boolean;
  themeStyle?: {
    cardClass?: string;
    bubbleClass?: string;
    buttonClass?: string;
    inputClass?: string;
    titleClass?: string;
    subtitleClass?: string;
    senderClass?: string;
    messageClass?: string;
    dateClass?: string;
    emptyTextClass?: string;
    loadingTextClass?: string;
    reactionButtonClass?: string;
    iconClass?: string;
  };
}

const REACTIONS = ["💖", "🤲", "🎉", "💐", "✨", "🤍"];

export const WishesWallSection: React.FC<WishesWallSectionProps> = ({
  invitationId,
  hideHeader = false,
  themeStyle,
}) => {
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedReaction, setSelectedReaction] = useState("💖");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    let ignore = false;
    fetch(`/api/public/wishes?invitationId=${invitationId}&limit=20`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!ignore && json) {
          setWishes(json.data || []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [invitationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!senderName.trim() || !message.trim()) {
      setFeedback({ type: "error", text: "Nama dan pesan ucapan tidak boleh kosong" });
      return;
    }

    const trimmedName = senderName.trim();
    const trimmedMessage = message.trim();
    const currentReaction = selectedReaction;

    // Optimistic UI: tampilkan langsung seketika tanpa menunggu jaringan
    const optimisticWish: WishItem = {
      id: `optimistic-${Date.now()}`,
      senderName: trimmedName,
      message: trimmedMessage,
      reaction: currentReaction,
      createdAt: new Date().toISOString(),
    };

    setWishes((prev) => [optimisticWish, ...prev]);
    setMessage("");
    setFeedback({ type: "success", text: "Ucapan & doa restu berhasil dikirim!" });
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/public/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          senderName: trimmedName,
          message: trimmedMessage,
          reaction: currentReaction,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengirim doa ucapan");
      }

      const resJson = await res.json();
      // Replace optimistic item with server verified item
      setWishes((prev) =>
        prev.map((w) => (w.id === optimisticWish.id ? resJson.data : w))
      );
    } catch (err) {
      // Revert optimistic wish if server rejected
      setWishes((prev) => prev.filter((w) => w.id !== optimisticWish.id));
      setMessage(trimmedMessage);
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Terjadi kesalahan",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full my-8 max-w-lg mx-auto">
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
                themeStyle?.iconClass ?? "bg-amber-100 text-amber-700"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3
              className={`text-xl font-serif font-bold ${
                themeStyle?.titleClass ?? "text-stone-900"
              }`}
            >
              Untaian Doa &amp; Ucapan
            </h3>
            <p
              className={`text-xs font-medium mt-1 leading-relaxed ${
                themeStyle?.subtitleClass ?? "text-stone-600"
              }`}
            >
              Kirimkan doa tulus dan harapan terbaik bagi kedua mempelai.
            </p>
          </div>
        )}

        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs mb-4 border ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 mb-8">
          <div>
            <input
              type="text"
              required
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Nama Anda..."
              className={`w-full py-2.5 px-3.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                themeStyle?.inputClass ??
                "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400"
              }`}
            />
          </div>

          <div>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan doa restu untuk kedua mempelai..."
              className={`w-full py-2.5 px-3.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none ${
                themeStyle?.inputClass ??
                "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400"
              }`}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-wrap py-1">
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedReaction(emoji)}
                  className={`p-1.5 rounded-lg text-base transition-all cursor-pointer ${
                    selectedReaction === emoji
                      ? "bg-amber-500/20 scale-125 shadow-sm"
                      : `${themeStyle?.reactionButtonClass ?? "hover:bg-stone-100"} opacity-70 hover:opacity-100`
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer ${
                themeStyle?.buttonClass ??
                "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Mengirim..." : "Kirim Doa"}</span>
            </button>
          </div>
        </form>

        {/* Wishes List Wall */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {isLoading ? (
            <p
              className={`text-center text-xs py-4 font-medium ${
                themeStyle?.loadingTextClass ?? "text-stone-500"
              }`}
            >
              Memuat ucapan...
            </p>
          ) : wishes.length === 0 ? (
            <p
              className={`text-center text-xs py-6 font-medium italic ${
                themeStyle?.emptyTextClass ?? "text-stone-500"
              }`}
            >
              Belum ada ucapan. Jadilah yang pertama memberikan doa restu!
            </p>
          ) : (
            wishes.map((w) => (
              <div
                key={w.id}
                className={`p-3.5 rounded-2xl border text-left text-xs space-y-1 transition-all ${
                  themeStyle?.bubbleClass ??
                  "bg-stone-50/80 border-stone-200 text-stone-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold flex items-center gap-1.5 ${
                      themeStyle?.senderClass ?? "text-stone-900"
                    }`}
                  >
                    {w.senderName}
                    {w.reaction && <span>{w.reaction}</span>}
                  </span>
                  <span
                    className={`text-[11px] font-medium ${
                      themeStyle?.dateClass ?? "text-stone-500"
                    }`}
                  >
                    {new Date(w.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <p
                  className={`font-normal leading-relaxed break-words ${
                    themeStyle?.messageClass ?? "text-stone-800"
                  }`}
                >
                  {w.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WishesWallSection;

"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  ExternalLink,
  Heart,
  MapPin,
} from "lucide-react";
import { WeddingInvitationData } from "@/types/wedding";
import CountdownTimer from "../shared/CountdownTimer";
import FloatingAudioPlayer from "../shared/FloatingAudioPlayer";
import HeroCover from "../shared/HeroCover";
import DigitalGiftBox from "../shared/DigitalGiftBox";
import RsvpFormSection from "../shared/RsvpFormSection";
import WishesWallSection from "../shared/WishesWallSection";

interface MinangThemeProps {
  data: WeddingInvitationData;
  guestName?: string;
  showCover?: boolean;
  isEmbedded?: boolean;
}

// Icon Instagram SVG
const InstagramIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// Ornamen Khas Siluet Atap Gonjong Rumah Gadang Minangkabau
const GonjongIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg
    viewBox="0 0 100 45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M2 38 C 12 36, 18 20, 22 2 C 26 22, 34 32, 50 32 C 66 32, 74 22, 78 2 C 82 20, 88 36, 98 38 L 95 42 C 78 40, 68 40, 50 40 C 32 40, 22 40, 5 42 Z"
      fill="currentColor"
    />
    <circle cx="22" cy="2" r="1.5" fill="#fef08a" />
    <circle cx="78" cy="2" r="1.5" fill="#fef08a" />
    <circle cx="50" cy="28" r="2" fill="#fef08a" />
  </svg>
);

// Ornamen Garis Motif Pucuak Rebuang Minangkabau
const PucuakRebuangDivider = () => (
  <div className="flex items-center justify-center gap-2 py-3 text-amber-500/80">
    <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/60" />
    <GonjongIcon className="w-8 h-4 text-amber-400" />
    <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/60" />
  </div>
);

export const MinangTheme: React.FC<MinangThemeProps> = ({
  data,
  guestName,
  showCover = true,
  isEmbedded = false,
}) => {
  const [isOpen, setIsOpen] = useState(!showCover);

  const primaryEvent = data.eventSchedules?.[0];

  const createCalendarUrl = (eventName: string, dateStr: string | Date, venue: string) => {
    const start = new Date(dateStr);
    const startIso = start.toISOString().replace(/-|:|\.\d+/g, "");
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventName + " - " + (data.coupleInfo.brideNickname || data.coupleInfo.brideName) + " & " + (data.coupleInfo.groomNickname || data.coupleInfo.groomName)
    )}&dates=${startIso}/${startIso}&location=${encodeURIComponent(venue)}`;
  };

  return (
    <div className="min-h-screen bg-[#140a05] text-[#fbf5ee] font-sans pb-28 selection:bg-amber-500 selection:text-stone-950 relative overflow-x-hidden no-scrollbar">
      {/* 1. Sampul Pembuka (Cover Hero) Tradisional Minangkabau */}
      {showCover && (
        <HeroCover
          groomName={data.coupleInfo.groomNickname || data.coupleInfo.groomName}
          brideName={data.coupleInfo.brideNickname || data.coupleInfo.brideName}
          guestName={guestName}
          eventDate={primaryEvent?.date}
          isOpen={isOpen}
          isEmbedded={isEmbedded}
          onOpenInvitation={() => setIsOpen(true)}
          themeStyle={{
            containerClass:
              "bg-gradient-to-b from-[#1c0f08] via-[#2d150b] to-[#120703] text-amber-100",
            cardClass:
              "bg-[#22120a]/95 border-2 border-amber-500/50 shadow-[0_0_50px_rgba(217,119,6,0.3)] text-amber-100 backdrop-blur-md",
            titleClass:
              "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 font-serif",
            badgeClass: "text-amber-300 font-serif tracking-widest font-semibold",
            guestBoxClass: "bg-[#180c06] border border-amber-500/40 text-amber-100 shadow-inner",
            guestLabelClass: "text-amber-200/90 font-medium",
            guestNameClass: "text-amber-300 font-bold",
            guestSubtextClass: "text-amber-200/70",
            dateClass: "text-amber-200 font-semibold tracking-widest",
            buttonClass:
              "bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-bold shadow-xl shadow-amber-900/40 tracking-wider",
          }}
        />
      )}

      {/* Floating Audio Player (hanya saat full page view) */}
      {!isEmbedded && (
        <FloatingAudioPlayer audioUrl={data.musicUrl} autoPlayTrigger={isOpen} />
      )}

      {/* Background Songket Pattern Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-96 bg-gradient-to-b from-amber-600/15 via-red-950/20 to-transparent pointer-events-none -z-10 blur-2xl" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-red-900/10 rounded-full pointer-events-none -z-10 blur-3xl" />
      <div className="absolute top-2/3 left-0 w-80 h-80 bg-amber-700/10 rounded-full pointer-events-none -z-10 blur-3xl" />

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center space-y-24">
        {/* Section 1: Hero Banner & Salam Adat */}
        <section id="home" className="space-y-6 pt-6">
          <div className="flex justify-center text-amber-400">
            <GonjongIcon className="w-16 h-8 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]" />
          </div>

          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.35em] text-amber-400/90 font-medium">
              Baralek Gadang &bull; Pernikahan Adat Minangkabau
            </p>
            <p className="text-xs text-amber-200/80 font-serif italic max-w-md mx-auto">
              &quot;Barek samo dipikua, ringan samo dijinjiang. Basamo mangko manjadi.&quot;
            </p>
          </div>

          <div className="py-2">
            <span className="text-xs font-serif text-amber-300/70 tracking-widest uppercase block mb-1">
              The Wedding Of
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-100 tracking-wide leading-tight drop-shadow-md">
              {data.coupleInfo.brideNickname || data.coupleInfo.brideName}
            </h1>
            <span className="text-2xl sm:text-3xl font-serif text-amber-400 block my-1">
              &amp;
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-100 tracking-wide leading-tight drop-shadow-md">
              {data.coupleInfo.groomNickname || data.coupleInfo.groomName}
            </h1>
          </div>

          {primaryEvent?.date && (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#27130a] border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wider uppercase shadow-md shadow-amber-950/50">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {new Date(primaryEvent.date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Countdown Card Bernuansa Minang */}
          {primaryEvent?.date && (
            <div className="mt-8 p-6 rounded-3xl bg-gradient-to-b from-[#2a160d]/90 to-[#1b0d06]/95 border border-amber-500/40 shadow-2xl shadow-amber-950/40">
              <p className="text-xs uppercase tracking-widest text-amber-300/80 mb-2 font-serif">
                Menghitung Waktu Bersejarah Menuju Hari H
              </p>
              <CountdownTimer
                targetDate={primaryEvent.date}
                themeStyle={{
                  boxClass:
                    "bg-[#190b05] border-amber-500/40 shadow-inner",
                  numberClass:
                    "text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-yellow-300 font-serif font-bold",
                  labelClass: "text-amber-200 font-semibold text-[9px] uppercase tracking-wider",
                }}
              />
            </div>
          )}
        </section>

        {/* Section 2: Pepatah Adat & Ayat Suci */}
        <section className="space-y-4 max-w-lg mx-auto">
          <PucuakRebuangDivider />
          <p className="text-xs text-amber-100/80 leading-relaxed italic font-serif">
            {data.coupleInfo.greetingMessage ||
              "“Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.” (QS. Ar-Rum: 21)"}
          </p>
          <PucuakRebuangDivider />
        </section>

        {/* Section 3: Kedua Mempelai (Anak Daro & Marapulai) */}
        <section id="couple" className="space-y-12">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-amber-400 font-semibold">
              Pasangan Pengantin
            </span>
            <h2 className="text-3xl font-serif font-bold text-amber-200">
              Anak Daro &amp; Marapulai
            </h2>
            <p className="text-xs text-amber-100/90 max-w-md mx-auto">
              Dengan memohon rahmat dan ridho Allah SWT, serta restu dari ninik mamak dan keluarga besar kedua belah pihak:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">
            {/* Mempelai Wanita (Anak Daro) */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#2a160d] to-[#1e0e07] border border-amber-500/40 space-y-4 shadow-xl flex flex-col justify-between text-center relative group hover:border-amber-400/70 transition-all">
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-[10px] text-amber-300 font-serif font-semibold">
                Anak Daro
              </div>

              <div className="space-y-4 pt-2">
                <div className="relative w-32 h-32 mx-auto rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-500 shadow-lg shadow-amber-500/20">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#1a0c06]">
                    {data.coupleInfo.bridePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.coupleInfo.bridePhoto}
                        alt={data.coupleInfo.brideName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-400">
                        <Heart className="w-10 h-10 fill-amber-500/20" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif font-bold text-xl text-amber-200">
                    {data.coupleInfo.brideName}
                  </h3>
                  {data.coupleInfo.brideFather && (
                    <p className="text-xs text-amber-100/90 leading-relaxed">
                      Putri tercinta dari Bpk. {data.coupleInfo.brideFather}
                      {data.coupleInfo.brideMother && ` & Ibu ${data.coupleInfo.brideMother}`}
                    </p>
                  )}
                </div>
              </div>

              {data.coupleInfo.brideInstagram && (
                <div className="pt-3 border-t border-amber-500/20 flex justify-center">
                  <a
                    href={`https://instagram.com/${data.coupleInfo.brideInstagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>@{data.coupleInfo.brideInstagram}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Mempelai Pria (Marapulai) */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#2a160d] to-[#1e0e07] border border-amber-500/40 space-y-4 shadow-xl flex flex-col justify-between text-center relative group hover:border-amber-400/70 transition-all">
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-[10px] text-amber-300 font-serif font-semibold">
                Marapulai
              </div>

              <div className="space-y-4 pt-2">
                <div className="relative w-32 h-32 mx-auto rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-500 shadow-lg shadow-amber-500/20">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#1a0c06]">
                    {data.coupleInfo.groomPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.coupleInfo.groomPhoto}
                        alt={data.coupleInfo.groomName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-400">
                        <Heart className="w-10 h-10 fill-amber-500/20" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif font-bold text-xl text-amber-200">
                    {data.coupleInfo.groomName}
                  </h3>
                  {data.coupleInfo.groomFather && (
                    <p className="text-xs text-amber-100/90 leading-relaxed">
                      Putra tercinta dari Bpk. {data.coupleInfo.groomFather}
                      {data.coupleInfo.groomMother && ` & Ibu ${data.coupleInfo.groomMother}`}
                    </p>
                  )}
                </div>
              </div>

              {data.coupleInfo.groomInstagram && (
                <div className="pt-3 border-t border-amber-500/20 flex justify-center">
                  <a
                    href={`https://instagram.com/${data.coupleInfo.groomInstagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>@{data.coupleInfo.groomInstagram}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: Runtunan Acara Adat & Ijab Qabul (Jadwal Acara) */}
        <section id="event" className="space-y-10">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-amber-400 font-semibold">
              Runtunan Acara
            </span>
            <h2 className="text-3xl font-serif font-bold text-amber-200">
              Waktu &amp; Tempat Acara
            </h2>
            <p className="text-xs text-amber-100/90 max-w-md mx-auto">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan doa restu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {data.eventSchedules?.map((event, idx) => (
              <div
                key={event.id || idx}
                className="p-6 rounded-3xl bg-gradient-to-b from-[#2a160d] to-[#1e0e07] border border-amber-500/40 shadow-xl space-y-5 hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-serif font-bold border border-amber-500/30">
                      {event.eventName}
                    </span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <Heart className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-amber-100/90">
                    <div className="flex items-center gap-2.5 font-medium">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        {new Date(event.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Pukul {event.startTime} {event.endTime ? `- ${event.endTime}` : "WIB"}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 pt-1">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-amber-200">{event.venueName}</p>
                        <p className="text-amber-100/90 text-[11px] mt-0.5">{event.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-amber-500/20 grid grid-cols-2 gap-2">
                  <a
                    href={createCalendarUrl(event.eventName, event.date, event.venueName)}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#3b1e10] hover:bg-[#4a2715] text-amber-200 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Google Cal</span>
                  </a>

                  {event.mapsUrl && (
                    <a
                      href={event.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-950/40"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Petunjuk Arah</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Janjang Kasih / Cerita Adat */}
        {data.coupleInfo.stories && data.coupleInfo.stories.length > 0 && (
          <section id="cerita" className="space-y-8">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.25em] text-amber-400 font-semibold">
                Kisah Kasih
              </span>
              <h2 className="text-3xl font-serif font-bold text-amber-200">
                Janjang Kasih &amp; Pertemuan
              </h2>
            </div>

            <div className="space-y-6 max-w-xl mx-auto text-left relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gradient-to-b before:from-amber-500/60 before:via-amber-400/30 before:to-transparent">
              {data.coupleInfo.stories.map((s, idx) => (
                <div key={idx} className="relative pl-9 space-y-1.5">
                  <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-amber-500 border-4 border-[#140a05] shadow-sm" />
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
                    {s.date}
                  </span>
                  <h3 className="font-serif font-bold text-base text-amber-200">{s.title}</h3>
                  {s.imageUrl && (
                    <div className="my-2 rounded-xl overflow-hidden border border-amber-500/30 shadow-md max-w-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.imageUrl}
                        alt={s.title || "Foto Janjang Kasih"}
                        className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <p className="text-xs text-amber-100/90 leading-relaxed">{s.story}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 6: Galeri Foto Adat Minangkabau */}
        {data.galleries && data.galleries.length > 0 && (
          <section id="gallery" className="space-y-8">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.25em] text-amber-400 font-semibold">
                Momen Bahagia
              </span>
              <h2 className="text-3xl font-serif font-bold text-amber-200">
                Galeri Prewedding Adat
              </h2>
              <p className="text-xs text-amber-100/90">
                Potret kenangan terindah dalam balutan busana adat Minangkabau
              </p>
            </div>

            <div className="columns-2 gap-3 sm:gap-4 space-y-3">
              {data.galleries.map((img, idx) => (
                <div
                  key={img.id || idx}
                  className="group break-inside-avoid rounded-none overflow-hidden border border-amber-500/40 bg-[#22120a] shadow-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.imageUrl}
                    alt={img.caption || `Galeri Foto ${idx + 1}`}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 block"
                    loading="lazy"
                  />
                  {img.caption && (
                    <div className="px-2.5 py-2 bg-gradient-to-t from-black/80 to-transparent text-[11px] text-amber-200 italic text-center">
                      {img.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 7: Carano Tanda Kasih (Amplop Digital & QRIS) */}
        {data.bankAccounts && data.bankAccounts.length > 0 && (
          <section id="gift" className="space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.25em] text-amber-400 font-semibold">
                Tanda Kasih
              </span>
              <h2 className="text-3xl font-serif font-bold text-amber-200">
                Carano Tanda Kasih Digital
              </h2>
              <p className="text-xs text-amber-100/90 max-w-md mx-auto">
                Doa restu Anda merupakan karunia terindah bagi kami. Bagi keluarga dan handai taulan yang berkenan memberikan tanda kasih, dapat disalurkan melalui:
              </p>
            </div>

            <DigitalGiftBox
              bankAccounts={data.bankAccounts}
              hideHeader={true}
              themeStyle={{
                cardClass:
                  "bg-gradient-to-b from-[#2a160d] to-[#1e0e07] border border-amber-500/40 text-amber-100 shadow-xl",
                badgeClass:
                  "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30",
                accountNumberClass: "text-amber-200 font-mono font-bold",
                accountHolderClass: "text-amber-100/90",
                qrisButtonClass: "text-amber-300 hover:text-amber-200 font-semibold",
                buttonClass:
                  "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold",
              }}
            />
          </section>
        )}

        {/* Section 8: Konfirmasi Kehadiran (RSVP) */}
        <section id="rsvp" className="space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-amber-400 font-semibold">
              Konfirmasi Kehadiran
            </span>
            <h2 className="text-3xl font-serif font-bold text-amber-200">
              Kaba Baralek &amp; RSVP
            </h2>
            <p className="text-xs text-amber-100/90 max-w-md mx-auto">
              Mohon konfirmasi kehadiran Dunsanak jo Kamanakan sarato tamu kehormatan untuak persiapan jamuan kami
            </p>
          </div>

          <RsvpFormSection
            invitationId={data.id}
            defaultGuestName={guestName}
            hideHeader={true}
            themeStyle={{
              cardClass: "bg-[#241208] border border-amber-500/30 text-amber-100 shadow-xl",
              labelClass: "text-amber-200 font-medium",
              inputClass: "bg-[#1b0d06] border-amber-500/40 text-amber-100 placeholder:text-amber-200/40 focus:border-amber-400 focus:ring-amber-500/20",
              statusButtonClass: "bg-[#180b05] border-amber-500/30 text-amber-200 hover:border-amber-400",
              statusButtonActiveClass: "bg-gradient-to-r from-amber-500 to-yellow-500 border-amber-500 text-stone-950 font-bold shadow-md",
              buttonClass: "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-950/40",
              submittedTitleClass: "text-amber-200 font-serif",
              submittedSubtitleClass: "text-amber-100/90",
            }}
          />
        </section>

        {/* Section 9: Pasambahan Doa & Buku Tamu */}
        <section id="doa" className="space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-amber-400 font-semibold">
              Buku Tamu
            </span>
            <h2 className="text-3xl font-serif font-bold text-amber-200">
              Untaian Doa &amp; Restu
            </h2>
            <p className="text-xs text-amber-100/90 max-w-md mx-auto">
              Kirimkan doa tulus dan harapan terbaik bagi kedua mempelai
            </p>
          </div>

          <WishesWallSection
            invitationId={data.id}
            hideHeader={true}
            themeStyle={{
              inputClass:
                "bg-[#241208] border-amber-500/40 text-amber-100 placeholder:text-amber-200/40 focus:border-amber-400 focus:ring-amber-500/20",
              buttonClass:
                "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-950/40",
              cardClass:
                "bg-[#241208] border-amber-500/30 text-amber-100 shadow-md",
              bubbleClass:
                "bg-[#1e0e07] border border-amber-500/30 text-amber-100",
              senderClass: "text-amber-300 font-serif font-bold",
              messageClass: "text-amber-100 leading-relaxed",
              dateClass: "text-amber-400/80 font-mono",
              emptyTextClass: "text-amber-200/70",
              loadingTextClass: "text-amber-200/70",
              reactionButtonClass: "hover:bg-amber-900/40",
            }}
          />
        </section>

        {/* Footer Adat */}
        <footer className="pt-12 text-amber-400/60 text-xs space-y-2 border-t border-amber-500/20">
          <GonjongIcon className="w-10 h-5 mx-auto text-amber-500/60" />
          <p className="font-serif text-amber-300/80">
            Dunsanak jo Kamanakan &bull; Keluarga Besar Kedua Mempelai
          </p>
          <p className="text-[10px] text-amber-500/50">
            Digital Invitation by Fasaro &bull; Traditional Minang Edition
          </p>
        </footer>
      </main>
    </div>
  );
};

export default MinangTheme;

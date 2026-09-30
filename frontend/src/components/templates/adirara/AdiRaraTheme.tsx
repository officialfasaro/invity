"use client";

import React, { useState } from "react";
import Image from "next/image";
import { WeddingInvitationData } from "@/types/wedding";
import HeroCover from "../shared/HeroCover";
import FloatingAudioPlayer from "../shared/FloatingAudioPlayer";
import CountdownTimer from "../shared/CountdownTimer";
import GoogleMapEmbed from "../shared/GoogleMapEmbed";
import DigitalGiftBox from "../shared/DigitalGiftBox";
import RsvpFormSection from "../shared/RsvpFormSection";
import WishesWallSection from "../shared/WishesWallSection";
import {
  Calendar,
  CalendarPlus,
  Clock,
  Heart,
} from "lucide-react";
import InstagramIcon from "../shared/InstagramIcon";

interface ThemeProps {
  data: WeddingInvitationData;
  guestName?: string;
  showCover?: boolean;
  isEmbedded?: boolean;
}

export const AdiRaraTheme: React.FC<ThemeProps> = ({
  data,
  guestName,
  showCover = true,
  isEmbedded = false,
}) => {
  const [isOpen, setIsOpen] = useState(!showCover);
  const primaryEvent = data.eventSchedules[0];

  const generateGoogleCalendarUrl = (
    title: string,
    dateStr: string | Date,
    startTime: string,
    venue: string
  ) => {
    const d = new Date(dateStr);
    const dateFormatted = d.toISOString().slice(0, 10).replace(/-/g, "");
    const timeFormatted = startTime.replace(/[^0-9]/g, "").padEnd(4, "0");
    const startIso = `${dateFormatted}T${timeFormatted}00Z`;
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${startIso}/${startIso}&location=${encodeURIComponent(venue)}`;
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#332a24] font-sans pb-28 selection:bg-rose-200 selection:text-rose-900">
      {/* 1. Sampul Pembuka Amplop WebNikah */}
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
            containerClass: "bg-stone-900/90 text-stone-100",
            cardClass:
              "bg-[#fffbf7] border-2 border-[#e7d5c4] shadow-2xl text-[#332a24]",
            titleClass: "text-[#9f1239] font-serif",
            badgeClass: "text-[#9f1239] font-medium tracking-widest",
            guestBoxClass: "bg-[#fcf5ed] border border-[#e7d5c4] text-[#332a24] shadow-sm",
            guestLabelClass: "text-stone-700 font-medium",
            guestNameClass: "text-[#881337] font-bold",
            guestSubtextClass: "text-stone-600",
            dateClass: "text-[#5c3e2e] font-semibold tracking-widest",
            buttonClass:
              "bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white font-semibold shadow-lg shadow-rose-900/20",
          }}
        />
      )}

      {!isEmbedded && (
        <FloatingAudioPlayer audioUrl={data.musicUrl} autoPlayTrigger={isOpen} />
      )}

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center space-y-24">
        {/* Section: The Wedding Of & Hero Banner */}
        <section id="home" className="space-y-4 pt-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            <Heart className="w-3.5 h-3.5 fill-rose-600" />
            <span>The Wedding of</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif tracking-normal text-[#881337] py-2">
            {data.coupleInfo.brideNickname || data.coupleInfo.brideName}
            <span className="block text-2xl font-serif text-[#b91c1c] my-2">&amp;</span>
            {data.coupleInfo.groomNickname || data.coupleInfo.groomName}
          </h1>

          {primaryEvent?.date && (
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#f3e7dc] text-[#5c3e2e] text-xs font-semibold tracking-wider uppercase">
              {new Date(primaryEvent.date).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          )}

          {/* Countdown Card */}
          {primaryEvent?.date && (
            <div className="mt-8 p-6 rounded-3xl bg-white border border-[#eadacb] shadow-sm">
              <p className="text-xs uppercase tracking-widest text-stone-800 font-semibold mb-2">
                Menghitung Hari Menuju Hari Bahagia
              </p>
              <CountdownTimer
                targetDate={primaryEvent.date}
                themeStyle={{
                  boxClass: "bg-[#fffaf5] border-[#ebd6c4] shadow-sm",
                  numberClass: "text-rose-900 font-serif font-bold",
                  labelClass: "text-stone-800 font-semibold text-[10px]",
                }}
              />
            </div>
          )}
        </section>

        {/* Section: Mempelai (Profile) */}
        <section id="mempelai" className="space-y-12">
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-3xl font-serif font-semibold text-rose-900">
              Kedua Mempelai
            </h2>
            <p className="text-xs text-stone-800 font-medium italic leading-relaxed">
              &quot;{data.coupleInfo.greetingMessage ||
                "Maha Kuasa Allah yang telah mempertemukan kami dalam sebuah momen tak terduga. Dengan memohon rahmat dan ridho-Nya, kami mengundang Anda untuk menyaksikan ikatan janji suci kami."}&quot;
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">
            {/* Mempelai Wanita (Rara style) */}
            <div className="p-6 rounded-3xl bg-white border border-[#ebd6c4] shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-28 h-28 mx-auto rounded-full overflow-hidden bg-rose-50 border-4 border-rose-100 shadow flex items-center justify-center relative">
                  {data.coupleInfo.bridePhoto ? (
                    <Image
                      src={data.coupleInfo.bridePhoto}
                      alt={data.coupleInfo.brideName}
                      fill
                      sizes="120px"
                      priority={false}
                      className="object-cover"
                    />
                  ) : (
                    <Heart className="w-10 h-10 text-rose-300" />
                  )}
                </div>
                <h3 className="font-serif text-xl font-bold text-rose-900">
                  {data.coupleInfo.brideName}
                </h3>
                {(data.coupleInfo.brideFather || data.coupleInfo.brideMother) && (
                  <p className="text-xs text-stone-700 font-medium">
                    Putri dari Bpk. {data.coupleInfo.brideFather || "..."} &amp; Ibu{" "}
                    {data.coupleInfo.brideMother || "..."}
                  </p>
                )}
                {data.coupleInfo.brideInstagram && (
                  <a
                    href={`https://instagram.com/${data.coupleInfo.brideInstagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-900 font-medium bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 transition-colors"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>@{data.coupleInfo.brideInstagram}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Mempelai Pria (Adi style) */}
            <div className="p-6 rounded-3xl bg-white border border-[#ebd6c4] shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-28 h-28 mx-auto rounded-full overflow-hidden bg-stone-50 border-4 border-stone-100 shadow flex items-center justify-center relative">
                  {data.coupleInfo.groomPhoto ? (
                    <Image
                      src={data.coupleInfo.groomPhoto}
                      alt={data.coupleInfo.groomName}
                      fill
                      sizes="120px"
                      priority={false}
                      className="object-cover"
                    />
                  ) : (
                    <Heart className="w-10 h-10 text-stone-300" />
                  )}
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {data.coupleInfo.groomName}
                </h3>
                {(data.coupleInfo.groomFather || data.coupleInfo.groomMother) && (
                  <p className="text-xs text-stone-700 font-medium">
                    Putra dari Bpk. {data.coupleInfo.groomFather || "..."} &amp; Ibu{" "}
                    {data.coupleInfo.groomMother || "..."}
                  </p>
                )}
                {data.coupleInfo.groomInstagram && (
                  <a
                    href={`https://instagram.com/${data.coupleInfo.groomInstagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-900 font-medium bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200 transition-colors"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>@{data.coupleInfo.groomInstagram}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section: Kisah Cinta (Story) */}
        {data.coupleInfo.stories && data.coupleInfo.stories.length > 0 && (
          <section id="cerita" className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-serif font-semibold text-rose-900">
                Kisah Pertemuan
              </h2>
              <p className="text-xs text-stone-700 font-medium">
                Bagaimana langkah kami bermula hingga bersatu dalam janji suci
              </p>
            </div>

            <div className="space-y-6 max-w-lg mx-auto text-left relative border-l-2 border-rose-200 ml-4 pl-6 sm:ml-auto">
              {data.coupleInfo.stories.map((story, idx) => (
                <div key={idx} className="relative space-y-1.5">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-rose-600 border-2 border-white shadow-sm" />
                  <span className="text-xs font-semibold text-rose-700 font-sans tracking-wide">
                    {story.date}
                  </span>
                  <h4 className="font-serif text-base font-bold text-stone-900">
                    {story.title}
                  </h4>
                  {story.imageUrl && (
                    <div className="my-2 rounded-xl overflow-hidden border border-rose-100 shadow-xs max-w-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={story.imageUrl}
                        alt={story.title || "Foto Momen Cerita"}
                        className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <p className="text-xs text-stone-700 leading-relaxed font-normal">
                    {story.story}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Rangkaian Acara (Undangan) */}
        <section id="undangan" className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-semibold text-rose-900">
              Rangkaian Acara
            </h2>
            <p className="text-xs text-stone-700 font-medium">
              Kehadiran dan doa restu Anda merupakan kehormatan terbesar bagi kami
            </p>
          </div>

          <div className="space-y-6 max-w-lg mx-auto">
            {data.eventSchedules.map((schedule) => (
              <div
                key={schedule.id ?? schedule.eventName}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-[#eadacb] shadow-sm space-y-4"
              >
                <div className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-semibold">
                  {schedule.eventName}
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900">
                  {schedule.eventName}
                </h3>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-stone-700 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-rose-600" />
                    {new Date(schedule.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-600" />
                    {schedule.startTime} {schedule.endTime ? `- ${schedule.endTime}` : "WIB"}
                  </span>
                </div>

                <div className="pt-2">
                  <a
                    href={generateGoogleCalendarUrl(
                      schedule.eventName,
                      schedule.date,
                      schedule.startTime,
                      schedule.venueName
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-800 font-semibold py-1.5 px-3 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Simpan ke Google Calendar</span>
                  </a>
                </div>

                <GoogleMapEmbed
                  venueName={schedule.venueName}
                  address={schedule.address}
                  mapsUrl={schedule.mapsUrl}
                  latitude={schedule.latitude}
                  longitude={schedule.longitude}
                  themeStyle={{
                    cardClass: "bg-[#fffaf5] border border-[#ebd6c4] text-stone-900",
                    venueNameClass: "text-stone-900 font-semibold",
                    addressClass: "text-stone-700 text-xs",
                    buttonClass: "bg-rose-800 hover:bg-rose-900 text-white font-medium",
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Section: Galeri Momen (Photos) */}
        {data.galleries && data.galleries.length > 0 && (
          <section id="galeri" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-serif font-semibold text-rose-900">
                Galeri Foto
              </h2>
              <p className="text-xs text-stone-700 font-medium">
                Setiap detik bersama adalah lembaran kisah bahagia kami
              </p>
            </div>

            <div className="columns-2 gap-3 space-y-3 max-w-lg mx-auto">
              {data.galleries.map((img, idx) => (
                <div
                  key={img.id ?? idx}
                  className="break-inside-avoid rounded-none overflow-hidden bg-rose-50 border border-rose-100 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.imageUrl}
                    alt={img.caption || `Galeri ${idx + 1}`}
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 block"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Kirim Kado / Tanda Kasih */}
        <section id="kado">
          <DigitalGiftBox
            bankAccounts={data.bankAccounts}
            themeStyle={{
              cardClass: "bg-white border border-[#ebd6c4] shadow-sm text-stone-900",
              titleClass: "text-rose-950 font-serif",
              subtitleClass: "text-stone-700",
              badgeClass: "bg-rose-50 text-rose-900 font-bold border border-rose-200",
              accountNumberClass: "text-rose-950 font-mono font-bold",
              accountHolderClass: "text-stone-700",
              qrisButtonClass: "text-rose-700 hover:text-rose-800 font-semibold",
              buttonClass: "bg-rose-800 hover:bg-rose-900 text-white font-semibold",
            }}
          />
        </section>

        {/* Section: RSVP Form */}
        <section id="rsvp">
          <RsvpFormSection
            invitationId={data.id}
            defaultGuestName={guestName}
            themeStyle={{
              cardClass: "bg-white border border-[#ebd6c4] shadow-md text-stone-900",
              titleClass: "text-rose-950 font-serif",
              subtitleClass: "text-stone-700",
              labelClass: "text-stone-800 font-semibold",
              statusButtonClass: "bg-white border-stone-300 text-stone-700 hover:border-rose-400",
              statusButtonActiveClass: "bg-rose-800 border-rose-800 text-white font-semibold shadow-sm",
              buttonClass: "bg-rose-800 hover:bg-rose-900 text-white font-semibold",
              inputClass: "bg-[#fffaf5] border-[#ebd6c4] text-stone-900 placeholder:text-stone-400",
              submittedTitleClass: "text-rose-950 font-serif",
              submittedSubtitleClass: "text-stone-700",
            }}
          />
        </section>

        {/* Section: Ucapan & Doa */}
        <section id="doa">
          <WishesWallSection
            invitationId={data.id}
            themeStyle={{
              cardClass: "bg-white border border-[#ebd6c4] shadow-md text-stone-900",
              titleClass: "text-rose-950 font-serif",
              subtitleClass: "text-stone-700",
              bubbleClass: "bg-[#fffaf5] border border-[#ebd6c4] text-stone-900",
              senderClass: "text-rose-950 font-bold",
              messageClass: "text-stone-800",
              dateClass: "text-stone-600 font-medium",
              emptyTextClass: "text-stone-600",
              loadingTextClass: "text-stone-600",
              buttonClass: "bg-rose-800 hover:bg-rose-900 text-white font-semibold",
              inputClass: "bg-[#fffaf5] border-[#ebd6c4] text-stone-900 placeholder:text-stone-400",
            }}
          />
        </section>

        {/* Footer */}
        <footer className="pt-8 text-stone-700 text-xs space-y-1 font-medium">
          <p>Digital Invitation by Fasaro &bull; WebNikah Edition</p>
          <p className="text-[11px] text-stone-600">Terima kasih atas doa &amp; restu Anda</p>
        </footer>
      </main>
    </div>
  );
};

export default AdiRaraTheme;

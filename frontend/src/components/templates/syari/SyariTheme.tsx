"use client";

import React, { useState } from "react";
import { WeddingInvitationData } from "@/types/wedding";
import HeroCover from "../shared/HeroCover";
import FloatingAudioPlayer from "../shared/FloatingAudioPlayer";
import CountdownTimer from "../shared/CountdownTimer";
import GoogleMapEmbed from "../shared/GoogleMapEmbed";
import DigitalGiftBox from "../shared/DigitalGiftBox";
import RsvpFormSection from "../shared/RsvpFormSection";
import WishesWallSection from "../shared/WishesWallSection";
import { Calendar, Clock, Heart, Moon } from "lucide-react";
import InstagramIcon from "../shared/InstagramIcon";

interface ThemeProps {
  data: WeddingInvitationData;
  guestName?: string;
  showCover?: boolean;
  isEmbedded?: boolean;
}

export const SyariTheme: React.FC<ThemeProps> = ({
  data,
  guestName,
  showCover = true,
  isEmbedded = false,
}) => {
  const [isOpen, setIsOpen] = useState(!showCover);
  const primaryEvent = data.eventSchedules[0];

  return (
    <div className="min-h-screen bg-[#071d18] text-[#e3ece8] font-sans selection:bg-[#115e59] selection:text-[#f0fdf4]">
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
            containerClass: "bg-[#030d0b]/95 text-[#e3ece8]",
            cardClass: "bg-[#0b2b24]/95 text-[#e3ece8] border-2 border-[#134e4a] backdrop-blur-xl shadow-2xl",
            titleClass: "text-[#5eead4] font-serif",
            badgeClass: "text-emerald-300 tracking-widest font-medium",
            guestBoxClass: "bg-[#071d18] border border-[#134e4a] text-[#e3ece8] shadow-inner",
            guestLabelClass: "text-emerald-300/90 font-medium",
            guestNameClass: "text-emerald-100 font-bold",
            guestSubtextClass: "text-emerald-300/70",
            dateClass: "text-emerald-200 font-semibold tracking-widest",
            buttonClass: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 font-semibold",
          }}
        />
      )}

      {!isEmbedded && (
        <FloatingAudioPlayer audioUrl={data.musicUrl} autoPlayTrigger={isOpen} />
      )}

      <main className="max-w-xl mx-auto px-4 py-16 text-center space-y-20 relative">
        {/* Header Arabesque */}
        <section className="space-y-4 pt-8">
          <div className="flex justify-center text-[#5eead4] mb-2">
            <Moon className="w-8 h-8" />
          </div>

          <p className="text-sm font-serif text-[#5eead4] tracking-widest">
            磨?卍??? 碼?????? 碼?邈??幕???鳴?? 碼?邈??幕????
          </p>

          <p className="text-xs uppercase tracking-[0.35em] text-emerald-400 font-medium">
            Walimatul &apos;Ursy
          </p>

          <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-wide text-emerald-100">
            {data.coupleInfo.groomName}
            <span className="block text-2xl font-serif text-[#5eead4] my-2">&amp;</span>
            {data.coupleInfo.brideName}
          </h1>

          {primaryEvent?.date && (
            <p className="text-xs tracking-widest text-emerald-200 uppercase font-medium pt-2">
              {new Date(primaryEvent.date).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </section>

        {/* Ayat Quran & Greeting */}
        <section className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0d342c]/70 border border-[#134e4a] text-center max-w-lg mx-auto space-y-3">
            <p className="text-xs font-serif text-emerald-300 leading-loose">
              ?????? 笠??碼魔??? 粒??? 漠????? ?????? ???? 粒?????卍????? 粒?万???碼寞?碼 ??魔?卍??????碼 瑪???????碼
              ??寞?晩??? 磨????????? ????膜??馬? ??邈?幕???馬?
            </p>
            <p className="text-xs text-emerald-100 italic leading-relaxed">
              &quot;{data.coupleInfo.greetingMessage ||
                "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."}&quot;
            </p>
            <p className="text-[11px] uppercase tracking-widest text-emerald-400 font-semibold">
              (QS. Ar-Rum: 21)
            </p>
          </div>
        </section>

        {/* Countdown */}
        {primaryEvent?.date && (
          <section className="py-6 px-4 rounded-3xl bg-[#0d342c]/70 border border-[#134e4a]">
            <p className="text-xs tracking-widest uppercase text-emerald-400 mb-2 font-medium">
              Menuju Hari Akad
            </p>
            <CountdownTimer
              targetDate={primaryEvent.date}
              themeStyle={{
                boxClass: "bg-[#071d18] border-[#134e4a] shadow-inner",
                numberClass: "text-[#5eead4] font-serif",
                labelClass: "text-emerald-200 font-semibold",
              }}
            />
          </section>
        )}

        {/* Couple Info */}
        <section id="couple" className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          {/* Groom */}
          <div className="p-6 rounded-3xl bg-[#0d342c]/70 border border-[#134e4a] space-y-3">
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-[#071d18] border-2 border-emerald-500/40 flex items-center justify-center">
              {data.coupleInfo.groomPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.coupleInfo.groomPhoto}
                  alt={data.coupleInfo.groomName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Heart className="w-8 h-8 text-emerald-400" />
              )}
            </div>
            <h3 className="font-serif text-lg text-emerald-100 font-medium">
              {data.coupleInfo.groomName}
            </h3>
            {(data.coupleInfo.groomFather || data.coupleInfo.groomMother) && (
              <p className="text-xs text-emerald-200">
                Putra dari Bpk. {data.coupleInfo.groomFather || "..."} &amp; Ibu{" "}
                {data.coupleInfo.groomMother || "..."}
              </p>
            )}
            {data.coupleInfo.groomInstagram && (
              <a
                href={`https://instagram.com/${data.coupleInfo.groomInstagram}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>@{data.coupleInfo.groomInstagram}</span>
              </a>
            )}
          </div>

          {/* Bride */}
          <div className="p-6 rounded-3xl bg-[#0d342c]/70 border border-[#134e4a] space-y-3">
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-[#071d18] border-2 border-emerald-500/40 flex items-center justify-center">
              {data.coupleInfo.bridePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.coupleInfo.bridePhoto}
                  alt={data.coupleInfo.brideName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Heart className="w-8 h-8 text-emerald-400" />
              )}
            </div>
            <h3 className="font-serif text-lg text-emerald-100 font-medium">
              {data.coupleInfo.brideName}
            </h3>
            {(data.coupleInfo.brideFather || data.coupleInfo.brideMother) && (
              <p className="text-xs text-emerald-200">
                Putri dari Bpk. {data.coupleInfo.brideFather || "..."} &amp; Ibu{" "}
                {data.coupleInfo.brideMother || "..."}
              </p>
            )}
            {data.coupleInfo.brideInstagram && (
              <a
                href={`https://instagram.com/${data.coupleInfo.brideInstagram}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>@{data.coupleInfo.brideInstagram}</span>
              </a>
            )}
          </div>
        </section>

        {/* Love Story */}
        {data.coupleInfo.stories && data.coupleInfo.stories.length > 0 && (
          <section id="cerita" className="space-y-8">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-emerald-400">
                Kisah Ta&apos;aruf &amp; Menuju Halal
              </p>
              <h2 className="text-2xl font-serif text-emerald-100">Perjalanan Cinta Penuh Berkah</h2>
            </div>

            <div className="space-y-6 max-w-lg mx-auto text-left relative border-l-2 border-emerald-500/40 ml-4 pl-6 sm:ml-auto">
              {data.coupleInfo.stories.map((story, idx) => (
                <div key={idx} className="relative space-y-1.5">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-xs" />
                  <span className="text-xs font-semibold text-emerald-400 font-sans tracking-wide">
                    {story.date}
                  </span>
                  <h4 className="font-serif text-base font-medium text-emerald-200">
                    {story.title}
                  </h4>
                  {story.imageUrl && (
                    <div className="my-2 rounded-xl overflow-hidden border border-emerald-500/30 shadow-md max-w-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={story.imageUrl}
                        alt={story.title || "Foto Momen Cerita"}
                        className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
                    {story.story}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Schedules */}
        <section id="event" className="space-y-8">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-emerald-400">
              Waktu &amp; Tempat
            </p>
            <h2 className="text-2xl font-serif text-emerald-100">Rangkaian Acara Akad &amp; Resepsi</h2>
          </div>

          <div className="space-y-6">
            {data.eventSchedules.map((schedule) => (
              <div
                key={schedule.id ?? schedule.eventName}
                className="p-6 rounded-3xl bg-[#0d342c]/70 border border-[#134e4a] shadow-sm space-y-4"
              >
                <h3 className="text-xl font-serif text-emerald-200">{schedule.eventName}</h3>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    {new Date(schedule.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    {schedule.startTime} {schedule.endTime ? `- ${schedule.endTime}` : "WIB"}
                  </span>
                </div>

                <GoogleMapEmbed
                  venueName={schedule.venueName}
                  address={schedule.address}
                  mapsUrl={schedule.mapsUrl}
                  latitude={schedule.latitude}
                  longitude={schedule.longitude}
                  themeStyle={{
                    cardClass: "bg-[#071d18] border border-[#134e4a] text-emerald-100",
                    venueNameClass: "text-emerald-200 font-serif font-bold",
                    addressClass: "text-emerald-200/90 text-xs",
                    buttonClass: "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold",
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Gallery */}
        {data.galleries && data.galleries.length > 0 && (
          <section id="gallery" className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-emerald-400">Galeri Foto</p>
              <h2 className="text-2xl font-serif text-emerald-100">Dokumentasi Kenangan</h2>
            </div>
            <div className="columns-2 gap-3 space-y-3">
              {data.galleries.map((img, idx) => (
                <div
                  key={img.id ?? idx}
                  className="break-inside-avoid rounded-none overflow-hidden bg-[#071d18] border border-[#134e4a]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.imageUrl}
                    alt={img.caption || `Gallery ${idx + 1}`}
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 block"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Digital Gift Box */}
        <section id="gift">
          <DigitalGiftBox
            bankAccounts={data.bankAccounts}
            themeStyle={{
              titleClass: "text-emerald-100 font-serif",
              subtitleClass: "text-emerald-200",
              cardClass: "bg-[#0d342c]/90 border border-[#134e4a] text-emerald-100",
              badgeClass: "bg-[#071d18] text-[#5eead4] border border-[#134e4a]",
              accountNumberClass: "text-[#5eead4] font-mono font-bold",
              accountHolderClass: "text-emerald-200",
              qrisButtonClass: "text-[#5eead4] hover:text-emerald-200 font-semibold",
              buttonClass: "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold",
            }}
          />
        </section>

        {/* Wishes & RSVP */}
        <section id="wishes" className="space-y-12">
          {/* RSVP Form */}
          <RsvpFormSection
            invitationId={data.id}
            defaultGuestName={guestName}
            themeStyle={{
              cardClass: "bg-[#0d342c]/90 border border-[#134e4a] text-emerald-100",
              titleClass: "text-emerald-100 font-serif",
              subtitleClass: "text-emerald-200",
              labelClass: "text-emerald-200 font-medium",
              statusButtonClass: "bg-[#071d18] border-[#134e4a] text-emerald-200 hover:border-emerald-400",
              statusButtonActiveClass: "bg-emerald-600 border-emerald-600 text-white font-semibold shadow-sm",
              buttonClass: "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold",
              inputClass: "bg-[#071d18] border-[#134e4a] text-emerald-100 focus:ring-emerald-500 placeholder:text-emerald-400/40",
              submittedTitleClass: "text-emerald-200 font-serif",
              submittedSubtitleClass: "text-emerald-100",
            }}
          />

          {/* Wishes Wall */}
          <WishesWallSection
            invitationId={data.id}
            themeStyle={{
              cardClass: "bg-[#0d342c]/90 border border-[#134e4a] text-emerald-100",
              titleClass: "text-emerald-100 font-serif",
              subtitleClass: "text-emerald-200",
              bubbleClass: "bg-[#071d18] border border-[#134e4a] text-emerald-100",
              senderClass: "text-[#5eead4] font-bold",
              messageClass: "text-emerald-100",
              dateClass: "text-emerald-300 font-mono",
              emptyTextClass: "text-emerald-300/80",
              loadingTextClass: "text-emerald-300/80",
              reactionButtonClass: "hover:bg-[#071d18]",
              buttonClass: "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold",
              inputClass: "bg-[#071d18] border-[#134e4a] text-emerald-100 focus:ring-emerald-500 placeholder:text-emerald-400/40",
            }}
          />
        </section>

        <footer className="pt-12 pb-8 text-emerald-400 text-xs tracking-wider">
          <p>FASARO &bull; Syar&apos;i Islamic Wedding Theme</p>
        </footer>
      </main>
    </div>
  );
};

export default SyariTheme;

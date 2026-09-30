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
import { Calendar, Clock, Feather, Heart } from "lucide-react";
import InstagramIcon from "../shared/InstagramIcon";

interface ThemeProps {
  data: WeddingInvitationData;
  guestName?: string;
  showCover?: boolean;
  isEmbedded?: boolean;
}

export const RusticTheme: React.FC<ThemeProps> = ({
  data,
  guestName,
  showCover = true,
  isEmbedded = false,
}) => {
  const [isOpen, setIsOpen] = useState(!showCover);
  const primaryEvent = data.eventSchedules[0];

  return (
    <div className="min-h-screen bg-[#faf5ee] text-[#4a3b32] font-serif selection:bg-[#ecd9c6]">
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
            containerClass: "bg-[#2d221c]/90 text-[#faf5ee]",
            cardClass: "bg-[#382b24]/95 text-[#faf5ee] border-2 border-[#8a6847]/60 shadow-2xl",
            titleClass: "text-[#ecd9c6] font-serif",
            badgeClass: "text-[#ecd9c6] tracking-widest font-medium",
            guestBoxClass: "bg-[#281e18] border border-[#8a6847]/40 text-[#faf5ee] shadow-inner",
            guestLabelClass: "text-[#ecd9c6]/90 font-medium",
            guestNameClass: "text-[#faf5ee] font-bold",
            guestSubtextClass: "text-[#ecd9c6]/70",
            dateClass: "text-[#ecd9c6] font-semibold tracking-widest",
            buttonClass: "bg-[#966b43] hover:bg-[#835b36] text-[#faf5ee] shadow-[#2d221c]/40 font-semibold",
          }}
        />
      )}

      {!isEmbedded && (
        <FloatingAudioPlayer audioUrl={data.musicUrl} autoPlayTrigger={isOpen} />
      )}

      <main className="max-w-xl mx-auto px-4 py-16 text-center space-y-20 relative">
        {/* Botanical Flourish Header */}
        <section className="space-y-4 pt-8">
          <div className="flex justify-center text-[#966b43] mb-2">
            <Feather className="w-7 h-7 rotate-45" />
          </div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#966b43] font-sans font-semibold">
            Pernikahan Impian
          </p>
          <h1 className="text-4xl sm:text-6xl font-serif tracking-normal text-[#382b24]">
            {data.coupleInfo.groomName}
            <span className="block text-2xl font-serif text-[#966b43] my-2">&amp;</span>
            {data.coupleInfo.brideName}
          </h1>
          {primaryEvent?.date && (
            <p className="text-sm font-sans tracking-widest text-[#5c4333] font-semibold uppercase pt-2">
              {new Date(primaryEvent.date).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </section>

        {/* Countdown */}
        {primaryEvent?.date && (
          <section className="py-6 px-4 rounded-3xl bg-[#f2e6d6]/80 border border-[#dfcdb9]">
            <p className="text-xs font-sans tracking-widest uppercase text-[#966b43] mb-2 font-semibold">
              Menghitung Hari Bahagia
            </p>
            <CountdownTimer
              targetDate={primaryEvent.date}
              themeStyle={{
                boxClass: "bg-[#faf5ee] border-[#dfcdb9] shadow-sm",
                numberClass: "text-[#382b24] font-serif",
                labelClass: "text-[#5c4333] font-sans font-semibold",
              }}
            />
          </section>
        )}

        {/* Story / Greeting */}
        <section id="couple" className="space-y-12">
          <div className="max-w-md mx-auto px-4">
            <p className="text-sm text-[#5c4333] italic leading-relaxed">
              &quot;{data.coupleInfo.greetingMessage ||
                "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya."}&quot;
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            {/* Groom */}
            <div className="p-6 rounded-3xl bg-[#f7eedf] border border-[#dfcdb9] space-y-3 shadow-sm">
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden bg-[#ecd9c6] border-4 border-[#faf5ee] shadow flex items-center justify-center">
                {data.coupleInfo.groomPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.coupleInfo.groomPhoto}
                    alt={data.coupleInfo.groomName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Heart className="w-8 h-8 text-[#966b43]" />
                )}
              </div>
              <h3 className="font-serif text-xl font-medium text-[#382b24]">
                {data.coupleInfo.groomName}
              </h3>
              {(data.coupleInfo.groomFather || data.coupleInfo.groomMother) && (
                <p className="text-xs font-sans text-[#5c4333] font-medium">
                  Putra dari Bpk. {data.coupleInfo.groomFather || "..."} &amp; Ibu{" "}
                  {data.coupleInfo.groomMother || "..."}
                </p>
              )}
              {data.coupleInfo.groomInstagram && (
                <a
                  href={`https://instagram.com/${data.coupleInfo.groomInstagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-sans text-[#966b43] hover:underline"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>@{data.coupleInfo.groomInstagram}</span>
                </a>
              )}
            </div>

            {/* Bride */}
            <div className="p-6 rounded-3xl bg-[#f7eedf] border border-[#dfcdb9] space-y-3 shadow-sm">
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden bg-[#ecd9c6] border-4 border-[#faf5ee] shadow flex items-center justify-center">
                {data.coupleInfo.bridePhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.coupleInfo.bridePhoto}
                    alt={data.coupleInfo.brideName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Heart className="w-8 h-8 text-[#966b43]" />
                )}
              </div>
              <h3 className="font-serif text-xl font-medium text-[#382b24]">
                {data.coupleInfo.brideName}
              </h3>
              {(data.coupleInfo.brideFather || data.coupleInfo.brideMother) && (
                <p className="text-xs font-sans text-[#5c4333] font-medium">
                  Putri dari Bpk. {data.coupleInfo.brideFather || "..."} &amp; Ibu{" "}
                  {data.coupleInfo.brideMother || "..."}
                </p>
              )}
              {data.coupleInfo.brideInstagram && (
                <a
                  href={`https://instagram.com/${data.coupleInfo.brideInstagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-sans text-[#966b43] hover:underline"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>@{data.coupleInfo.brideInstagram}</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Love Story */}
        {data.coupleInfo.stories && data.coupleInfo.stories.length > 0 && (
          <section id="cerita" className="space-y-8">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-[#966b43] font-sans">
                Kisah Kasih
              </p>
              <h2 className="text-3xl font-serif text-[#382b24]">Awal Mula Perjumpaan</h2>
            </div>

            <div className="space-y-6 max-w-lg mx-auto text-left relative border-l-2 border-[#dfcdb9] ml-4 pl-6 sm:ml-auto">
              {data.coupleInfo.stories.map((story, idx) => (
                <div key={idx} className="relative space-y-1.5">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#966b43] border-2 border-white shadow-xs" />
                  <span className="text-xs font-semibold text-[#966b43] font-sans tracking-wide">
                    {story.date}
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#382b24]">
                    {story.title}
                  </h4>
                  {story.imageUrl && (
                    <div className="my-2 rounded-xl overflow-hidden border border-[#dfcdb9] shadow-xs max-w-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={story.imageUrl}
                        alt={story.title || "Foto Momen Cerita"}
                        className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <p className="text-xs text-[#5c4333] leading-relaxed font-normal">
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
            <p className="text-xs uppercase tracking-widest text-[#966b43] font-sans">
              Waktu &amp; Lokasi
            </p>
            <h2 className="text-3xl font-serif text-[#382b24]">Rangkaian Acara</h2>
          </div>

          <div className="space-y-6">
            {data.eventSchedules.map((schedule) => (
              <div
                key={schedule.id ?? schedule.eventName}
                className="p-6 sm:p-8 rounded-3xl bg-[#f7eedf] border border-[#dfcdb9] shadow-sm space-y-4"
              >
                <h3 className="text-2xl font-serif font-medium text-[#382b24]">
                  {schedule.eventName}
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-sans text-[#5c4333] font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#966b43]" />
                    {new Date(schedule.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#966b43]" />
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
                    cardClass: "bg-[#f2e6d6] border border-[#dfcdb9] text-[#382b24]",
                    venueNameClass: "text-[#382b24] font-serif font-bold text-base",
                    addressClass: "text-[#5c4333] text-xs font-sans",
                    buttonClass: "bg-[#966b43] hover:bg-[#835b36] text-white font-semibold font-sans",
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
              <p className="text-xs uppercase tracking-widest text-[#966b43] font-sans">
                Kenangan Indah
              </p>
              <h2 className="text-3xl font-serif text-[#382b24]">Galeri Momen</h2>
            </div>
            <div className="columns-2 gap-3 space-y-3">
              {data.galleries.map((img, idx) => (
                <div
                  key={img.id ?? idx}
                  className="break-inside-avoid rounded-none overflow-hidden bg-[#ecd9c6] border-2 border-[#dfcdb9] shadow-inner"
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
              titleClass: "text-[#382b24] font-serif",
              subtitleClass: "text-[#5c4333]",
              cardClass: "bg-[#f7eedf] border border-[#dfcdb9] text-[#382b24]",
              badgeClass: "bg-[#ecd9c6] text-[#382b24] font-bold border border-[#dfcdb9]",
              accountNumberClass: "text-[#382b24] font-mono font-bold",
              accountHolderClass: "text-[#5c4333]",
              qrisButtonClass: "text-[#966b43] hover:text-[#835b36] font-semibold",
              buttonClass: "bg-[#966b43] hover:bg-[#835b36] text-white font-medium",
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
              cardClass: "bg-[#f7eedf] border border-[#dfcdb9] text-[#382b24]",
              titleClass: "text-[#382b24] font-serif",
              subtitleClass: "text-[#5c4333]",
              labelClass: "text-[#382b24] font-semibold font-sans",
              statusButtonClass: "bg-[#faf5ee] border-[#dfcdb9] text-[#382b24] hover:border-[#966b43]",
              statusButtonActiveClass: "bg-[#966b43] border-[#966b43] text-white font-semibold shadow-sm",
              buttonClass: "bg-[#966b43] hover:bg-[#835b36] text-white font-semibold font-sans",
              inputClass: "bg-[#faf5ee] border-[#dfcdb9] text-[#382b24] placeholder:text-[#8a7263]",
              submittedTitleClass: "text-[#382b24] font-serif",
              submittedSubtitleClass: "text-[#5c4333]",
            }}
          />

          {/* Wishes Wall */}
          <WishesWallSection
          invitationId={data.id}
          themeStyle={{
            cardClass: "bg-[#f7eedf] border border-[#dfcdb9] text-[#382b24]",
            titleClass: "text-[#382b24] font-serif",
            subtitleClass: "text-[#5c4333]",
            bubbleClass: "bg-[#faf5ee] border border-[#dfcdb9] text-[#4a3b32]",
            senderClass: "text-[#382b24] font-serif font-bold",
            messageClass: "text-[#4a3b32] font-sans",
            dateClass: "text-[#786152] font-sans",
            emptyTextClass: "text-[#786152]",
            loadingTextClass: "text-[#786152]",
            reactionButtonClass: "hover:bg-[#ecd9c6]",
            buttonClass: "bg-[#966b43] hover:bg-[#835b36] text-white font-semibold font-sans",
            inputClass: "bg-[#faf5ee] border-[#dfcdb9] text-[#382b24] placeholder:text-[#8a7263]",
          }}
        />
      </section>

        <footer className="pt-12 pb-8 text-[#966b43] text-xs font-sans tracking-wider">
          <p>FASARO &bull; Rustic Wedding Theme</p>
        </footer>
      </main>
    </div>
  );
};

export default RusticTheme;

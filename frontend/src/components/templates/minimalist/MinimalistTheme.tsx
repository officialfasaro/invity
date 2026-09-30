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
import { Calendar, Clock, Heart } from "lucide-react";
import InstagramIcon from "../shared/InstagramIcon";

interface ThemeProps {
  data: WeddingInvitationData;
  guestName?: string;
  showCover?: boolean;
  isEmbedded?: boolean;
}

export const MinimalistTheme: React.FC<ThemeProps> = ({
  data,
  guestName,
  showCover = true,
  isEmbedded = false,
}) => {
  const [isOpen, setIsOpen] = useState(!showCover);
  const primaryEvent = data.eventSchedules[0];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200">
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
            containerClass: "bg-stone-950/90 text-stone-100",
            cardClass: "bg-white text-stone-900 border border-stone-200 shadow-2xl",
            titleClass: "text-stone-900 font-serif",
            badgeClass: "text-stone-600 font-medium tracking-widest",
            guestBoxClass: "bg-stone-50 border border-stone-200 text-stone-900 shadow-sm",
            guestLabelClass: "text-stone-600 font-medium",
            guestNameClass: "text-stone-900 font-bold",
            guestSubtextClass: "text-stone-500",
            dateClass: "text-stone-700 font-semibold tracking-widest",
            buttonClass: "bg-stone-900 hover:bg-stone-800 text-white font-medium shadow-md",
          }}
        />
      )}

      {!isEmbedded && (
        <FloatingAudioPlayer audioUrl={data.musicUrl} autoPlayTrigger={isOpen} />
      )}

      <main className="max-w-xl mx-auto px-4 py-16 text-center space-y-20">
        {/* Header Hero */}
        <section className="space-y-4 pt-10">
          <p className="text-xs uppercase tracking-[0.4em] text-stone-600 font-semibold">
            The Wedding Of
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-stone-900">
            {data.coupleInfo.groomName}
            <span className="block text-2xl font-serif text-stone-500 my-2">&amp;</span>
            {data.coupleInfo.brideName}
          </h1>
          {primaryEvent?.date && (
            <p className="text-xs tracking-widest text-stone-700 uppercase font-semibold pt-2">
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
          <section className="border-y border-stone-200 py-8">
            <p className="text-xs tracking-widest uppercase text-stone-600 mb-2 font-semibold">Menghitung Hari</p>
            <CountdownTimer
              targetDate={primaryEvent.date}
              themeStyle={{
                boxClass: "bg-white border-stone-200 shadow-sm",
                numberClass: "text-stone-900 font-serif",
                labelClass: "text-stone-600 font-semibold",
              }}
            />
          </section>
        )}

        {/* Couple Info */}
        <section id="couple" className="space-y-12">
          <div className="max-w-md mx-auto">
            <p className="text-xs text-stone-700 italic leading-relaxed font-serif">
              &quot;{data.coupleInfo.greetingMessage ||
                "Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Dengan memohon rahmat dan ridho-Nya, kami bermaksud menyelenggarakan pernikahan kami."}&quot;
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            {/* Groom */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-3">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-stone-100 border-2 border-stone-200 flex items-center justify-center">
                {data.coupleInfo.groomPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.coupleInfo.groomPhoto}
                    alt={data.coupleInfo.groomName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Heart className="w-8 h-8 text-stone-400" />
                )}
              </div>
              <h3 className="font-serif text-lg font-medium text-stone-900">{data.coupleInfo.groomName}</h3>
              {(data.coupleInfo.groomFather || data.coupleInfo.groomMother) && (
                <p className="text-xs text-stone-600 font-medium">
                  Putra dari Bpk. {data.coupleInfo.groomFather || "..."} &amp; Ibu{" "}
                  {data.coupleInfo.groomMother || "..."}
                </p>
              )}
              {data.coupleInfo.groomInstagram && (
                <a
                  href={`https://instagram.com/${data.coupleInfo.groomInstagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-medium"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>@{data.coupleInfo.groomInstagram}</span>
                </a>
              )}
            </div>

            {/* Bride */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-3">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-stone-100 border-2 border-stone-200 flex items-center justify-center">
                {data.coupleInfo.bridePhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.coupleInfo.bridePhoto}
                    alt={data.coupleInfo.brideName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Heart className="w-8 h-8 text-stone-400" />
                )}
              </div>
              <h3 className="font-serif text-lg font-medium text-stone-900">{data.coupleInfo.brideName}</h3>
              {(data.coupleInfo.brideFather || data.coupleInfo.brideMother) && (
                <p className="text-xs text-stone-600 font-medium">
                  Putri dari Bpk. {data.coupleInfo.brideFather || "..."} &amp; Ibu{" "}
                  {data.coupleInfo.brideMother || "..."}
                </p>
              )}
              {data.coupleInfo.brideInstagram && (
                <a
                  href={`https://instagram.com/${data.coupleInfo.brideInstagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-medium"
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
              <p className="text-xs uppercase tracking-widest text-stone-600 font-semibold">
                Kisah Kami
              </p>
              <h2 className="text-2xl font-serif font-light text-stone-900">Perjalanan Cinta</h2>
            </div>

            <div className="space-y-6 max-w-lg mx-auto text-left relative border-l-2 border-stone-300 ml-4 pl-6 sm:ml-auto">
              {data.coupleInfo.stories.map((story, idx) => (
                <div key={idx} className="relative space-y-1.5">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-stone-700 border-2 border-white shadow-xs" />
                  <span className="text-xs font-semibold text-stone-600 font-sans tracking-wide">
                    {story.date}
                  </span>
                  <h4 className="font-serif text-base font-medium text-stone-900">
                    {story.title}
                  </h4>
                  {story.imageUrl && (
                    <div className="my-2 rounded-xl overflow-hidden border border-stone-200 shadow-xs max-w-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={story.imageUrl}
                        alt={story.title || "Foto Momen Cerita"}
                        className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
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
            <p className="text-xs uppercase tracking-widest text-stone-600 font-semibold">Rangkaian Acara</p>
            <h2 className="text-2xl font-serif font-light text-stone-900">Agenda Bahagia</h2>
          </div>

          <div className="space-y-6">
            {data.eventSchedules.map((schedule) => (
              <div
                key={schedule.id ?? schedule.eventName}
                className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4"
              >
                <h3 className="text-lg font-serif font-semibold text-stone-900">{schedule.eventName}</h3>
                <div className="flex items-center justify-center gap-6 text-xs text-stone-700 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-stone-600" />
                    {new Date(schedule.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-stone-600" />
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
                    cardClass: "bg-stone-50 border border-stone-200 text-stone-900",
                    venueNameClass: "text-stone-900 font-semibold",
                    addressClass: "text-stone-600 text-xs",
                    buttonClass: "bg-stone-900 hover:bg-stone-800 text-white font-medium",
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
              <p className="text-xs uppercase tracking-widest text-stone-600 font-semibold">Galeri Foto</p>
              <h2 className="text-2xl font-serif font-light text-stone-900">Momen Bahagia</h2>
            </div>
            <div className="columns-2 gap-3 space-y-3">
              {data.galleries.map((img, idx) => (
                <div
                  key={img.id ?? idx}
                  className="break-inside-avoid rounded-none overflow-hidden bg-stone-100 border border-stone-200"
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
              titleClass: "text-stone-900 font-serif",
              subtitleClass: "text-stone-600",
              cardClass: "bg-white border border-stone-200 text-stone-900",
              badgeClass: "bg-stone-100 text-stone-800 font-bold border border-stone-200",
              accountNumberClass: "text-stone-900 font-mono font-bold",
              accountHolderClass: "text-stone-600",
              qrisButtonClass: "text-amber-700 hover:text-amber-800 font-semibold",
              buttonClass: "bg-stone-900 hover:bg-stone-800 text-white font-medium",
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
              cardClass: "bg-white border border-stone-200 text-stone-900 shadow-sm",
              titleClass: "text-stone-900 font-serif",
              subtitleClass: "text-stone-600",
              labelClass: "text-stone-800 font-medium",
              statusButtonClass: "bg-white border-stone-300 text-stone-700 hover:border-stone-900",
              statusButtonActiveClass: "bg-stone-900 border-stone-900 text-white font-semibold shadow-sm",
              buttonClass: "bg-stone-900 hover:bg-stone-800 text-white font-medium",
              inputClass: "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400",
              submittedTitleClass: "text-stone-900 font-serif",
              submittedSubtitleClass: "text-stone-600",
            }}
          />

          {/* Wishes Wall */}
          <WishesWallSection
            invitationId={data.id}
            themeStyle={{
              cardClass: "bg-white border border-stone-200 text-stone-900 shadow-sm",
              titleClass: "text-stone-900 font-serif",
              subtitleClass: "text-stone-600",
              bubbleClass: "bg-stone-50 border border-stone-200 text-stone-800",
              senderClass: "text-stone-900 font-bold",
              messageClass: "text-stone-800",
              dateClass: "text-stone-500 font-medium",
              emptyTextClass: "text-stone-500",
              loadingTextClass: "text-stone-500",
              buttonClass: "bg-stone-900 hover:bg-stone-800 text-white font-medium",
              inputClass: "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400",
            }}
          />
        </section>

        <footer className="pt-12 pb-8 text-stone-600 text-xs tracking-wider font-medium">
          <p>FASARO &bull; Digital Wedding Invitation</p>
        </footer>
      </main>
    </div>
  );
};

export default MinimalistTheme;

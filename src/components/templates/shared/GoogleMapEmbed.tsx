"use client";

import React, { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

export function getGoogleMapsEmbedUrl(
  venueName?: string,
  address?: string,
  mapsUrl?: string | null,
  latitude?: number | null,
  longitude?: number | null
): string {
  // 1. If user provided a raw iframe embed code in mapsUrl, extract src
  if (mapsUrl && mapsUrl.includes("<iframe")) {
    const srcMatch = mapsUrl.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }
  }

  // 2. If mapsUrl is already an embed URL
  if (mapsUrl && (mapsUrl.includes("maps/embed") || mapsUrl.includes("output=embed"))) {
    return mapsUrl;
  }

  // 3. If explicit lat and lng are provided
  if (latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
    return `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // 4. If mapsUrl contains coordinates like @-6.234,106.823 or ?q=-6.234,106.823
  if (mapsUrl) {
    const coordMatch =
      mapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
      mapsUrl.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
      mapsUrl.match(/query=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // 5. Construct search query from venue name and address
  const query = [venueName?.trim(), address?.trim()].filter(Boolean).join(", ");
  if (query) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // 6. Fallback default
  return `https://maps.google.com/maps?q=Indonesia&t=&z=12&ie=UTF8&iwloc=&output=embed`;
}

export function getGoogleMapsDirectionUrl(
  venueName?: string,
  address?: string,
  mapsUrl?: string | null,
  latitude?: number | null,
  longitude?: number | null
): string {
  if (mapsUrl && !mapsUrl.includes("<iframe") && (mapsUrl.startsWith("http://") || mapsUrl.startsWith("https://"))) {
    return mapsUrl;
  }
  if (latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }
  const query = [venueName?.trim(), address?.trim()].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || "Indonesia")}`;
}

export interface GoogleMapEmbedProps {
  venueName: string;
  address: string;
  mapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  heightClass?: string;
  showDetailsCard?: boolean;
  themeStyle?: {
    cardClass?: string;
    venueNameClass?: string;
    addressClass?: string;
    mapContainerClass?: string;
    badgeClass?: string;
  };
}

export const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({
  venueName,
  address,
  mapsUrl,
  latitude,
  longitude,
  heightClass = "h-48 sm:h-56",
  showDetailsCard = false,
  themeStyle,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const embedUrl = getGoogleMapsEmbedUrl(venueName, address, mapsUrl, latitude, longitude);

  return (
    <div className="w-full flex flex-col gap-2.5">
      {showDetailsCard && (
        <div
          className={`p-3.5 border text-center ${
            themeStyle?.cardClass ?? "bg-white/80 border-stone-200 text-stone-900"
          }`}
        >
          <h4
            className={`font-semibold text-sm ${
              themeStyle?.venueNameClass ?? "text-stone-900"
            }`}
          >
            {venueName}
          </h4>
          <p
            className={`text-xs mt-1 leading-relaxed ${
              themeStyle?.addressClass ?? "text-stone-600"
            }`}
          >
            {address}
          </p>
        </div>
      )}

      {/* Google Maps Container */}
      <div
        className={`w-full ${heightClass} relative overflow-hidden border shadow-inner ${
          themeStyle?.mapContainerClass ?? "border-[#c5a880]/35 bg-[#f7f2ea]"
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f7f2ea] text-[#6b615b] z-10 pointer-events-none">
            <div className="flex items-center gap-2 text-xs font-serif">
              <Loader2 className="w-4 h-4 animate-spin text-[#6c1d28]" />
              <span>Memuat Google Maps...</span>
            </div>
          </div>
        )}

        <iframe
          src={embedUrl}
          className="w-full h-full border-0 block"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          title={`Peta Lokasi ${venueName || "Acara"}`}
          onLoad={() => setIsLoading(false)}
        />

        {/* Floating Venue Badge */}
        <div
          className={`absolute bottom-2 right-2 backdrop-blur-xs text-[9px] px-2 py-0.5 pointer-events-none flex items-center gap-1.5 shadow-sm z-20 ${
            themeStyle?.badgeClass ?? "bg-[#2a2421]/80 text-[#f9f6f0]"
          }`}
        >
          <MapPin className="w-2.5 h-2.5 text-[#c5a880]" />
          <span>{venueName}</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapEmbed;

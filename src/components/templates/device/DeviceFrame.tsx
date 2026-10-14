"use client";

import React from "react";
import Image from "next/image";

interface DeviceFrameProps {
  children: React.ReactNode;
  deviceType?: "mobile" | "tablet";
  className?: string;
  screenClassName?: string;
}

/**
 * DeviceFrame component using official mockup templates from /templates/device.
 * Provides a pixel-accurate smartphone frame with scrollable inner viewport.
 */
export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  deviceType = "mobile",
  className = "",
  screenClassName = "",
}) => {
  const isTablet = deviceType === "tablet";
  const frameSrc = isTablet
    ? "/templates/device/tablet.png"
    : "/templates/device/mobile.png";

  return (
    <div
      className={`relative select-none isolate flex items-center justify-center ${className}`}
    >
      {/* Phone chassis & screen container */}
      <div
        className={`relative w-full ${
          isTablet
            ? "aspect-[780/1226] max-w-[440px]"
            : "aspect-[874/1777] max-w-[340px] sm:max-w-[360px]"
        } bg-[#0A0D14] rounded-[44px] shadow-2xl overflow-hidden border border-slate-800`}
      >
        {/* Inner Scrollable Screen */}
        <div
          className={`absolute inset-[7px] sm:inset-[8px] rounded-[38px] overflow-y-auto overflow-x-hidden no-scrollbar bg-white relative z-10 scroll-smooth ${screenClassName}`}
        >
          {children}
        </div>

        {/* Device Bezel / Notch Frame Overlay (Template Device PNG) */}
        <Image
          src={frameSrc}
          alt={isTablet ? "Tablet Template Device" : "Mobile Template Device"}
          fill
          sizes="(max-width: 768px) 340px, 360px"
          priority
          className="pointer-events-none absolute inset-0 w-full h-full object-fill select-none z-20 drop-shadow-sm"
        />
      </div>
    </div>
  );
};

export default DeviceFrame;

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Disc3, VolumeX } from "lucide-react";

interface FloatingAudioPlayerProps {
  audioUrl?: string | null;
  autoPlayTrigger?: boolean;
}

export const FloatingAudioPlayer: React.FC<FloatingAudioPlayerProps> = ({
  audioUrl,
  autoPlayTrigger = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Default pleasant instrumental audio if none provided
  const sourceUrl =
    audioUrl ||
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      window.dispatchEvent(
        new CustomEvent("fasaro:music-state", { detail: { isPlaying: false } })
      );
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          window.dispatchEvent(
            new CustomEvent("fasaro:music-state", { detail: { isPlaying: true } })
          );
        })
        .catch(() => {
          setIsPlaying(false);
          window.dispatchEvent(
            new CustomEvent("fasaro:music-state", { detail: { isPlaying: false } })
          );
        });
    }
  }, [isPlaying]);

  useEffect(() => {
    if (autoPlayTrigger && audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          window.dispatchEvent(
            new CustomEvent("fasaro:music-state", { detail: { isPlaying: true } })
          );
        })
        .catch(() => {
          setIsPlaying(false);
          window.dispatchEvent(
            new CustomEvent("fasaro:music-state", { detail: { isPlaying: false } })
          );
        });
    }
  }, [autoPlayTrigger]);

  useEffect(() => {
    const handleToggle = () => {
      togglePlay();
    };
    window.addEventListener("fasaro:music-toggle", handleToggle);
    return () => {
      window.removeEventListener("fasaro:music-toggle", handleToggle);
    };
  }, [togglePlay]);

  return (
    <>
      <audio ref={audioRef} src={sourceUrl} loop preload="auto" />
      {/* Mobile Floating Audio Button (Positioned above bottom nav, hidden on desktop) */}
      <div className="fixed bottom-16 right-4 sm:bottom-16 sm:right-6 lg:hidden z-40 transform-gpu will-change-transform">
        <button
          onClick={togglePlay}
          aria-label="Toggle Audio"
          className="relative flex items-center justify-center w-11 h-11 rounded-full bg-stone-900/90 hover:bg-stone-900 text-amber-300 border border-amber-400/30 shadow-xl backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
        >
          {isPlaying ? (
            <>
              <Disc3 className="w-5 h-5 animate-spin text-amber-400" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </>
          ) : (
            <VolumeX className="w-4 h-4 text-stone-400" />
          )}
        </button>
      </div>
    </>
  );
};

export default FloatingAudioPlayer;

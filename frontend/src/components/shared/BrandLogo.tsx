"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

interface BrandLogoProps {
  className?: string;
  imgClassName?: string;
  iconBoxClassName?: string;
  heartIconClassName?: string;
  textClassName?: string;
  subtextClassName?: string;
  showText?: boolean;
  showSubtext?: boolean;
  href?: string;
}

// Global cached logo state to prevent layout shift between page navigations
let cachedLogoUrl: string | null = null;

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "flex items-center gap-2.5 group",
  imgClassName = "h-8 max-w-[140px] object-contain",
  iconBoxClassName = "w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105",
  heartIconClassName = "w-4 h-4 fill-white",
  textClassName = "text-xl font-bold tracking-tight text-slate-900",
  subtextClassName = "text-[10px] font-medium tracking-normal text-slate-500 mt-0.5",
  showText = true,
  showSubtext = true,
  href = "/",
}) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(cachedLogoUrl);

  useEffect(() => {
    let isMounted = true;
    if (cachedLogoUrl === null) {
      fetch("/api/public/settings")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isMounted) {
            const url = data?.site_logo_url || data?.data?.site_logo_url || "";
            cachedLogoUrl = url;
            setLogoUrl(url);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const content = (
    <>
      {logoUrl ? (
        <img src={logoUrl} alt="Invity Logo" className={imgClassName} />
      ) : (
        <>
          <div className={iconBoxClassName}>
            <Heart className={heartIconClassName} />
          </div>
          {showText && (
            <div className="flex flex-col justify-center leading-none select-none">
              <span className={textClassName}>
                Invity<span className="text-[#F97316]">.</span>
              </span>
              {showSubtext && (
                <span className={subtextClassName}>
                  by Fasaro
                </span>
              )}
            </div>
          )}
        </>
      )}
    </>
  );

  if (!href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
};

export default BrandLogo;

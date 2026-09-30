"use client";

import React, { useEffect, useState } from "react";
import { Languages } from "lucide-react";

interface GoogleTranslateElementConstructor {
  new (
    options: {
      pageLanguage: string;
      includedLanguages?: string;
      layout?: number;
      autoDisplay?: boolean;
    },
    elementId: string
  ): unknown;
  InlineLayout?: {
    SIMPLE: number;
    HORIZONTAL: number;
  };
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: GoogleTranslateElementConstructor;
      };
    };
  }
}

interface GoogleTranslateWidgetProps {
  className?: string;
  showIcon?: boolean;
}

export const GoogleTranslateWidget: React.FC<GoogleTranslateWidgetProps> = ({
  className = "",
  showIcon = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Guard against Google Translate pushing body down & clean "Diberdayakan oleh" text
    const cleanDiberdayakanText = () => {
      const el = document.getElementById("google_translate_element");
      if (el) {
        const gadgets = el.querySelectorAll(".goog-te-gadget, .goog-te-gadget-simple");
        gadgets.forEach((gadget) => {
          gadget.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent) {
              node.textContent = "";
            }
          });
        });
      }
    };

    const resetBodyTopAndText = () => {
      if (document.body.style.top && document.body.style.top !== "0px") {
        document.body.style.top = "0px";
      }
      cleanDiberdayakanText();
    };

    const intervalId = setInterval(resetBodyTopAndText, 300);

    // 2. Define global callback
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "id",
            includedLanguages: "id,en,ar,zh-CN,ja,ko,ms,fr,de,es,nl,ru",
            autoDisplay: false,
          },
          "google_translate_element"
        );
        setIsLoaded(true);
        setTimeout(cleanDiberdayakanText, 100);
      }
    };

    // 3. Inject Google Translate script if not already present
    let timer: NodeJS.Timeout | null = null;
    const existingScript = document.getElementById("google-translate-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate) {
      window.googleTranslateElementInit?.();
      timer = setTimeout(() => {
        setIsLoaded(true);
      }, 0);
    }

    return () => {
      clearInterval(intervalId);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={`google-translate-wrapper inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 bg-white/80 hover:bg-white text-slate-700 transition-colors shadow-2xs ${className}`}
      title="Pilih Bahasa / Translate"
    >
      {showIcon && (
        <Languages className="w-3.5 h-3.5 text-[#F97316] shrink-0" aria-hidden="true" />
      )}
      <div id="google_translate_element" className="min-h-[26px] flex items-center">
        {!isLoaded && (
          <span className="text-xs text-slate-400 font-medium px-1">Translate</span>
        )}
      </div>
    </div>
  );
};

export default GoogleTranslateWidget;

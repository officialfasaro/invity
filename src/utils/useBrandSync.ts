import { useEffect } from "react";

export function useBrandSync(): void {
  useEffect(() => {
    let isMounted = true;

    fetch("/api/public/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;

        const faviconUrl = data.site_favicon_url || data.data?.site_favicon_url;
        const appIconUrl = data.site_app_icon_url || data.data?.site_app_icon_url;

        // 1. Sinkronisasi Favicon Tab Browser
        if (faviconUrl) {
          let faviconLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
          if (!faviconLink) {
            faviconLink = document.createElement("link");
            faviconLink.rel = "icon";
            document.head.appendChild(faviconLink);
          }
          faviconLink.href = faviconUrl;
        }

        // 2. Sinkronisasi Apple Touch Icon / Shortcut PWA
        if (appIconUrl) {
          let appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
          if (!appleLink) {
            appleLink = document.createElement("link");
            appleLink.rel = "apple-touch-icon";
            document.head.appendChild(appleLink);
          }
          appleLink.href = appIconUrl;
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);
}

export default useBrandSync;

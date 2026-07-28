import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    dataLayer?: IArguments[];
    gtag?: (...args: unknown[]) => void;
  }
}

const TAG_ID =
  (import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined)?.trim() || "G-BTVFPF62HC";

/** Only real public marketing routes — ignores admin + bot spam paths. */
const TRACKED_PATHS = new Set(["/", "/portfolio", "/about", "/services"]);

/**
 * SPA page views for GA4. The base gtag snippet lives in index.html;
 * this only sends page_view on client-side route changes.
 */
export default function GoogleTagPageViews() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    if (!TRACKED_PATHS.has(pathname)) return;

    const page_path = `${pathname}${search}`;
    window.gtag("event", "page_view", {
      page_path,
      page_location: window.location.href,
      page_title: document.title,
      send_to: TAG_ID,
    });
  }, [pathname, search]);

  return null;
}

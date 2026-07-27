import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** IWS-only Google tag — set in .env / Netlify as VITE_GOOGLE_ADS_ID (G-… or AW-…) */
const TAG_ID = (import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined)?.trim();

/** Only real public marketing routes — ignores admin + bot spam paths. */
const TRACKED_PATHS = new Set(["/", "/portfolio", "/about", "/services"]);

function isValidTagId(id: string) {
  return id.startsWith("G-") || id.startsWith("AW-");
}

function ensureGtag(id: string) {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }

  const src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  if (!document.querySelector(`script[src="${src}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
    window.gtag("js", new Date());
    window.gtag("config", id, { send_page_view: false });
  }
}

/**
 * Loads the IWS-only Google tag (from env) and fires page views on
 * known marketing routes. Does nothing until VITE_GOOGLE_ADS_ID is set.
 */
export default function GoogleTagPageViews() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!TAG_ID || !isValidTagId(TAG_ID)) return;
    if (!TRACKED_PATHS.has(pathname)) return;

    ensureGtag(TAG_ID);
    window.gtag?.("config", TAG_ID, {
      page_path: `${pathname}${search}`,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, search]);

  return null;
}

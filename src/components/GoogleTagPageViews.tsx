import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const ADS_ID = "AW-949737852";

/** Fires a Google Ads / gtag page view on every React Router navigation. */
export default function GoogleTagPageViews() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;

    const page_path = `${pathname}${search}`;
    window.gtag("config", ADS_ID, {
      page_path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, search]);

  return null;
}

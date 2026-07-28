import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackScrollDepth } from "../lib/analytics";

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
const SCROLL_MARKS = [25, 50, 75, 90] as const;

/**
 * SPA page views + scroll depth for GA4.
 * Base gtag snippet lives in index.html.
 */
export default function GoogleTagPageViews() {
  const { pathname, search } = useLocation();
  const seenScroll = useRef<Set<number>>(new Set());

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

  useEffect(() => {
    seenScroll.current = new Set();
    if (!TRACKED_PATHS.has(pathname)) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = Math.round((window.scrollY / scrollable) * 100);

      for (const mark of SCROLL_MARKS) {
        if (percent >= mark && !seenScroll.current.has(mark)) {
          seenScroll.current.add(mark);
          trackScrollDepth(mark, pathname);
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}

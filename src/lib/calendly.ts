import { CONTACT } from "../data/contact";
import { trackBookCall } from "./analytics";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string }) => void;
      initInlineWidgets?: () => void;
    };
  }
}

const SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
const CSS_HREF = "https://assets.calendly.com/assets/external/widget.css";

let loadPromise: Promise<void> | null = null;

/** Load Calendly's widget JS/CSS once. */
export function loadCalendly(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Calendly) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${CSS_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_HREF;
      document.head.appendChild(link);
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      if (window.Calendly) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Calendly"));
    document.body.appendChild(script);
  });

  return loadPromise;
}

/** Open the Calendly booking popup (falls back to a new tab). */
export async function openCalendlyPopup(location = "unknown") {
  trackBookCall(location);
  try {
    await loadCalendly();
    if (window.Calendly?.initPopupWidget) {
      window.Calendly.initPopupWidget({ url: CONTACT.calendlyUrl });
      return;
    }
  } catch {
    /* fall through */
  }
  window.open(CONTACT.calendlyUrl, "_blank", "noopener,noreferrer");
}

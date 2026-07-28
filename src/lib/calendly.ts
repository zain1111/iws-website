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

/** Phone / touch: Calendly's popup has a tiny close hit-area and can leave the page zoomed. */
function shouldOpenInNewTab() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(max-width: 768px)").matches ||
    window.matchMedia("(hover: none) and (pointer: coarse)").matches
  );
}

function openCalendlyTab() {
  window.open(CONTACT.calendlyUrl, "_blank", "noopener,noreferrer");
}

function waitForCalendly(timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Calendly?.initPopupWidget) {
      resolve(true);
      return;
    }
    const started = Date.now();
    const id = window.setInterval(() => {
      if (window.Calendly?.initPopupWidget) {
        window.clearInterval(id);
        resolve(true);
      } else if (Date.now() - started > timeoutMs) {
        window.clearInterval(id);
        resolve(false);
      }
    }, 50);
  });
}

/** Load Calendly's widget JS/CSS once (desktop popup only). */
export function loadCalendly(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Calendly?.initPopupWidget) return Promise.resolve();
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
      void waitForCalendly().then((ok) => (ok ? resolve() : reject(new Error("Calendly timeout"))));
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      void waitForCalendly().then((ok) => (ok ? resolve() : reject(new Error("Calendly timeout"))));
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Calendly"));
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}

/**
 * Book CTA: popup on desktop; new browser tab on mobile/touch
 * (clear close/back, no stuck zoom).
 */
export async function openCalendlyPopup(location = "unknown") {
  trackBookCall(location);

  if (shouldOpenInNewTab()) {
    openCalendlyTab();
    return;
  }

  try {
    await loadCalendly();
    if (window.Calendly?.initPopupWidget) {
      window.Calendly.initPopupWidget({ url: CONTACT.calendlyUrl });
      return;
    }
  } catch {
    /* fall through */
  }

  openCalendlyTab();
}

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { registerCalendlyModal } from "../lib/calendly";

const EMBED_URL =
  "https://calendly.com/zain-theiwsolutions/30min?hide_gdpr_banner=1&primary_color=ff5a45";

const VIEWPORT_DEFAULT = "width=device-width, initial-scale=1.0";

function resetViewportZoom() {
  const meta = document.querySelector('meta[name="viewport"]');
  if (!meta) return;
  // Briefly lock scale so iOS drops any accidental zoom from the iframe.
  meta.setAttribute("content", `${VIEWPORT_DEFAULT}, maximum-scale=1`);
  window.setTimeout(() => {
    meta.setAttribute("content", VIEWPORT_DEFAULT);
  }, 300);
}

/** Full-screen on-site Calendly booking sheet with an obvious close control. */
export default function CalendlyBookingModal() {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    registerCalendlyModal(() => setOpen(true));
    return () => registerCalendlyModal(null);
  }, []);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
    resetViewportZoom();
  }

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-navy-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="mt-auto sm:mt-0 sm:m-auto flex h-[min(100dvh,100%)] w-full sm:h-[min(90dvh,820px)] sm:w-[min(920px,94vw)] flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-navy-900/10 bg-paper px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p id={titleId} className="font-display text-base sm:text-lg text-navy-900 truncate">
              Book a free strategy call
            </p>
            <p className="font-mono text-[10px] sm:text-xs text-slate-400 truncate">
              30 minutes · stays on this site
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close booking"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white hover:bg-coral-500 transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="min-h-0 flex-1 bg-white">
          <iframe
            title="Book a free strategy call on Calendly"
            src={EMBED_URL}
            className="h-full w-full border-0"
            loading="eager"
          />
        </div>

        <div className="flex shrink-0 justify-end border-t border-navy-900/10 bg-paper px-4 py-3 sm:hidden">
          <button
            type="button"
            onClick={close}
            className="rounded-full bg-navy-900 px-5 py-2.5 font-display text-sm text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

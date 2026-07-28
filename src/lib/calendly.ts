import { CONTACT } from "../data/contact";
import { trackBookCall } from "./analytics";

type OpenHandler = () => void;

let openHandler: OpenHandler | null = null;

/** Used by CalendlyBookingModal to receive open requests from CTAs. */
export function registerCalendlyModal(handler: OpenHandler | null) {
  openHandler = handler;
}

/**
 * Opens the on-site Calendly booking modal (keeps the user on theiwsolutions.com).
 */
export function openCalendlyPopup(location = "unknown") {
  trackBookCall(location);
  if (openHandler) {
    openHandler();
    return;
  }
  // Fallback if modal isn't mounted (e.g. rare race on first paint)
  window.open(CONTACT.calendlyUrl, "_blank", "noopener,noreferrer");
}

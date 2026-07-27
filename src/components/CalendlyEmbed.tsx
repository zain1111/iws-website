import { CONTACT } from "../data/contact";

interface CalendlyEmbedProps {
  className?: string;
  /** Widget height in px. */
  height?: number;
}

/** Inline Calendly booking widget for the contact / CTA section. */
export default function CalendlyEmbed({ className = "", height = 700 }: CalendlyEmbedProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white ${className}`}
      style={{ minHeight: height }}
    >
      <iframe
        title="Book a free strategy call on Calendly"
        src={CONTACT.calendlyEmbedUrl}
        className="w-full border-0"
        style={{ height, minWidth: 320 }}
        loading="lazy"
      />
    </div>
  );
}

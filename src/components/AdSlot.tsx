import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  /** Full AdSense unit HTML from admin (script + ins), or empty. */
  code: string;
  className?: string;
  label?: string;
}

/**
 * Renders an admin-configured AdSense unit.
 * Renders nothing when empty — no dashed placeholders (better for AdSense review).
 */
export default function AdSlot({ code, className = "", label: _label = "Advertisement" }: AdSlotProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const html = code.trim();

  useEffect(() => {
    if (!html || !hostRef.current) return;
    hostRef.current.innerHTML = html;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* AdSense may throw if blocked / not ready */
    }
  }, [html]);

  if (!html) return null;

  return <div ref={hostRef} className={`ad-slot overflow-hidden ${className}`} />;
}

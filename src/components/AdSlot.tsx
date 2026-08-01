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
 * Renders an admin-configured AdSense unit. Falls back to a subtle placeholder
 * when no code is set (keeps layout stable in design/preview).
 */
export default function AdSlot({ code, className = "", label = "Advertisement" }: AdSlotProps) {
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

  if (!html) {
    return (
      <div
        className={`flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-navy-900/15 bg-navy-900/[0.03] ${className}`}
        aria-hidden
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{label}</span>
      </div>
    );
  }

  return <div ref={hostRef} className={`ad-slot overflow-hidden ${className}`} />;
}

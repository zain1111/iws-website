import { motion, useMotionTemplate, useReducedMotion, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useSmoothScroll } from "../lib/motion";

interface RevealProps {
  children: ReactNode;
  /** Kept for API compatibility: now maps to a scroll-window offset so
   * grouped items resolve in sequence as the group scrubs through. */
  delay?: number;
  y?: number;
  className?: string;
  variant?: "up" | "scale" | "blur";
}

const DISTANCE = { up: 48, scale: 30, blur: 22 } as const;

/**
 * Scroll-*linked* section reveal (rebuilt from the old one-shot fade).
 * Opacity / translate / scale / blur are all driven continuously by the
 * element's position in the viewport, so content resolves as you scroll in
 * and gracefully un-resolves if you scroll back — the "flow on scroll"
 * feel. Every section shares this so the language stays cohesive.
 */
export default function Reveal({ children, delay = 0, y, className, variant = "up" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const progress = useSmoothScroll(ref, ["start 0.95", "start 0.45"]);

  // A `delay` (previously seconds) becomes a head-start inside the scroll
  // window, giving siblings a staggered, scrubbed cascade.
  const s = Math.min(delay * 1.4, 0.4);
  const dist = y ?? DISTANCE[variant];

  const opacity = useTransform(progress, [s, s + 0.45], [0, 1]);
  const ty = useTransform(progress, [s, s + 0.6], [dist, 0]);
  const scale = useTransform(progress, [s, s + 0.6], [variant === "scale" ? 0.9 : 1, 1]);
  const blurPx = useTransform(progress, [s, s + 0.45], [10, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const style =
    variant === "blur"
      ? { opacity, y: ty, filter }
      : { opacity, y: ty, scale };

  return (
    <motion.div ref={ref} style={style} className={className}>
      {children}
    </motion.div>
  );
}

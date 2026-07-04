import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

/**
 * Animates a numeric value counting up from 0 once the bound element
 * scrolls into view. Returns a ref to attach and the live motion value's
 * DOM node is updated directly (avoids re-render-per-frame cost).
 */
export function useCountUp(target: number, opts?: { duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    duration: (opts?.duration ?? 1.4) * 1000,
    bounce: 0,
  });

  useEffect(() => {
    if (isInView) motionValue.set(target);
  }, [isInView, target, motionValue]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v).toString();
    });
    return unsub;
  }, [spring]);

  return ref;
}

import { useScroll, useSpring, type MotionValue } from "framer-motion";
import { useMemo, type RefObject } from "react";

/** Signature easing used for any non-scroll (load) transitions so the whole
 * site shares one motion "accent". */
export const EASE = [0.16, 1, 0.3, 1] as const;

/** Spring config that turns raw, jumpy scroll progress into the buttery,
 * slightly-trailing motion that reads as "scroll-linked" rather than
 * "scroll-triggered". Tuned once here so every element decelerates alike. */
export const SCROLL_SPRING = {
  stiffness: 90,
  damping: 26,
  mass: 0.45,
  restDelta: 0.0005,
} as const;

type Offset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

/**
 * Tracks an element's progress through the viewport and returns a
 * spring-smoothed 0→1 MotionValue. This is the backbone of the motion
 * system: every reveal, parallax layer, and timeline reads from one of
 * these so motion is *continuously* bound to scroll position instead of
 * firing once on entry.
 */
export function useSmoothScroll(
  ref: RefObject<HTMLElement | null>,
  offset: Offset = ["start end", "end start"],
): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return useSpring(scrollYProgress, SCROLL_SPRING);
}

/** Wraps a number into the [min, max) range — used to loop a marquee's
 * translateX seamlessly regardless of how far scroll velocity pushes it. */
export function wrap(min: number, max: number, v: number): number {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

/** Clamp helper for building staggered scroll windows without overflowing 1. */
export function useStaggerWindow(index: number, step = 0.06, span = 0.5, max = 0.45) {
  return useMemo(() => {
    const start = Math.min(index * step, max);
    return [start, start + span] as const;
  }, [index, step, span, max]);
}

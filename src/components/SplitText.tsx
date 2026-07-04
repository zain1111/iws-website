import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { useSmoothScroll } from "../lib/motion";

interface SplitTextProps {
  children: string;
  className?: string;
  /** Extra head-start (0–1 of the scroll window) before the first word. */
  delay?: number;
}

function Word({ word, progress, start }: { word: string; progress: MotionValue<number>; start: number }) {
  const y = useTransform(progress, [start, start + 0.4], ["115%", "0%"]);
  const opacity = useTransform(progress, [start, start + 0.4], [0, 1]);
  return (
    <span className="inline-block overflow-hidden pb-[0.15em] -mb-[0.15em] mr-[0.28em]">
      <motion.span style={{ y, opacity }} className="inline-block">
        {word}
      </motion.span>
    </span>
  );
}

/**
 * Heading whose words rise into place *as a function of scroll position*.
 * The reveal window is spread across the words so the line "types" itself
 * open while you scroll, then reverses if you scroll back up — a
 * progress-driven timeline rather than a one-time stagger.
 */
export default function SplitText({ children, className, delay = 0 }: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const words = children.split(" ");
  const progress = useSmoothScroll(ref, ["start 0.9", "start 0.4"]);

  if (reduced) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => {
        const start = Math.min(delay + (i / words.length) * 0.55, 0.6);
        return <Word key={i} word={word} progress={progress} start={start} />;
      })}
    </span>
  );
}

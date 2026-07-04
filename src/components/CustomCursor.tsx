import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const DOT = { damping: 30, stiffness: 420, mass: 0.35 };
const RING = { damping: 22, stiffness: 160, mass: 0.55 };

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary';

export default function CustomCursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const dotX = useSpring(rawX, DOT);
  const dotY = useSpring(rawY, DOT);
  const ringX = useSpring(rawX, RING);
  const ringY = useSpring(rawY, RING);

  useEffect(() => {
    if (reduced) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    setEnabled(true);
    document.body.classList.add("custom-cursor-active");

    const move = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      setVisible(true);

      const el = e.target as HTMLElement | null;
      setHovering(!!el?.closest(INTERACTIVE));
    };

    const leave = () => setVisible(false);
    const enter = () => setVisible(true);
    const down = () => setClicking(true);
    const up = () => setClicking(false);

    window.addEventListener("mousemove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    document.documentElement.addEventListener("mouseenter", enter);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.removeEventListener("mouseenter", enter);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, [reduced, rawX, rawY]);

  if (reduced || !enabled) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[100]"
      aria-hidden
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Trailing ring — lags behind for depth */}
      <motion.div
        style={{ x: ringX, y: ringY }}
        animate={{
          width: hovering ? 52 : clicking ? 28 : 36,
          height: hovering ? 52 : clicking ? 28 : 36,
          opacity: hovering ? 0.85 : 0.45,
        }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 mix-blend-difference"
      />

      {/* Core dot */}
      <motion.div
        style={{ x: dotX, y: dotY }}
        animate={{
          scale: clicking ? 0.75 : hovering ? 1.35 : 1,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 400 }}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 h-[7px] w-[7px] rounded-full bg-coral-500 shadow-[0_0_12px_rgba(255,90,69,0.45)]"
      />

      {/* Hover accent ring */}
      <motion.div
        style={{ x: dotX, y: dotY }}
        animate={{
          scale: hovering ? 1 : 0,
          opacity: hovering ? 1 : 0,
        }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 h-[52px] w-[52px] rounded-full border border-coral-500/40"
      />
    </div>
  );
}

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";
import { wrap } from "../lib/motion";
import Reveal from "./Reveal";
import Parallax from "./Parallax";

const STATS = [
  { value: 100, suffix: "%", label: "Client job-success score" },
  { value: 40, suffix: "+", label: "Products shipped to production" },
  { value: 2, prefix: "< ", suffix: "s", label: "Median page load, every build" },
];

const STACK = [
  "React", "TypeScript", "Node.js", "WordPress", "PHP", "MongoDB", "Next.js",
  "Tailwind", "Firebase", "Shopify", "REST APIs", "MERN",
];

function Stat({ value, prefix, suffix, label, delay }: { value: number; prefix?: string; suffix?: string; label: string; delay: number }) {
  const ref = useCountUp(value);
  return (
    <Reveal delay={delay} variant="scale">
      <p className="font-display text-3xl lg:text-4xl text-white">
        {prefix}
        <span ref={ref}>0</span>
        {suffix}
      </p>
      <p className="font-mono text-xs text-slate-300 mt-2 uppercase tracking-wide">{label}</p>
    </Reveal>
  );
}

/**
 * Marquee whose speed and direction are driven by scroll velocity: it idles
 * at a slow base drift, accelerates and can even reverse as you scrub the
 * page. This ties an always-on element directly to scroll input.
 */
function VelocityMarquee() {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    let moveBy = direction.current * -2 * (delta / 1000);
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;
    moveBy += direction.current * moveBy * factor;
    baseX.set(baseX.get() + moveBy);
  });

  const items = [...STACK, ...STACK, ...STACK, ...STACK];

  return (
    <div className="border-t border-white/10 py-5 overflow-hidden">
      <motion.div style={{ x }} className="flex w-max">
        {items.map((tech, i) => (
          <span
            key={i}
            className="font-mono text-sm text-slate-400 px-6 whitespace-nowrap flex items-center gap-6"
          >
            {tech}
            <span className="text-coral-500">/</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function TrustStrip() {
  return (
    <section className="bg-navy-900 border-t border-white/10 relative overflow-hidden">
      {/* Receding parallax shard adds depth behind the numbers */}
      <Parallax
        y={70}
        className="absolute -right-24 top-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/10 pointer-events-none"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
      >
        <span />
      </Parallax>

      <Parallax y={26} className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {STATS.map((s, i) => (
          <Stat key={s.label} {...s} delay={i * 0.1} />
        ))}
        <Reveal delay={0.3} variant="scale">
          <p className="font-display text-3xl lg:text-4xl text-white">Top Rated</p>
          <p className="font-mono text-xs text-slate-300 mt-2 uppercase tracking-wide">Freelance platform status</p>
        </Reveal>
      </Parallax>

      <VelocityMarquee />
    </section>
  );
}

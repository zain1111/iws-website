import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { useSmoothScroll } from "../lib/motion";
import Reveal from "./Reveal";
import SplitText from "./SplitText";

const STEPS = [
  { n: "01", title: "Discover", desc: "A real conversation about the business problem, not a template questionnaire." },
  { n: "02", title: "Design", desc: "Wireframes, then a full visual system — you approve direction before a line of code exists." },
  { n: "03", title: "Build", desc: "Custom development in the open. You get a staging link, not radio silence." },
  { n: "04", title: "Launch & Grow", desc: "We ship, monitor, and keep improving based on what real users actually do." },
];

const DIM = "rgba(255,255,255,0.35)";
const CORAL = "rgba(255,90,69,1)";

function Step({
  step,
  index,
  count,
  progress,
}: {
  step: (typeof STEPS)[number];
  index: number;
  count: number;
  progress: MotionValue<number>;
  }) {
  // Each node lights the moment the coral connector line reaches its
  // position along the track (nodes sit at the left edge of each column).
  const mark = index / count;
  const active = useTransform(progress, [mark - 0.1, mark + 0.06], [0, 1], { clamp: true });

  const dotScale = useTransform(active, [0, 1], [0.5, 1]);
  const dotBg = useTransform(active, [0, 1], ["rgba(16,38,59,1)", CORAL]);
  const dotBorder = useTransform(active, [0, 1], ["rgba(255,255,255,0.25)", CORAL]);
  const glow = useTransform(active, [0, 1], [0, 0.6]);
  const glowShadow = useTransform(glow, (g) => `0 0 24px ${g * 12}px rgba(255,90,69,${g})`);
  const numColor = useTransform(active, [0, 1], [DIM, CORAL]);
  const lift = useTransform(active, [0, 1], [10, 0]);

  return (
    <div className="relative md:pt-16">
      {/* Node that sits on the timeline (desktop only) */}
      <motion.span
        style={{ scale: dotScale, backgroundColor: dotBg, borderColor: dotBorder, boxShadow: glowShadow }}
        className="hidden md:block absolute left-0 top-6 -translate-y-1/2 h-4 w-4 rounded-full border-2 z-10"
        aria-hidden
      />
      <Reveal delay={index * 0.12} variant="blur">
        <motion.span style={{ color: numColor, y: lift }} className="font-display text-lg inline-block">
          {step.n}
        </motion.span>
        <h3 className="font-display text-2xl text-white mt-4 mb-3">{step.title}</h3>
        <p className="text-slate-300 text-sm leading-relaxed">{step.desc}</p>
      </Reveal>
    </div>
  );
}

export default function Process() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  // Drives both the filling connector line and every node's light-up state so
  // the whole timeline advances in lock-step with scroll position.
  const progress = useSmoothScroll(trackRef, ["start 0.7", "end 0.45"]);
  const lineScale = useTransform(progress, [0, 1], [0, 1]);

  return (
    <section id="process" className="bg-navy-900 py-28 lg:py-36 relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-[520px] h-[520px] bg-gradient-to-b from-blue-500/20 to-transparent"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        aria-hidden
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
        <Reveal>
          <p className="font-mono text-sm text-coral-500 mb-4">// 03 — how it works</p>
          <h2 className="font-display font-semibold text-4xl lg:text-6xl text-white max-w-2xl leading-[1.05]">
            <SplitText>Four stages. Zero mystery.</SplitText>
          </h2>
        </Reveal>

        <div ref={trackRef} className="mt-20 grid md:grid-cols-4 gap-10 md:gap-6 relative">
          <div className="hidden md:block absolute top-6 left-0 right-0 h-px bg-white/15" aria-hidden />
          <motion.div
            style={{ scaleX: reduced ? 1 : lineScale }}
            className="hidden md:block absolute top-6 left-0 right-0 h-px bg-coral-500 origin-left"
            aria-hidden
          />
          {STEPS.map((s, i) => (
            <Step key={s.n} step={s} index={i} count={STEPS.length} progress={progress} />
          ))}
        </div>
      </div>
    </section>
  );
}

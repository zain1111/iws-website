import { Link } from "react-router-dom";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { EASE, SCROLL_SPRING } from "../lib/motion";
import { CONTACT } from "../data/contact";

const word1 = "Websites".split("");
const word2 = "that ship.".split("");

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const p = useSpring(scrollYProgress, SCROLL_SPRING);

  // Layered, spring-smoothed parallax: each plane travels at its own speed so
  // the hero pulls apart with depth as it leaves — continuous scroll-linked
  // motion, not a one-off entrance.
  const shardLeftY = useTransform(p, [0, 1], [0, 220]);
  const shardLeftRot = useTransform(p, [0, 1], [-3, -9]);
  const shardRightY = useTransform(p, [0, 1], [0, -160]);
  const shardRightRot = useTransform(p, [0, 1], [3, 9]);
  const glowY = useTransform(p, [0, 1], [0, 120]);
  const glowScale = useTransform(p, [0, 1], [1, 1.4]);
  const gridY = useTransform(p, [0, 1], [0, 60]);
  const contentY = useTransform(p, [0, 1], [0, 140]);
  const contentOpacity = useTransform(p, [0, 0.75], [1, 0]);
  const contentFilter = useTransform(p, [0, 0.8], [0, 6], { clamp: true });
  const contentBlur = useTransform(contentFilter, (b) => `blur(${b}px)`);
  const cueOpacity = useTransform(p, [0, 0.12], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative overflow-hidden bg-navy-900 pt-40 pb-28 lg:pt-48 lg:pb-36"
    >
      {/* Faceted background shards — directly derived from the logo's folded planes */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          style={{ y: gridY }}
          className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,rgba(92,176,229,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(92,176,229,0.5)_1px,transparent_1px)] bg-[size:64px_64px]"
        />
        <motion.div
          style={{ y: glowY, scale: glowScale }}
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-blue-500/25 blur-[120px]"
        />
        <motion.div
          initial={{ opacity: 0, x: -60, rotate: -6 }}
          animate={{ opacity: 0.9, x: 0, rotate: -3 }}
          transition={{ duration: 1.1, ease: EASE }}
          style={{ y: shardLeftY, rotate: shardLeftRot }}
          className="absolute -top-20 -left-24 w-[420px] h-[560px] bg-gradient-to-br from-blue-500 to-navy-700 facet-cut"
        />
        <motion.div
          initial={{ opacity: 0, x: 60, rotate: 6 }}
          animate={{ opacity: 0.55, x: 0, rotate: 3 }}
          transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
          style={{ y: shardRightY, rotate: shardRightRot }}
          className="absolute -bottom-24 -right-16 w-[380px] h-[480px] bg-gradient-to-tl from-sky-400 to-blue-600 facet-cut-rev"
        />
        <div className="absolute inset-0 bg-navy-900/40" />
      </div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity, filter: contentBlur }}
        className="relative max-w-7xl mx-auto px-6 lg:px-10"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-mono text-sm text-sky-400 mb-6 flex items-center gap-2"
        >
          <span className="text-coral-500">//</span> integrated-web-solutions
          <span className="inline-block w-2 h-4 bg-sky-400 animate-blink" aria-hidden />
        </motion.p>

        <h1 className="font-display font-semibold text-white text-[13vw] leading-[0.95] sm:text-7xl lg:text-8xl tracking-tight max-w-4xl">
          <span className="block overflow-hidden">
            <span className="flex flex-wrap">
              {word1.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%", rotate: 4 }}
                  animate={{ y: "0%", rotate: 0 }}
                  transition={{ duration: 0.7, delay: 0.05 * i, ease: EASE }}
                  className="inline-block"
                >
                  {ch === " " ? "\u00A0" : ch}
                </motion.span>
              ))}
            </span>
          </span>
          <span className="block overflow-hidden text-sky-400">
            <span className="flex flex-wrap">
              {word2.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%", rotate: -4 }}
                  animate={{ y: "0%", rotate: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 + 0.04 * i, ease: EASE }}
                  className="inline-block"
                >
                  {ch === " " ? "\u00A0" : ch}
                </motion.span>
              ))}
            </span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.6 }}
          className="mt-8 max-w-xl text-slate-300 text-lg leading-relaxed"
        >
          No templates, no filler pages, no "we'll circle back." IWS designs and
          engineers custom websites for brands who'd rather launch something
          real than wait for perfect.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href={CONTACT.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 bg-coral-500 text-white font-display font-medium px-7 py-3.5 rounded-full hover:bg-coral-400 transition-colors"
          >
            Book a free strategy call
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-white font-display px-7 py-3.5 rounded-full border border-white/25 hover:border-white/60 transition-colors"
          >
            See the work
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll cue that fades the instant you start scrolling */}
      <motion.div
        style={{ opacity: cueOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Scroll</span>
        <span className="relative h-9 w-px bg-white/20 overflow-hidden">
          <motion.span
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
            className="absolute inset-x-0 top-0 h-1/2 bg-coral-500"
          />
        </span>
      </motion.div>
    </section>
  );
}

import { motion, useReducedMotion, useTransform } from "framer-motion";
import { useRef } from "react";
import { CONTACT } from "../data/contact";
import { openCalendlyPopup } from "../lib/calendly";
import { useSmoothScroll } from "../lib/motion";
import CalendlyEmbed from "./CalendlyEmbed";
import Reveal from "./Reveal";
import SplitText from "./SplitText";
import Parallax from "./Parallax";

export default function CtaBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const progress = useSmoothScroll(sectionRef, ["start end", "end start"]);
  const copyY = useTransform(progress, [0, 1], [70, -70]);

  return (
    <section id="contact" ref={sectionRef} className="relative bg-coral-500 py-24 lg:py-32 overflow-hidden">
      <Parallax
        y={80}
        rotate={-8}
        className="absolute -left-10 -bottom-16 w-72 h-72 bg-white/10"
        style={{ clipPath: "polygon(0 100%, 100% 100%, 0 0)" }}
      >
        <span />
      </Parallax>
      <Parallax
        y={-60}
        className="absolute -right-16 -top-10 w-64 h-64 bg-navy-900/10"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
      >
        <span />
      </Parallax>

      <motion.div
        style={{ y: reduced ? 0 : copyY }}
        className="max-w-5xl mx-auto px-6 lg:px-10 relative"
      >
        <Reveal className="text-center">
          <p className="font-mono text-sm text-navy-900/70 mb-4">// got an idea?</p>
          <h2 className="font-display font-semibold text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.05]">
            <SplitText>Let's build the thing you've been putting off.</SplitText>
          </h2>
          <p className="text-white/90 mt-6 max-w-lg mx-auto">
            Free 30-minute strategy call. Pick a time below — no deck, no pressure,
            just a straight answer on scope, timeline, and cost.
          </p>
          <button
            type="button"
            onClick={() => void openCalendlyPopup()}
            className="mt-8 inline-flex items-center gap-2 bg-navy-900 text-white font-display font-medium px-8 py-4 rounded-full hover:bg-white hover:text-navy-900 transition-colors duration-300 lg:hidden"
          >
            Book your free call
            <span aria-hidden>→</span>
          </button>
        </Reveal>

        <Reveal delay={0.12} className="mt-10">
          <CalendlyEmbed className="shadow-xl border border-navy-900/10" height={700} />
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-sm text-navy-900/80">
            <a href={CONTACT.mailtoHref} className="hover:text-white transition-colors">
              {CONTACT.email}
            </a>
            <span className="hidden sm:inline text-white/40">·</span>
            <a
              href={CONTACT.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              {CONTACT.phoneDisplay}
            </a>
            <span className="hidden sm:inline text-white/40">·</span>
            <a
              href={CONTACT.upwork}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Upwork
            </a>
            <span className="hidden sm:inline text-white/40">·</span>
            <a
              href={CONTACT.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </Reveal>
      </motion.div>
    </section>
  );
}

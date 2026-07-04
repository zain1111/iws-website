import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SERVICES, type Service } from "../data/services";
import { EASE, SCROLL_SPRING, useSmoothScroll } from "../lib/motion";
import CtaBand from "../components/CtaBand";
import Reveal from "../components/Reveal";

function ServiceBlock({ service, index }: { service: Service; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const progress = useSmoothScroll(ref, ["start 0.9", "start 0.25"]);
  const visualY = useTransform(progress, [0, 1], [60, -20]);
  const numOpacity = useTransform(progress, [0, 0.5], [0.15, 0.45]);
  const flip = index % 2 === 1;
  const num = String(index + 1).padStart(2, "0");

  const content = (
    <Reveal delay={0.05} variant="blur">
      <p className="font-mono text-xs text-coral-500 uppercase tracking-wide mb-3">{service.tag}</p>
      <h2 className="font-display text-3xl lg:text-5xl text-navy-900 leading-[1.05] mb-5">{service.title}</h2>
      <p className="text-slate-600 leading-relaxed mb-8 max-w-lg">{service.detail}</p>
      <ul className="space-y-3 mb-8">
        {service.bullets.map((b, i) => (
          <Reveal key={b} delay={0.08 + i * 0.06} variant="up">
            <li className="flex items-start gap-3 text-sm text-slate-600">
              <span className="text-coral-500 font-mono mt-0.5 shrink-0">→</span>
              {b}
            </li>
          </Reveal>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        {service.stack.map((t) => (
          <span
            key={t}
            className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-navy-900/5 text-slate-500"
          >
            {t}
          </span>
        ))}
      </div>
    </Reveal>
  );

  const visual = (
    <motion.div style={{ y: visualY }} className="relative aspect-[4/3] lg:aspect-square max-w-lg mx-auto w-full">
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.gradient} opacity-90`} />
      <motion.span
        style={{ opacity: numOpacity }}
        className="absolute inset-0 flex items-center justify-center font-display text-[8rem] lg:text-[10rem] font-semibold text-white select-none pointer-events-none"
        aria-hidden
      >
        {num}
      </motion.span>
      <div
        className="absolute top-0 right-0 w-16 h-16 bg-coral-500"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        aria-hidden
      />
      <div className="absolute inset-0 flex items-end p-8">
        <p className="font-mono text-sm text-white/80 max-w-[200px]">{service.summary}</p>
      </div>
    </motion.div>
  );

  return (
    <section
      ref={ref}
      id={service.id}
      className={`py-24 lg:py-32 border-t border-navy-900/10 ${index % 2 === 0 ? "bg-paper" : "bg-white"}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className={flip ? "lg:order-2" : ""}>{content}</div>
        <div className={flip ? "lg:order-1" : ""}>{visual}</div>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  const heroRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, SCROLL_SPRING);
  const shardY = useTransform(p, [0, 1], [0, 160]);
  const headY = useTransform(p, [0, 1], [0, 80]);
  const lineScale = useSmoothScroll(listRef, ["start 0.85", "end 0.2"]);

  return (
    <>
      <section ref={heroRef} className="relative overflow-hidden bg-navy-900 pt-40 pb-24 lg:pt-48 lg:pb-28">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            style={{ y: shardY }}
            className="absolute -top-20 -right-24 w-[400px] h-[500px] bg-gradient-to-bl from-sky-400 to-blue-600 facet-cut-rev opacity-60"
          />
          <div className="absolute inset-0 bg-navy-900/40" />
        </div>

        <motion.div style={{ y: headY }} className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="font-mono text-sm text-sky-400 mb-6"
          >
            <span className="text-coral-500">//</span> what we do
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-display font-semibold text-white text-5xl sm:text-6xl lg:text-7xl tracking-tight max-w-4xl leading-[0.98]"
          >
            Six services. Zero filler.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="mt-6 max-w-2xl text-slate-300 text-lg leading-relaxed"
          >
            From first wireframe to post-launch care — every service is built to ship
            something real, not just look good in a proposal deck.
          </motion.p>
        </motion.div>
      </section>

      {/* Quick-jump index with scroll-linked progress line */}
      <section className="bg-paper border-b border-navy-900/10 sticky top-20 z-40 backdrop-blur-md bg-paper/90">
        <div ref={listRef} className="max-w-7xl mx-auto px-6 lg:px-10 py-4 relative">
          <div className="hidden md:block absolute bottom-0 left-6 right-6 lg:left-10 lg:right-10 h-px bg-navy-900/10" aria-hidden />
          <motion.div
            style={{ scaleX: lineScale }}
            className="hidden md:block absolute bottom-0 left-6 right-6 lg:left-10 lg:right-10 h-px bg-coral-500 origin-left"
            aria-hidden
          />
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SERVICES.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 font-mono text-xs px-4 py-2 rounded-full border border-navy-900/10 text-navy-900 hover:border-coral-500 hover:text-coral-500 transition-colors"
              >
                {String(i + 1).padStart(2, "0")} {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {SERVICES.map((service, i) => (
        <ServiceBlock key={service.id} service={service} index={i} />
      ))}

      <section className="bg-navy-900 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <Reveal>
            <p className="font-display text-2xl lg:text-3xl text-white max-w-md">
              Not sure which service fits? We'll tell you straight.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              to="/portfolio"
              className="group inline-flex items-center gap-2 font-display text-white border-b-2 border-coral-500 pb-1 hover:text-coral-500 transition-colors"
            >
              See our work first
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

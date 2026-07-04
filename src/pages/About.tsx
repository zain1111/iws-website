import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { CONTACT } from "../data/contact";
import { COMPANY_STATS, FOUNDER, VALUES } from "../data/team";
import { EASE, SCROLL_SPRING } from "../lib/motion";
import CtaBand from "../components/CtaBand";
import Reveal from "../components/Reveal";
import SplitText from "../components/SplitText";
import TeamMarquee from "../components/TeamMarquee";

export default function About() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, SCROLL_SPRING);
  const shardY = useTransform(p, [0, 1], [0, 180]);
  const headY = useTransform(p, [0, 1], [0, 90]);

  return (
    <>
      <section ref={heroRef} className="relative overflow-hidden bg-navy-900 pt-40 pb-24 lg:pt-48 lg:pb-28">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            style={{ y: shardY }}
            className="absolute -top-24 -left-20 w-[420px] h-[520px] bg-gradient-to-br from-blue-500 to-navy-700 facet-cut opacity-80"
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
            <span className="text-coral-500">//</span> about us
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-display font-semibold text-white text-5xl sm:text-6xl lg:text-7xl tracking-tight max-w-4xl leading-[0.98]"
          >
            We build sites that actually work.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="mt-6 max-w-2xl text-slate-300 text-lg leading-relaxed"
          >
            Integrated Web Solutions is a PSEB-certified team that designs, builds, and
            optimizes websites with clean code and zero fluff — so your business gets real
            results, not just a pretty homepage.
          </motion.p>
        </motion.div>
      </section>

      {/* Stats strip */}
      <section className="bg-navy-900 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {COMPANY_STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} variant="scale">
              <p className="font-display text-3xl lg:text-4xl text-white">{s.value}</p>
              <p className="font-mono text-xs text-slate-300 mt-2 uppercase tracking-wide">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Founder */}
      <section className="bg-paper py-28 lg:py-36">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal>
            <p className="font-mono text-sm text-coral-500 mb-4">// the founder</p>
            <h2 className="font-display font-semibold text-4xl lg:text-6xl text-navy-900 max-w-2xl leading-[1.05]">
              <SplitText>Meet the person behind IWS.</SplitText>
            </h2>
          </Reveal>

          <Reveal delay={0.12} className="mt-16">
            <div className="grid lg:grid-cols-[340px_1fr] gap-10 lg:gap-16 items-start">
              <div className="relative overflow-hidden rounded-2xl aspect-[4/5] max-w-sm mx-auto lg:mx-0 bg-navy-900/5 border border-navy-900/10">
                <img
                  src={FOUNDER.image}
                  alt={FOUNDER.name}
                  className="h-full w-full object-cover object-top"
                />
                <div
                  className="absolute top-0 left-0 w-14 h-14 bg-coral-500"
                  style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                  aria-hidden
                />
              </div>

              <div className="max-w-2xl">
                <p className="font-mono text-xs text-coral-500 uppercase tracking-wide mb-3">
                  {FOUNDER.role}
                </p>
                <h3 className="font-display text-4xl text-navy-900 mb-6">{FOUNDER.name}</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Zain founded Integrated Web Solutions after nine years in web development,
                  with a simple belief: most business websites look fine but fail at the job
                  they're hired to do — convert, load fast, and stay maintainable.
                </p>
                <p className="text-slate-600 leading-relaxed mb-6">
                  He leads every project end-to-end — from scoping and design direction through
                  engineering and launch — and still writes code alongside the team. Clients on
                  Upwork and beyond work with Zain directly, not through layers of account managers.
                </p>
                <p className="text-slate-600 leading-relaxed mb-8">
                  Under his leadership, IWS has shipped 350+ projects for 200+ clients across
                  SaaS, e-commerce, media, nonprofit, and corporate sectors.
                </p>
                <div className="flex flex-wrap gap-4">
                  {FOUNDER.linkedin && (
                    <a
                      href={FOUNDER.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-display text-sm bg-navy-900 text-white px-5 py-2.5 rounded-full hover:bg-coral-500 transition-colors"
                    >
                      Connect on LinkedIn ↗
                    </a>
                  )}
                  <a
                    href={CONTACT.upwork}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-display text-sm border border-navy-900/20 text-navy-900 px-5 py-2.5 rounded-full hover:border-[#14a800] hover:text-[#14a800] transition-colors"
                  >
                    View Upwork profile ↗
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Team slider */}
      <section className="bg-paper pb-28 lg:pb-36 border-t border-navy-900/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal>
            <p className="font-mono text-sm text-coral-500 mb-4">// the team</p>
            <h2 className="font-display font-semibold text-4xl lg:text-6xl text-navy-900 max-w-2xl leading-[1.05]">
              <SplitText>Skilled experts. One aligned crew.</SplitText>
            </h2>
            <p className="text-slate-500 text-sm mt-4 max-w-lg font-mono">
              Developers, marketers, and operators who ship together — not a revolving door of freelancers.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="mt-16">
          <TeamMarquee />
        </Reveal>
      </section>

      {/* Values */}
      <section className="bg-navy-900 py-28 lg:py-36 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[480px] h-[480px] bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
          aria-hidden
        />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          <Reveal>
            <p className="font-mono text-sm text-coral-500 mb-4">// why choose us</p>
            <h2 className="font-display font-semibold text-4xl lg:text-5xl text-white max-w-xl leading-[1.05]">
              Crafting with purpose, delivering with excellence.
            </h2>
            <p className="text-slate-300 mt-6 max-w-lg leading-relaxed">
              Some chase trends. We build what lasts — smart, scalable digital experiences
              that drive real results. No gimmicks, no shortcuts.
            </p>
          </Reveal>

          <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUES.map((v, i) => (
              <Reveal key={v} delay={i * 0.06} variant="blur">
                <li className="flex items-center gap-3 font-mono text-sm text-slate-300 border border-white/10 rounded-xl px-5 py-4">
                  <span className="text-coral-500 shrink-0">→</span>
                  {v}
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.2} className="mt-10 flex flex-wrap items-center gap-6">
            <span className="inline-flex items-center gap-2 font-mono text-xs text-sky-400 uppercase tracking-wide border border-white/15 rounded-full px-4 py-2">
              PSEB Certified Company
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-xs text-sky-400 uppercase tracking-wide border border-white/15 rounded-full px-4 py-2">
              100% Expert Team
            </span>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

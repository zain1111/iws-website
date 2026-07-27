import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import SplitText from "./SplitText";
import ProjectCard from "./ProjectCard";
import { FEATURED } from "../data/projects";
import { EASE } from "../lib/motion";

const SLIDES = FEATURED.slice(0, 5);

export default function Work() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const count = SLIDES.length;

  const goTo = useCallback(
    (next: number, dir?: number) => {
      if (count === 0) return;
      const wrapped = ((next % count) + count) % count;
      setDirection(dir ?? (wrapped > index ? 1 : -1));
      setIndex(wrapped);
    },
    [count, index],
  );

  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % count);
    }, 5500);
    return () => window.clearInterval(id);
  }, [count, index]);

  const project = SLIDES[index];

  return (
    <section id="work" className="bg-paper py-28 lg:py-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <Reveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="font-mono text-sm text-coral-500 mb-4">// 04 — selected work</p>
            <h2 className="font-display font-semibold text-4xl lg:text-6xl text-navy-900 max-w-xl leading-[1.05]">
              <SplitText>Real products. Real traffic.</SplitText>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous project"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-900/15 text-navy-900 hover:border-coral-500 hover:text-coral-500 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next project"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-900/15 text-navy-900 hover:border-coral-500 hover:text-coral-500 transition-colors"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </Reveal>

        <Reveal className="mt-14 relative" variant="scale">
          <div className="relative mx-auto max-w-3xl min-h-[28rem] sm:min-h-[30rem]">
            <AnimatePresence mode="wait" custom={direction}>
              {project && (
                <motion.div
                  key={project.slug}
                  custom={direction}
                  variants={{
                    enter: (d: number) => ({ x: d >= 0 ? 80 : -80, opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: (d: number) => ({ x: d >= 0 ? -80 : 80, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: EASE }}
                  className="w-full"
                >
                  <ProjectCard project={project} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2" role="tablist" aria-label="Featured projects">
              {SLIDES.map((p, i) => (
                <button
                  key={p.slug}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show ${p.name}`}
                  onClick={() => goTo(i, i > index ? 1 : -1)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? "w-8 bg-coral-500" : "w-2 bg-navy-900/20 hover:bg-navy-900/40"
                  }`}
                />
              ))}
            </div>

            <p className="font-mono text-xs text-slate-400 order-first sm:order-none">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>

            <Link
              to="/portfolio"
              className="group inline-flex items-center gap-2 rounded-full bg-navy-900 text-white font-display text-sm px-6 py-3 hover:bg-coral-500 transition-colors"
            >
              View full portfolio
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

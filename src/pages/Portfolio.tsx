import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { CATEGORIES, PROJECTS, sortedProjects, type Category } from "../data/projects";
import { EASE, SCROLL_SPRING } from "../lib/motion";
import ProjectCard from "../components/ProjectCard";
import CtaBand from "../components/CtaBand";

type Filter = "All" | Category;

export default function Portfolio() {
  const [filter, setFilter] = useState<Filter>("All");
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, SCROLL_SPRING);
  const shardY = useTransform(p, [0, 1], [0, 180]);
  const shardY2 = useTransform(p, [0, 1], [0, -120]);
  const headY = useTransform(p, [0, 1], [0, 90]);

  const projects = sortedProjects(
    filter === "All" ? PROJECTS : PROJECTS.filter((x) => x.category === filter),
  );

  return (
    <>
      <section ref={heroRef} className="relative overflow-hidden bg-navy-900 pt-40 pb-24 lg:pt-48 lg:pb-28">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            style={{ y: shardY }}
            className="absolute -top-24 -left-20 w-[420px] h-[520px] bg-gradient-to-br from-blue-500 to-navy-700 facet-cut opacity-80"
          />
          <motion.div
            style={{ y: shardY2 }}
            className="absolute -bottom-32 -right-16 w-[360px] h-[440px] bg-gradient-to-tl from-sky-400 to-blue-600 facet-cut-rev opacity-50"
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
            <span className="text-coral-500">//</span> selected work
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-display font-semibold text-white text-5xl sm:text-6xl lg:text-7xl tracking-tight max-w-4xl leading-[0.98]"
          >
            Products we've shipped, live in the wild.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="mt-6 max-w-xl text-slate-300 text-lg leading-relaxed"
          >
            A cross-section of real client work — AI platforms, editorial systems,
            corporate sites, and marketing builds. Cards marked “Case study” open a
            full write-up; others link to the live site.
          </motion.p>
        </motion.div>
      </section>

      <section className="bg-paper py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-12">
            {CATEGORIES.map((c) => {
              const active = filter === c;
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`font-display text-sm px-4 py-2 rounded-full border transition-colors duration-200 ${
                    active
                      ? "bg-navy-900 text-white border-navy-900"
                      : "bg-transparent text-navy-900 border-navy-900/15 hover:border-navy-900/40"
                  }`}
                >
                  {c}
                  {c !== "All" && (
                    <span className={`ml-2 font-mono text-xs ${active ? "text-sky-400" : "text-slate-500"}`}>
                      {PROJECTS.filter((x) => x.category === c).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {projects.map((project) => (
                <motion.div
                  key={project.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.94, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <ProjectCard project={project} source="portfolio_page" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import SplitText from "./SplitText";
import ProjectCard from "./ProjectCard";
import { FEATURED } from "../data/projects";
import { EASE } from "../lib/motion";

const SLIDES = FEATURED.slice(0, 5);
const GAP_PX = 16;

function useVisibleCount() {
  const [visible, setVisible] = useState(3);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setVisible(1);
      else if (w < 1024) setVisible(2);
      else setVisible(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return visible;
}

export default function Work() {
  const visible = useVisibleCount();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const count = SLIDES.length;
  const maxIndex = Math.max(0, count - visible);
  const step = cardWidth + GAP_PX;

  const goTo = useCallback(
    (next: number) => {
      setIndex(Math.min(Math.max(next, 0), maxIndex));
    },
    [maxIndex],
  );

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const measure = () => {
      setCardWidth((el.clientWidth - GAP_PX * (visible - 1)) / visible);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [visible]);

  useEffect(() => {
    if (maxIndex === 0) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 5500);
    return () => window.clearInterval(id);
  }, [maxIndex, index]);

  const pageCount = maxIndex + 1;

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
              disabled={index === 0}
              aria-label="Previous projects"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-900/15 text-navy-900 hover:border-coral-500 hover:text-coral-500 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={index >= maxIndex}
              aria-label="Next projects"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-900/15 text-navy-900 hover:border-coral-500 hover:text-coral-500 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </Reveal>

        <Reveal className="mt-12" variant="scale">
          <div ref={viewportRef} className="overflow-hidden">
            <motion.div
              className="flex"
              style={{ gap: GAP_PX }}
              animate={{ x: cardWidth ? -index * step : 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {SLIDES.map((project) => (
                <div
                  key={project.slug}
                  className="shrink-0"
                  style={cardWidth ? { width: cardWidth } : { width: `calc((100% - ${(visible - 1) * GAP_PX}px) / ${visible})` }}
                >
                  <ProjectCard project={project} compact source="home_carousel" />
                </div>
              ))}
            </motion.div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2" role="tablist" aria-label="Featured project pages">
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show page ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? "w-8 bg-coral-500" : "w-2 bg-navy-900/20 hover:bg-navy-900/40"
                  }`}
                />
              ))}
            </div>

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

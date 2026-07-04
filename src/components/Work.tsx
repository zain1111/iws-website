import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import SplitText from "./SplitText";
import ProjectCard from "./ProjectCard";
import { FEATURED } from "../data/projects";

export default function Work() {
  return (
    <section id="work" className="bg-paper py-28 lg:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <Reveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="font-mono text-sm text-coral-500 mb-4">// 04 — selected work</p>
            <h2 className="font-display font-semibold text-4xl lg:text-6xl text-navy-900 max-w-xl leading-[1.05]">
              <SplitText>Real products. Real traffic.</SplitText>
            </h2>
          </div>
          <Link
            to="/portfolio"
            className="group font-display text-navy-900 inline-flex items-center gap-2 border-b-2 border-coral-500 pb-1 hover:text-coral-500 transition-colors w-fit"
          >
            View full portfolio
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-16 grid sm:grid-cols-2 gap-6">
          {FEATURED.slice(0, 4).map((project, i) => (
            <Reveal key={project.slug} delay={(i % 2) * 0.1} variant="scale">
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "../data/services";
import Reveal from "./Reveal";
import SplitText from "./SplitText";
import Parallax from "./Parallax";

export default function Services() {
  return (
    <section className="bg-paper py-28 lg:py-36 relative overflow-hidden">
      <Parallax
        y={90}
        rotate={6}
        className="absolute -left-32 top-24 w-80 h-80 bg-blue-500/5 pointer-events-none"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      >
        <span />
      </Parallax>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
        <Reveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="font-mono text-sm text-coral-500 mb-4">// 02 — what we do</p>
            <h2 className="font-display font-semibold text-4xl lg:text-6xl text-navy-900 max-w-2xl leading-[1.05]">
              <SplitText>Six ways we make your site pull its weight.</SplitText>
            </h2>
          </div>
          <Link
            to="/services"
            className="group font-display text-navy-900 inline-flex items-center gap-2 border-b-2 border-coral-500 pb-1 hover:text-coral-500 transition-colors w-fit"
          >
            View all services
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-navy-900/10">
          {SERVICES.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 0.09 + Math.floor(i / 3) * 0.04} variant="scale" className="h-full">
              <Link
                to={`/services#${s.id}`}
                className="group bg-paper hover:bg-navy-900 transition-colors duration-400 p-8 h-full min-h-[220px] flex flex-col justify-between relative overflow-hidden block"
              >
                <div
                  className="absolute -right-6 -top-6 w-16 h-16 bg-coral-500/0 group-hover:bg-coral-500 transition-colors duration-400"
                  style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
                  aria-hidden
                />
                <span className="font-mono text-xs text-slate-500 group-hover:text-sky-400 transition-colors">
                  {s.tag}
                </span>
                <div>
                  <h3 className="font-display text-xl text-navy-900 group-hover:text-white transition-colors mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors leading-relaxed">
                    {s.summary}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

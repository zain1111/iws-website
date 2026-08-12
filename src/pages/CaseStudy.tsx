import { Link, useParams } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { getCaseStudy } from "../data/caseStudies";
import { PROJECTS } from "../data/projects";
import { openCalendlyPopup } from "../lib/calendly";
import CtaBand from "../components/CtaBand";

export default function CaseStudyPage() {
  const { slug = "" } = useParams();
  const study = getCaseStudy(slug);
  const project = PROJECTS.find((p) => p.slug === slug);

  if (!study || !project) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center bg-paper pt-32 px-6">
        <p className="font-display text-2xl text-navy-900 mb-4">Case study not found</p>
        <Link to="/portfolio" className="font-display text-coral-500 hover:underline">
          ← Back to portfolio
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="relative overflow-hidden bg-navy-900 pt-36 pb-0">
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient}`} />
          <div className="absolute inset-0 bg-navy-900/55" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pb-12 lg:pb-16">
          <Link
            to="/portfolio"
            className="font-mono text-xs text-sky-400 hover:text-coral-400 transition-colors"
          >
            ← All work
          </Link>
          <p className="font-mono text-xs text-coral-400 mt-8 mb-3 uppercase tracking-[0.2em]">
            Case study · {project.category}
          </p>
          <h1 className="font-display font-semibold text-white text-4xl sm:text-5xl lg:text-6xl max-w-3xl leading-[1.05]">
            {project.name}
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300 text-lg leading-relaxed">{study.role}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-coral-500 text-white font-display text-sm px-5 py-3 rounded-full hover:bg-white hover:text-navy-900 transition-colors"
            >
              View live site <ExternalLink size={14} />
            </a>
            <button
              type="button"
              onClick={() => void openCalendlyPopup("case_study")}
              className="inline-flex items-center gap-2 border border-white/30 text-white font-display text-sm px-5 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              Book a similar project
            </button>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="relative -mb-16 lg:-mb-24 aspect-[21/9] overflow-hidden rounded-t-[2rem] border border-white/10 bg-navy-800">
            {project.image ? (
              <img
                src={project.image}
                alt={`${project.name} website screenshot`}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className={`h-full w-full bg-gradient-to-br ${project.gradient}`} />
            )}
          </div>
        </div>
      </header>

      <div className="bg-paper pt-28 lg:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-[minmax(0,1fr)_280px] gap-14">
          <div className="max-w-3xl space-y-12">
            <section>
              <p className="font-mono text-xs text-coral-500 uppercase tracking-wide mb-3">
                The challenge
              </p>
              <p className="text-slate-600 text-lg leading-[1.75]">{study.challenge}</p>
            </section>
            <section>
              <p className="font-mono text-xs text-coral-500 uppercase tracking-wide mb-3">
                What we did
              </p>
              <ul className="space-y-4">
                {study.approach.map((item) => (
                  <li key={item} className="flex gap-3 text-slate-600 text-lg leading-relaxed">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <p className="font-mono text-xs text-coral-500 uppercase tracking-wide mb-3">
                Outcome
              </p>
              <p className="text-slate-600 text-lg leading-[1.75]">{study.outcome}</p>
            </section>
            <section>
              <p className="font-mono text-xs text-coral-500 uppercase tracking-wide mb-3">
                Deliverables
              </p>
              <div className="flex flex-wrap gap-2">
                {study.deliverables.map((d) => (
                  <span
                    key={d}
                    className="font-mono text-xs px-3 py-1.5 rounded-full bg-navy-900/5 text-navy-900"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 space-y-4 h-fit">
            <div className="rounded-2xl border border-navy-900/10 bg-white p-5 space-y-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                At a glance
              </p>
              {study.highlights.map((h) => (
                <div key={h.label}>
                  <p className="font-mono text-[10px] uppercase text-slate-400">{h.label}</p>
                  <p className="font-display text-navy-900 mt-0.5">{h.value}</p>
                </div>
              ))}
              <div>
                <p className="font-mono text-[10px] uppercase text-slate-400">Timeline</p>
                <p className="font-display text-navy-900 mt-0.5">{study.timeline}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {project.stack.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-navy-900/5 text-slate-500"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <CtaBand />
    </>
  );
}

import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CtaBand from "../components/CtaBand";
import { openCalendlyPopup } from "../lib/calendly";
import { CASE_STUDY_SLUGS } from "../data/caseStudies";
import { PROJECTS } from "../data/projects";
import { getService, SERVICES } from "../data/services";

export default function ServiceDetailPage() {
  const { serviceId = "" } = useParams();
  const service = getService(serviceId);

  if (!service) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center bg-paper pt-32 px-6">
        <p className="font-display text-2xl text-navy-900 mb-4">Service not found</p>
        <Link to="/services" className="font-display text-coral-500 hover:underline">
          ← All services
        </Link>
      </div>
    );
  }

  const { page } = service;
  const related = page.relatedCaseSlugs
    .map((slug) => PROJECTS.find((p) => p.slug === slug))
    .filter(Boolean);

  const others = SERVICES.filter((s) => s.id !== service.id);

  return (
    <>
      <header className="relative overflow-hidden bg-navy-900 pt-40 pb-20 lg:pt-48 lg:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`absolute -top-24 -right-20 w-[420px] h-[500px] bg-gradient-to-br ${service.gradient} facet-cut-rev opacity-70`}
          />
          <div className="absolute inset-0 bg-navy-900/45" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <Link
            to="/services"
            className="font-mono text-xs text-sky-400 hover:text-coral-400 transition-colors"
          >
            ← All services
          </Link>
          <p className="font-mono text-xs text-coral-400 mt-8 mb-3 uppercase tracking-[0.2em]">
            {service.tag}
          </p>
          <h1 className="font-display font-semibold text-white text-4xl sm:text-5xl lg:text-6xl max-w-3xl leading-[1.05]">
            {service.title}
          </h1>
          <p className="mt-6 max-w-2xl text-slate-300 text-lg leading-relaxed">{page.heroLine}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void openCalendlyPopup(`service_${service.id}`)}
              className="bg-coral-500 text-white font-display text-sm px-6 py-3 rounded-full hover:bg-white hover:text-navy-900 transition-colors"
            >
              Book a free call
            </button>
            <Link
              to="/portfolio"
              className="border border-white/30 text-white font-display text-sm px-6 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              See related work
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {service.stack.map((t) => (
              <span
                key={t}
                className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-slate-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="bg-paper py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-[minmax(0,1fr)_280px] gap-14">
          <div className="max-w-3xl space-y-14">
            <section>
              <p className="font-mono text-xs text-coral-500 uppercase tracking-wide mb-3">
                Who it’s for
              </p>
              <ul className="space-y-3">
                {page.whoFor.map((item) => (
                  <li key={item} className="flex gap-3 text-slate-600 text-lg leading-relaxed">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <p className="font-mono text-xs text-coral-500 uppercase tracking-wide mb-3">
                What’s included
              </p>
              <ul className="space-y-3">
                {page.includes.map((item) => (
                  <li key={item} className="flex gap-3 text-slate-600 text-lg leading-relaxed">
                    <span className="text-coral-500 font-mono shrink-0">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <p className="font-mono text-xs text-coral-500 uppercase tracking-wide mb-6">
                How we work
              </p>
              <ol className="space-y-8">
                {page.process.map((step, i) => (
                  <li key={step.title} className="grid sm:grid-cols-[4rem_1fr] gap-4">
                    <span className="font-display text-3xl text-navy-900/20">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="font-display text-2xl text-navy-900">{step.title}</h2>
                      <p className="mt-2 text-slate-600 text-lg leading-relaxed">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <p className="font-mono text-xs text-coral-500 uppercase tracking-wide mb-3">
                Deliverables
              </p>
              <div className="flex flex-wrap gap-2">
                {page.deliverables.map((d) => (
                  <span
                    key={d}
                    className="font-mono text-xs px-3 py-1.5 rounded-full bg-navy-900/5 text-navy-900"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-slate-500 text-sm">
                Typical timeline: <span className="text-navy-900 font-display">{page.timeline}</span>
              </p>
            </section>

            {related.length > 0 && (
              <section>
                <p className="font-mono text-xs text-coral-500 uppercase tracking-wide mb-4">
                  Related work
                </p>
                <ul className="space-y-3">
                  {related.map((project) =>
                    project ? (
                      <li key={project.slug}>
                        <Link
                          to={
                            CASE_STUDY_SLUGS.has(project.slug)
                              ? `/portfolio/${project.slug}`
                              : "/portfolio"
                          }
                          className="group flex items-center justify-between gap-4 rounded-xl border border-navy-900/10 bg-white px-5 py-4 hover:border-coral-500 transition-colors"
                        >
                          <div>
                            <p className="font-display text-navy-900">{project.name}</p>
                            <p className="text-sm text-slate-500 mt-0.5">{project.summary}</p>
                          </div>
                          <ArrowRight
                            size={18}
                            className="shrink-0 text-slate-400 group-hover:text-coral-500 group-hover:translate-x-0.5 transition-all"
                          />
                        </Link>
                      </li>
                    ) : null,
                  )}
                </ul>
              </section>
            )}

            <section>
              <p className="font-mono text-xs text-coral-500 uppercase tracking-wide mb-4">FAQ</p>
              <div className="space-y-6">
                {page.faqs.map((faq) => (
                  <div key={faq.q}>
                    <h3 className="font-display text-xl text-navy-900">{faq.q}</h3>
                    <p className="mt-2 text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 space-y-4 h-fit">
            <div className="rounded-2xl bg-navy-900 text-white p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-sky-300">Next step</p>
              <p className="font-display text-xl mt-2">Not sure this is the fit?</p>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Book a free call — we’ll tell you straight which service (or combo) matches your goal.
              </p>
              <button
                type="button"
                onClick={() => void openCalendlyPopup(`service_sidebar_${service.id}`)}
                className="mt-4 w-full rounded-full bg-coral-500 text-white font-display text-sm px-5 py-3 hover:bg-white hover:text-navy-900 transition-colors"
              >
                Book a free call
              </button>
            </div>
            <div className="rounded-2xl border border-navy-900/10 bg-white p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-3">
                Other services
              </p>
              <ul className="space-y-2">
                {others.map((s) => (
                  <li key={s.id}>
                    <Link
                      to={`/services/${s.id}`}
                      className="font-display text-sm text-navy-900 hover:text-coral-500 transition-colors"
                    >
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <CtaBand />
    </>
  );
}

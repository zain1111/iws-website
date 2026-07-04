import { CONTACT } from "../data/contact";
import { TESTIMONIALS, type Testimonial } from "../data/testimonials";
import Reveal from "./Reveal";
import SplitText from "./SplitText";

function TestimonialCard({ quote, name, role }: Testimonial) {
  return (
    <article className="w-[min(88vw,420px)] shrink-0 bg-white border border-navy-900/10 rounded-2xl p-8 flex flex-col justify-between min-h-[280px] shadow-[0_1px_0_0_rgba(16,38,59,0.04)]">
      <p className="font-display text-lg text-navy-900 leading-snug">"{quote}"</p>
      <div className="mt-8">
        <p className="text-sm font-semibold text-navy-900">{name}</p>
        <p className="text-xs text-slate-500 font-mono">{role}</p>
      </div>
    </article>
  );
}

function TestimonialMarquee() {
  const loop = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div className="relative w-full">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-paper to-transparent z-10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-paper to-transparent z-10"
        aria-hidden
      />

      <div className="overflow-hidden motion-reduce:overflow-x-auto motion-reduce:pb-4">
        <div
          className="flex w-max gap-6 pl-6 animate-testimonial-scroll hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:pl-6 lg:pl-10"
          aria-label="Client testimonials"
        >
          {loop.map((q, i) => (
            <TestimonialCard key={`${q.name}-${i}`} {...q} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="bg-paper py-28 lg:py-36 border-t border-navy-900/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <Reveal>
          <p className="font-mono text-sm text-coral-500 mb-4">// 05 — receipts</p>
          <h2 className="font-display font-semibold text-4xl lg:text-6xl text-navy-900 max-w-2xl leading-[1.05]">
            <SplitText>Don't take our word for it.</SplitText>
          </h2>
          <p className="text-slate-500 text-sm mt-4 max-w-md font-mono">
            Real feedback from clients on{" "}
            <a
              href={CONTACT.upwork}
              target="_blank"
              rel="noopener noreferrer"
              className="text-coral-500 hover:text-coral-400 transition-colors underline underline-offset-2"
            >
              Upwork
            </a>
            .
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.12} className="mt-16">
        <TestimonialMarquee />
      </Reveal>

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <Reveal delay={0.2} className="mt-10 text-center">
          <a
            href={CONTACT.upwork}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-navy-900 border-b-2 border-coral-500 pb-1 hover:text-coral-500 transition-colors inline-block"
          >
            Read more reviews on Upwork →
          </a>
        </Reveal>
      </div>
    </section>
  );
}

import { TEAM } from "../data/team";
import TeamCard from "./TeamCard";

/** Continuous right-to-left team strip — same card design, marquee layout. */
export default function TeamMarquee() {
  const loop = [...TEAM, ...TEAM];

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
          className="flex w-max gap-6 pl-6 lg:pl-10 animate-testimonial-scroll hover:[animation-play-state:paused] motion-reduce:animate-none"
          aria-label="Team members"
        >
          {loop.map((member, i) => (
            <div key={`${member.name}-${i}`} className="w-[min(88vw,300px)] shrink-0">
              <TeamCard member={member} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

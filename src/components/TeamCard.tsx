import type { TeamMember } from "../data/team";

interface TeamCardProps {
  member: TeamMember;
}

export default function TeamCard({ member }: TeamCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white border border-navy-900/10">
      <div className="aspect-[4/5] overflow-hidden bg-navy-900/5">
        <img
          src={member.image}
          alt={member.name}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl text-navy-900">{member.name}</h3>
        <p className="font-mono text-xs text-coral-500 mt-1 uppercase tracking-wide">{member.role}</p>
      </div>
      <div
        className="absolute top-0 right-0 w-10 h-10 bg-coral-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        aria-hidden
      />
    </article>
  );
}

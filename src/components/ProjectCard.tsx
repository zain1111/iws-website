import { ArrowUpRight } from "lucide-react";
import type { Project } from "../data/projects";
import Parallax from "./Parallax";

interface ProjectCardProps {
  project: Project;
  /** Dark surface (home Work section) vs light surface (portfolio page). */
  theme?: "light" | "dark";
}

export default function ProjectCard({ project, theme = "light" }: ProjectCardProps) {
  const dark = theme === "dark";
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col overflow-hidden rounded-2xl border transition-colors duration-300 ${
        dark
          ? "border-white/10 bg-navy-800/40 hover:border-white/25"
          : "border-navy-900/10 bg-white hover:border-navy-900/25"
      }`}
    >
      {/* Media: live screenshot drifts on scroll, or a branded gradient tile */}
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
        <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient}`} aria-hidden />
        {project.image ? (
          <Parallax y={26} className="absolute -inset-y-[10%] inset-x-0">
            <img
              src={project.image}
              alt={`${project.name} website`}
              loading="lazy"
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </Parallax>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-5xl font-semibold text-white/90">{project.name}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/40 transition-colors duration-300" />
        <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy-900 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <ArrowUpRight size={18} />
        </span>
        <div
          className="absolute top-0 left-0 w-12 h-12 bg-coral-500"
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
          aria-hidden
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <p className="font-mono text-xs text-coral-500 mb-3">{project.category}</p>
        <h3 className={`font-display text-xl mb-2 ${dark ? "text-white" : "text-navy-900"}`}>
          {project.name}
        </h3>
        <p className={`text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-500"}`}>
          {project.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((t) => (
            <span
              key={t}
              className={`font-mono text-[11px] px-2.5 py-1 rounded-full ${
                dark ? "bg-white/10 text-slate-300" : "bg-navy-900/5 text-slate-500"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

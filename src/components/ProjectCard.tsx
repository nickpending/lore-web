import type { Project } from "../lib/types";

interface Props {
  project: Project;
  onTechClick?: (tech: string) => void;
}

export default function ProjectCard({ project, onTechClick }: Props) {
  return (
    <div className="bg-bg-card border border-dark-gray p-8 hover:border-cyan transition-colors">
      <h3 className="text-xl font-semibold text-white mb-2">
        {project.project}
      </h3>
      <p className="text-gray text-sm leading-relaxed mb-4">
        {project.description}
      </p>
      {project.tech.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <button
              key={tech}
              onClick={() => onTechClick?.(tech)}
              className="px-2 py-1 text-xs border border-cyan text-cyan hover:bg-cyan hover:text-bg-deep transition-colors cursor-pointer"
            >
              {tech}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from "react";
import type { Project } from "../lib/types";
import ProjectCard from "./ProjectCard";
import TechFilter from "./TechFilter";

interface Props {
  projects: Project[];
}

export default function ProjectsView({ projects }: Props) {
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

  // Extract unique techs from all projects, sorted alphabetically
  const allTechs = useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach((project) => {
      project.tech.forEach((tech) => techSet.add(tech));
    });
    return Array.from(techSet).sort();
  }, [projects]);

  // Filter projects based on selected techs
  const filteredProjects = useMemo(() => {
    if (selectedTechs.length === 0) {
      return projects;
    }
    return projects.filter((project) =>
      selectedTechs.some((tech) => project.tech.includes(tech)),
    );
  }, [projects, selectedTechs]);

  const handleTechClick = (tech: string) => {
    if (!selectedTechs.includes(tech)) {
      setSelectedTechs([...selectedTechs, tech]);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <TechFilter
          allTechs={allTechs}
          selectedTechs={selectedTechs}
          onFilterChange={setSelectedTechs}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.project}
            project={project}
            onTechClick={handleTechClick}
          />
        ))}
      </div>
      {filteredProjects.length === 0 && (
        <p className="text-gray text-center py-12">
          No projects match the selected filters.
        </p>
      )}
    </div>
  );
}

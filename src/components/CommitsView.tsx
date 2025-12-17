import { useState, useMemo } from "react";
import type { Commit } from "../lib/types";
import CommitRow from "./CommitRow";
import CommitFilters, { type DateRange } from "./CommitFilters";

interface Props {
  commits: Commit[];
}

function isWithinDateRange(dateString: string, range: DateRange): boolean {
  if (range === "all") return true;

  const date = new Date(dateString);
  const now = new Date();

  if (range === "week") {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  }

  if (range === "month") {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return date >= monthAgo;
  }

  return true;
}

export default function CommitsView({ commits }: Props) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("all");

  // Extract unique projects, sorted alphabetically
  const allProjects = useMemo(() => {
    const projects = new Set(commits.map((c) => c.project).filter(Boolean));
    return Array.from(projects).sort();
  }, [commits]);

  // Filter commits by project and date range
  const filteredCommits = useMemo(() => {
    return commits
      .filter((commit) => {
        if (selectedProject && commit.project !== selectedProject) {
          return false;
        }
        if (!isWithinDateRange(commit.date, dateRange)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [commits, selectedProject, dateRange]);

  const handleProjectClick = (project: string) => {
    setSelectedProject(project);
  };

  return (
    <div>
      <div className="mb-8">
        <CommitFilters
          allProjects={allProjects}
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>
      <div className="flex flex-col gap-2">
        {filteredCommits.map((commit) => (
          <CommitRow
            key={commit.sha}
            commit={commit}
            onProjectClick={handleProjectClick}
          />
        ))}
      </div>
      {filteredCommits.length === 0 && (
        <p className="text-gray text-center py-12">
          No commits match the selected filters.
        </p>
      )}
    </div>
  );
}

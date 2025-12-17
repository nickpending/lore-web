import type { TaskStatus } from "../lib/types";

interface Props {
  allProjects: string[];
  selectedProject: string | null;
  onProjectChange: (project: string | null) => void;
  allStatuses: TaskStatus[];
  selectedStatuses: TaskStatus[];
  onStatusChange: (statuses: TaskStatus[]) => void;
}

const statusLabels: Record<TaskStatus, string> = {
  later: "Later",
  active: "Active",
  done: "Done",
  archived: "Archived",
};

export default function TaskFilters({
  allProjects,
  selectedProject,
  onProjectChange,
  allStatuses,
  selectedStatuses,
  onStatusChange,
}: Props) {
  const toggleStatus = (status: TaskStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const clearStatuses = () => {
    onStatusChange([]);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Status pills (multi-select) */}
      <div className="flex items-center gap-2">
        <button
          onClick={clearStatuses}
          className={`px-3 py-1 text-xs border transition-colors ${
            selectedStatuses.length === 0
              ? "border-cyan bg-cyan text-bg-deep"
              : "border-dark-gray text-gray hover:border-cyan hover:text-cyan"
          }`}
        >
          All
        </button>
        {allStatuses.map((status) => {
          const isActive = selectedStatuses.includes(status);
          return (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={`px-3 py-1 text-xs border transition-colors ${
                isActive
                  ? "border-cyan bg-cyan text-bg-deep"
                  : "border-dark-gray text-gray hover:border-cyan hover:text-cyan"
              }`}
            >
              {statusLabels[status]}
            </button>
          );
        })}
      </div>

      {/* Project dropdown */}
      <select
        value={selectedProject ?? ""}
        onChange={(e) => onProjectChange(e.target.value || null)}
        className="px-3 py-1.5 text-sm bg-bg-card border border-dark-gray text-white focus:border-cyan focus:outline-none cursor-pointer"
      >
        <option value="">All projects</option>
        <option value="__none__">No project</option>
        {allProjects.map((project) => (
          <option key={project} value={project}>
            {project}
          </option>
        ))}
      </select>
    </div>
  );
}

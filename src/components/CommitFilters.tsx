interface Props {
  allProjects: string[];
  selectedProject: string | null;
  onProjectChange: (project: string | null) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export type DateRange = "week" | "month" | "all";

const dateRangeLabels: Record<DateRange, string> = {
  week: "This week",
  month: "This month",
  all: "All time",
};

export default function CommitFilters({
  allProjects,
  selectedProject,
  onProjectChange,
  dateRange,
  onDateRangeChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Project dropdown */}
      <select
        value={selectedProject ?? ""}
        onChange={(e) => onProjectChange(e.target.value || null)}
        className="px-3 py-1.5 text-sm bg-bg-card border border-dark-gray text-white focus:border-cyan focus:outline-none cursor-pointer"
      >
        <option value="">All projects</option>
        {allProjects.map((project) => (
          <option key={project} value={project}>
            {project}
          </option>
        ))}
      </select>

      {/* Date range pills */}
      <div className="flex items-center gap-2">
        {(Object.keys(dateRangeLabels) as DateRange[]).map((range) => {
          const isActive = dateRange === range;
          return (
            <button
              key={range}
              onClick={() => onDateRangeChange(range)}
              className={`px-3 py-1 text-xs border transition-colors ${
                isActive
                  ? "border-cyan bg-cyan text-bg-deep"
                  : "border-dark-gray text-gray hover:border-cyan hover:text-cyan"
              }`}
            >
              {dateRangeLabels[range]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

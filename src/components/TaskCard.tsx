import { CheckSquare, Lightbulb, Bug, Sparkles } from "lucide-react";
import type { Task, TaskStatus, TaskType } from "../lib/types";

interface Props {
  task: Task;
  onProjectClick?: (project: string) => void;
  onStatusClick?: (status: TaskStatus) => void;
}

const statusColors: Record<
  TaskStatus,
  { border: string; bg: string; text: string }
> = {
  later: { border: "border-warning", bg: "bg-warning", text: "text-bg-deep" },
  active: { border: "border-cyan", bg: "bg-cyan", text: "text-bg-deep" },
  done: { border: "border-success", bg: "bg-success", text: "text-bg-deep" },
  archived: { border: "border-gray", bg: "bg-gray", text: "text-bg-deep" },
};

const typeIcons: Record<
  TaskType,
  React.ComponentType<{ className?: string }>
> = {
  todo: CheckSquare,
  task: CheckSquare,
  idea: Lightbulb,
  bug: Bug,
  feature: Sparkles,
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function TaskCard({
  task,
  onProjectClick,
  onStatusClick,
}: Props) {
  const { title, status, type, project, captured } = task;
  const colors = statusColors[status];
  const TypeIcon = typeIcons[type];

  return (
    <div className="bg-bg-card border border-dark-gray p-6 hover:border-cyan transition-colors">
      {/* Header: type icon + status badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TypeIcon className="w-4 h-4 text-gray" />
          <span className="text-xs text-gray capitalize">{type}</span>
        </div>
        <button
          onClick={() => onStatusClick?.(status)}
          className={`px-2 py-0.5 text-xs border ${colors.border} ${colors.bg} ${colors.text} hover:opacity-80 transition-opacity cursor-pointer`}
        >
          {status}
        </button>
      </div>

      {/* Task description */}
      <p className="text-white text-sm leading-relaxed mb-4">{title}</p>

      {/* Footer: project + date */}
      <div className="flex items-center justify-between text-xs">
        {project ? (
          <button
            onClick={() => onProjectClick?.(project)}
            className="px-2 py-0.5 border border-cyan text-cyan hover:bg-cyan hover:text-bg-deep transition-colors cursor-pointer"
          >
            {project}
          </button>
        ) : (
          <span className="text-gray italic">No project</span>
        )}
        <span className="text-gray">{formatDate(captured)}</span>
      </div>
    </div>
  );
}

import { GitCommit, FileText, Plus, Minus } from "lucide-react";
import type { Commit } from "../lib/types";

interface Props {
  commit: Commit;
  onProjectClick?: (project: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CommitRow({ commit, onProjectClick }: Props) {
  const { sha, content, date, project, author, stats } = commit;
  const shortSha = sha.slice(0, 7);

  return (
    <div className="bg-bg-card border border-dark-gray p-6 hover:border-cyan transition-colors">
      {/* Header: project tag + sha + date */}
      <div className="flex items-center gap-3 mb-3">
        {project && (
          <button
            onClick={() => onProjectClick?.(project)}
            className="px-2 py-0.5 text-xs border border-cyan text-cyan hover:bg-cyan hover:text-bg-deep transition-colors cursor-pointer"
          >
            {project}
          </button>
        )}
        <code className="text-xs text-purple font-mono">{shortSha}</code>
        <span className="text-xs text-gray">
          {formatDate(date)} at {formatTime(date)}
        </span>
      </div>

      {/* Commit message - the main content */}
      <div className="flex items-start gap-3">
        <GitCommit className="w-5 h-5 text-cyan flex-shrink-0 mt-0.5" />
        <p className="text-white text-sm leading-relaxed">{content}</p>
      </div>

      {/* Footer: author + stats */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-gray">
        <span className="text-xs text-gray">{author.name}</span>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-gray">
            <FileText className="w-3 h-3" />
            {stats.files_changed} {stats.files_changed === 1 ? "file" : "files"}
          </span>
          <span className="flex items-center gap-1 text-success">
            <Plus className="w-3 h-3" />
            {stats.insertions}
          </span>
          <span className="flex items-center gap-1 text-danger">
            <Minus className="w-3 h-3" />
            {stats.deletions}
          </span>
        </div>
      </div>
    </div>
  );
}

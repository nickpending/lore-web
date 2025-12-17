import type { Commit, Task } from "../lib/types";

interface Props {
  commits: Commit[];
  tasks: Task[];
  limit?: number;
}

type ActivityItem =
  | {
      type: "commit";
      date: string;
      message: string;
      sha: string;
      project: string;
      insertions: number;
      deletions: number;
    }
  | {
      type: "task";
      date: string;
      title: string;
      project: string | null;
      status: string;
    };

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function RecentActivity({ commits, tasks, limit = 8 }: Props) {
  const activities: ActivityItem[] = [
    ...commits.map((c) => ({
      type: "commit" as const,
      date: c.date,
      message: c.content.split("\n")[0], // First line of actual commit message
      sha: c.sha.slice(0, 7),
      project: c.project,
      insertions: c.stats?.insertions ?? 0,
      deletions: c.stats?.deletions ?? 0,
    })),
    ...tasks.map((t) => ({
      type: "task" as const,
      date: t.date,
      title: t.title,
      project: t.project,
      status: t.status,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  if (activities.length === 0) {
    return <div className="text-gray text-sm">No recent activity</div>;
  }

  return (
    <div className="divide-y divide-dark-gray">
      {activities.map((activity, i) => (
        <div
          key={i}
          className="py-4 flex items-start gap-4 hover:bg-bg-card/50 transition-colors -mx-2 px-2"
        >
          {/* Project name - primary identifier */}
          <span className="text-cyan w-32 shrink-0 truncate font-medium">
            {activity.project || "—"}
          </span>

          {/* Content area */}
          <div className="flex-1 min-w-0">
            {activity.type === "commit" ? (
              <div className="flex flex-col gap-1">
                {/* Commit message - white */}
                <span className="text-white text-sm truncate">
                  {activity.message}
                </span>
                {/* Hash and stats - muted row */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-cyan">{activity.sha}</span>
                  {(activity.insertions > 0 || activity.deletions > 0) && (
                    <span className="text-gray">
                      <span className="text-success">
                        +{activity.insertions}
                      </span>
                      {" / "}
                      <span className="text-danger">-{activity.deletions}</span>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-white truncate">{activity.title}</span>
                <span className="text-xs text-warning">{activity.status}</span>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <span className="text-gray text-sm shrink-0">
            {formatRelativeTime(activity.date)}
          </span>
        </div>
      ))}
    </div>
  );
}

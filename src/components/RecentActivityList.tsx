import {
  GitCommit,
  CheckSquare,
  Lightbulb,
  Bug,
  Sparkles,
  BookOpen,
  Film,
  Podcast,
  Heart,
  Star,
  FileText,
  FolderKanban,
  Compass,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import type {
  Commit,
  Task,
  Capture,
  Project,
  PersonalItem,
  Exploration,
  Blog,
  TaskType,
  CaptureType,
} from "../lib/types";

interface Props {
  commits?: Commit[];
  tasks?: Task[];
  captures?: Capture[];
  projects?: Project[];
  personal?: PersonalItem[];
  explorations?: Exploration[];
  blogs?: Blog[];
  limit?: number;
}

type ActivitySource =
  | "commit"
  | "task"
  | "capture"
  | "project"
  | "personal"
  | "exploration"
  | "blog";

interface ActivityItem {
  source: ActivitySource;
  date: string;
  title: string;
  description: string;
  metric?: string;
  icon: LucideIcon;
  iconClass: string;
}

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

const taskIconMap: Record<TaskType, LucideIcon> = {
  todo: CheckSquare,
  task: CheckSquare,
  idea: Lightbulb,
  bug: Bug,
  feature: Sparkles,
};

const taskColorMap: Record<TaskType, string> = {
  todo: "bg-purple/20 text-purple",
  task: "bg-purple/20 text-purple",
  idea: "bg-warning/20 text-warning",
  bug: "bg-danger/20 text-danger",
  feature: "bg-cyan/20 text-cyan",
};

const captureIconMap: Record<CaptureType, LucideIcon> = {
  decision: CheckSquare,
  learning: BookOpen,
  gotcha: Bug,
  preference: Heart,
  idea: Lightbulb,
  note: PenLine,
};

const captureColorMap: Record<CaptureType, string> = {
  decision: "bg-success/20 text-success",
  learning: "bg-cyan/20 text-cyan",
  gotcha: "bg-danger/20 text-danger",
  preference: "bg-purple/20 text-purple",
  idea: "bg-warning/20 text-warning",
  note: "bg-gray/20 text-gray",
};

const personalIconMap: Record<string, LucideIcon> = {
  book: BookOpen,
  movie: Film,
  podcast: Podcast,
  habit: Heart,
  interest: Star,
};

export default function RecentActivityList({
  commits = [],
  tasks = [],
  captures = [],
  projects = [],
  personal = [],
  explorations = [],
  blogs = [],
  limit = 8,
}: Props) {
  const activities: ActivityItem[] = [
    // Commits
    ...commits.map((c) => ({
      source: "commit" as const,
      date: c.date,
      title: c.content.split("\n")[0],
      description: c.project,
      metric:
        c.stats?.insertions || c.stats?.deletions
          ? `+${c.stats.insertions}/-${c.stats.deletions}`
          : undefined,
      icon: GitCommit,
      iconClass: "bg-warning/20 text-warning",
    })),
    // Tasks
    ...tasks.map((t) => ({
      source: "task" as const,
      date: t.date,
      title: t.title,
      description: t.project || "No project",
      metric: t.status.toUpperCase(),
      icon: taskIconMap[t.type] || CheckSquare,
      iconClass: taskColorMap[t.type] || "bg-purple/20 text-purple",
    })),
    // Captures
    ...captures.map((c) => ({
      source: "capture" as const,
      date: c.timestamp || c.date,
      title: c.title.replace(/^\[.*?\]\s*/, ""), // Remove [type] prefix
      description: c.context,
      metric: c.type.toUpperCase(),
      icon: captureIconMap[c.type] || PenLine,
      iconClass: captureColorMap[c.type] || "bg-gray/20 text-gray",
    })),
    // Projects
    ...projects.map((p) => ({
      source: "project" as const,
      date: p.date,
      title: p.title,
      description: p.tech?.slice(0, 3).join(", ") || "Project",
      icon: FolderKanban,
      iconClass: "bg-cyan/20 text-cyan",
    })),
    // Personal
    ...personal.map((p) => ({
      source: "personal" as const,
      date: p.date,
      title:
        "title" in p
          ? p.title
          : "name" in p
            ? p.name
            : "habit" in p
              ? p.habit
              : "Item",
      description: p.type,
      metric:
        "rating" in p && p.rating
          ? `${"★".repeat(Math.round(p.rating / 2))}`
          : undefined,
      icon: personalIconMap[p.type] || Star,
      iconClass: "bg-purple/20 text-purple",
    })),
    // Explorations
    ...explorations.map((e) => ({
      source: "exploration" as const,
      date: e.date,
      title: e.title,
      description: e.project,
      metric: e.status.toUpperCase(),
      icon: Compass,
      iconClass: "bg-cyan/20 text-cyan",
    })),
    // Blogs
    ...blogs.map((b) => ({
      source: "blog" as const,
      date: b.date,
      title: b.title,
      description: b.topics?.slice(0, 2).join(", ") || "Blog",
      metric: b.status === "published" ? "LIVE" : "DRAFT",
      icon: FileText,
      iconClass:
        b.status === "published"
          ? "bg-success/20 text-success"
          : "bg-gray/20 text-gray",
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  if (activities.length === 0) {
    return <div className="text-gray text-sm">No recent activity</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-white uppercase tracking-wider">
          Recent activity
        </h2>
        <button className="text-xs text-gray hover:text-cyan transition-colors">
          View all
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-1">
        {activities.map((activity, i) => {
          const Icon = activity.icon;

          return (
            <div
              key={i}
              className="flex items-start gap-3 py-3 px-2 -mx-2 rounded hover:bg-bg-elevated/50 transition-colors cursor-pointer"
            >
              {/* Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.iconClass}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">
                  {activity.title}
                </div>
                <div className="text-xs text-gray truncate">
                  {activity.description} · {formatRelativeTime(activity.date)}
                </div>
              </div>

              {/* Metric */}
              {activity.metric && (
                <div className="shrink-0 text-xs text-cyan font-medium">
                  {activity.metric}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import {
  Folder,
  GitBranch,
  User,
  CheckSquare,
  type LucideIcon,
} from "lucide-react";

interface Props {
  title: string;
  count: number;
  link: string;
  icon: "projects" | "commits" | "personal" | "tasks";
}

const iconMap: Record<Props["icon"], LucideIcon> = {
  projects: Folder,
  commits: GitBranch,
  personal: User,
  tasks: CheckSquare,
};

export default function StatsCard({ title, count, link, icon }: Props) {
  const Icon = iconMap[icon];

  return (
    <a
      href={link}
      className="block bg-bg-card border border-dark-gray p-8 hover:border-cyan transition-colors no-underline group"
    >
      <div className="text-5xl font-semibold text-white tracking-tight">
        {count.toLocaleString()}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Icon className="w-4 h-4 text-gray" />
        <span className="text-xs text-gray uppercase tracking-wider">
          {title}
        </span>
      </div>
    </a>
  );
}

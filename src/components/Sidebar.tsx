import {
  Waves,
  GitCommit,
  GlassWater,
  Brain,
  Calendar,
  FolderKanban,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  count?: number;
}

interface Props {
  currentPath?: string;
  counts?: {
    commits?: number;
    projects?: number;
  };
}

const navItems: NavItem[] = [
  { icon: Waves, label: "Waves", href: "/" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: GitCommit, label: "Commits", href: "/commits" },
  { icon: GlassWater, label: "Glass metrics", href: "/personal" },
  { icon: Brain, label: "Neurons", href: "/tasks" },
  { icon: Calendar, label: "Days", href: "#" },
];

export default function Sidebar({ currentPath = "/", counts }: Props) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-52 bg-bg-deep border-r border-dark-gray flex flex-col z-50">
      {/* Logo */}
      <div className="p-5 border-b border-dark-gray">
        <a href="/" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 rounded-full bg-cyan/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-cyan" />
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">
            lore
          </span>
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = currentPath === item.href;
          const Icon = item.icon;
          const count =
            item.href === "/commits"
              ? counts?.commits
              : item.href === "/projects"
                ? counts?.projects
                : undefined;

          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm no-underline transition-colors ${
                isActive
                  ? "bg-cyan/10 text-cyan border-l-2 border-cyan"
                  : "text-gray hover:text-white hover:bg-bg-card"
              }`}
            >
              <Icon size={18} strokeWidth={1.5} />
              <span className="flex-1">{item.label}</span>
              {count !== undefined && (
                <span className="text-xs text-dark-gray">{count}</span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Footer area - can add user avatar later */}
      <div className="p-4 border-t border-dark-gray">
        <div className="text-xs text-dark-gray">v0.2.0</div>
      </div>
    </aside>
  );
}

import { ChevronDown, Search, User } from "lucide-react";

interface Props {
  title?: string;
}

export default function Header({ title = "Contribution Heat" }: Props) {
  return (
    <header className="h-14 bg-bg-deep border-b border-dark-gray flex items-center justify-between px-6">
      {/* Left: Title */}
      <h1 className="text-lg font-medium text-white">{title}</h1>

      {/* Right: Controls */}
      <div className="flex items-center gap-4">
        {/* Dropdown buttons */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray hover:text-white transition-colors">
          Activities
          <ChevronDown size={14} />
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-cyan bg-cyan/10 rounded">
          Dashboard
          <ChevronDown size={14} />
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray hover:text-white transition-colors">
          News
          <ChevronDown size={14} />
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray hover:text-white transition-colors">
          Extras
          <ChevronDown size={14} />
        </button>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-card border border-dark-gray rounded text-sm text-gray">
          <Search size={14} />
          <span>Timeline</span>
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-bg-elevated border border-dark-gray flex items-center justify-center">
          <User size={16} className="text-gray" />
        </div>
      </div>
    </header>
  );
}

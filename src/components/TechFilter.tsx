interface Props {
  allTechs: string[];
  selectedTechs: string[];
  onFilterChange: (techs: string[]) => void;
}

export default function TechFilter({
  allTechs,
  selectedTechs,
  onFilterChange,
}: Props) {
  const toggleTech = (tech: string) => {
    if (selectedTechs.includes(tech)) {
      onFilterChange(selectedTechs.filter((t) => t !== tech));
    } else {
      onFilterChange([...selectedTechs, tech]);
    }
  };

  const clearAll = () => {
    onFilterChange([]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={clearAll}
        className={`px-3 py-1 text-xs border transition-colors ${
          selectedTechs.length === 0
            ? "border-cyan bg-cyan text-bg-deep"
            : "border-dark-gray text-gray hover:border-cyan hover:text-cyan"
        }`}
      >
        All
      </button>
      {allTechs.map((tech) => {
        const isActive = selectedTechs.includes(tech);
        return (
          <button
            key={tech}
            onClick={() => toggleTech(tech)}
            className={`px-3 py-1 text-xs border transition-colors ${
              isActive
                ? "border-cyan bg-cyan text-bg-deep"
                : "border-dark-gray text-gray hover:border-cyan hover:text-cyan"
            }`}
          >
            {tech}
          </button>
        );
      })}
    </div>
  );
}

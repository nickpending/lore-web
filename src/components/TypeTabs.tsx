import type { PersonalType } from "../lib/types";

interface Props {
  types: PersonalType[];
  counts: Record<PersonalType, number>;
  selectedType: PersonalType | null;
  onTypeChange: (type: PersonalType | null) => void;
}

const typeLabels: Record<PersonalType, string> = {
  interest: "Interests",
  book: "Books",
  movie: "Movies",
  podcast: "Podcasts",
  habit: "Habits",
};

export default function TypeTabs({
  types,
  counts,
  selectedType,
  onTypeChange,
}: Props) {
  const totalCount = Object.values(counts).reduce((sum, c) => sum + c, 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onTypeChange(null)}
        className={`px-3 py-1 text-xs border transition-colors ${
          selectedType === null
            ? "border-cyan bg-cyan text-bg-deep"
            : "border-dark-gray text-gray hover:border-cyan hover:text-cyan"
        }`}
      >
        All ({totalCount})
      </button>
      {types.map((type) => (
        <button
          key={type}
          onClick={() => onTypeChange(type)}
          className={`px-3 py-1 text-xs border transition-colors ${
            selectedType === type
              ? "border-cyan bg-cyan text-bg-deep"
              : "border-dark-gray text-gray hover:border-cyan hover:text-cyan"
          }`}
        >
          {typeLabels[type]} ({counts[type]})
        </button>
      ))}
    </div>
  );
}

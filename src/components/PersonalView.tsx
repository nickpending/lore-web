import { useState, useMemo } from "react";
import type {
  PersonalItem as PersonalItemType,
  PersonalType,
} from "../lib/types";
import PersonalItem from "./PersonalItem";
import TypeTabs from "./TypeTabs";

interface Props {
  items: PersonalItemType[];
}

const typeOrder: PersonalType[] = [
  "interest",
  "book",
  "movie",
  "podcast",
  "habit",
];

export default function PersonalView({ items }: Props) {
  const [selectedType, setSelectedType] = useState<PersonalType | null>(null);

  // Compute counts per type
  const counts = useMemo(() => {
    const result: Record<PersonalType, number> = {
      interest: 0,
      book: 0,
      movie: 0,
      podcast: 0,
      habit: 0,
    };
    items.forEach((item) => {
      result[item.type]++;
    });
    return result;
  }, [items]);

  // Get types that have items, in order
  const availableTypes = useMemo(() => {
    return typeOrder.filter((type) => counts[type] > 0);
  }, [counts]);

  // Filter items by selected type
  const filteredItems = useMemo(() => {
    if (selectedType === null) {
      return items;
    }
    return items.filter((item) => item.type === selectedType);
  }, [items, selectedType]);

  return (
    <div>
      <div className="mb-8">
        <TypeTabs
          types={availableTypes}
          counts={counts}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {filteredItems.map((item, index) => (
          <PersonalItem key={`${item.type}-${index}`} item={item} />
        ))}
      </div>
      {filteredItems.length === 0 && (
        <p className="text-gray text-center py-12">
          No items match the selected filter.
        </p>
      )}
    </div>
  );
}

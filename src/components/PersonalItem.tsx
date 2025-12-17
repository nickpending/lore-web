import { Star, ExternalLink } from "lucide-react";
import type {
  PersonalItem as PersonalItemType,
  Book,
  Movie,
  Podcast,
  Interest,
  Habit,
} from "../lib/types";

interface Props {
  item: PersonalItemType;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${
            star <= rating ? "fill-cyan text-cyan" : "text-dark-gray"
          }`}
        />
      ))}
    </div>
  );
}

function BookItem({ item }: { item: Book }) {
  return (
    <div className="bg-bg-card border border-dark-gray p-6 hover:border-cyan transition-colors">
      <h3 className="text-lg font-medium text-white mb-1">{item.title}</h3>
      <p className="text-gray text-sm mb-3">{item.author}</p>
      <StarRating rating={item.rating} />
    </div>
  );
}

function MovieItem({ item }: { item: Movie }) {
  return (
    <div className="bg-bg-card border border-dark-gray p-6 hover:border-cyan transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-lg font-medium text-white">{item.title}</h3>
        <span className="px-2 py-0.5 text-xs border border-purple text-purple shrink-0">
          {item.year}
        </span>
      </div>
      <StarRating rating={item.rating} />
    </div>
  );
}

function PodcastItem({ item }: { item: Podcast }) {
  return (
    <div className="bg-bg-card border border-dark-gray p-6 hover:border-cyan transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-medium text-white">{item.title}</h3>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan hover:text-white transition-colors shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      {item.description && (
        <p className="text-gray text-sm mt-2 line-clamp-2">
          {item.description}
        </p>
      )}
    </div>
  );
}

function InterestItem({ item }: { item: Interest }) {
  return (
    <div className="bg-bg-card border border-dark-gray p-6 hover:border-cyan transition-colors">
      <h3 className="text-lg font-medium text-white">{item.name}</h3>
    </div>
  );
}

function HabitItem({ item }: { item: Habit }) {
  return (
    <div className="bg-bg-card border border-dark-gray p-6 hover:border-cyan transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-medium text-white">{item.habit}</h3>
        {item.frequency && (
          <span className="px-2 py-0.5 text-xs border border-gray text-gray shrink-0">
            {item.frequency}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PersonalItem({ item }: Props) {
  switch (item.type) {
    case "book":
      return <BookItem item={item} />;
    case "movie":
      return <MovieItem item={item} />;
    case "podcast":
      return <PodcastItem item={item} />;
    case "interest":
      return <InterestItem item={item} />;
    case "habit":
      return <HabitItem item={item} />;
    default:
      return null;
  }
}

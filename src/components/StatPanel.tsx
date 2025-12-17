import Sparkline from "./Sparkline";

interface Props {
  title: string;
  value?: number;
  trend?: number[];
  trendLabel?: string;
  link?: string;
  variant?: "default" | "chart" | "placeholder";
  className?: string;
}

export default function StatPanel({
  title,
  value,
  trend,
  trendLabel,
  link,
  variant = "default",
  className = "",
}: Props) {
  const content = (
    <div
      className={`bg-bg-card border border-dark-gray p-6 h-full flex flex-col ${
        link ? "hover:border-cyan transition-colors" : ""
      } ${className}`}
    >
      {/* Title */}
      <span className="text-xs text-gray uppercase tracking-wider mb-3">
        {title}
      </span>

      {variant === "default" && (
        <>
          {/* Big number */}
          {value !== undefined && (
            <div className="text-4xl font-semibold text-white tracking-tight mb-4">
              {value.toLocaleString()}
            </div>
          )}
          {/* Sparkline */}
          {trend && trend.length > 0 && (
            <div className="mt-auto">
              <Sparkline data={trend} width={180} height={48} filled />
              {trendLabel && (
                <span className="text-xs text-dark-gray mt-1 block">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </>
      )}

      {variant === "chart" && (
        <>
          {/* Large area chart */}
          {trend && trend.length > 0 && (
            <div className="flex-1 flex flex-col justify-end">
              <Sparkline data={trend} width={280} height={100} filled />
              {trendLabel && (
                <span className="text-xs text-dark-gray mt-1">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </>
      )}

      {variant === "placeholder" && (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-dark-gray text-sm">Coming soon</span>
        </div>
      )}
    </div>
  );

  if (link) {
    return (
      <a href={link} className="block no-underline h-full">
        {content}
      </a>
    );
  }

  return content;
}

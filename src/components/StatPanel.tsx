import Sparkline from "./Sparkline";

interface Props {
  title: string;
  value?: number;
  trend?: number[];
  trendLabel?: string;
  link?: string;
  variant?: "default" | "chart" | "placeholder" | "overlay";
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
  const isOverlay = variant === "overlay";
  const baseClasses = isOverlay
    ? "bg-bg-elevated/90 backdrop-blur rounded border border-cyan/30 px-6 py-4 min-w-[140px]"
    : "bg-bg-card border border-dark-gray p-6 h-full flex flex-col";

  const content = (
    <div
      className={`${baseClasses} ${
        link ? "hover:border-cyan transition-colors" : ""
      } ${className}`}
    >
      {/* Title - shown at top for non-overlay variants */}
      {!isOverlay && (
        <span className="text-xs text-gray uppercase tracking-wider mb-3">
          {title}
        </span>
      )}

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

      {variant === "overlay" && (
        <>
          {/* Large number */}
          {value !== undefined && (
            <div className="text-3xl font-semibold text-white">
              {value.toLocaleString()}
            </div>
          )}
          {/* Label below number */}
          <div className="text-xs text-gray mt-1">{title}</div>
        </>
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

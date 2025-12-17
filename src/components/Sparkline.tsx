interface Props {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
  className?: string;
}

export default function Sparkline({
  data,
  width = 100,
  height = 32,
  color = "#00D9FF",
  strokeWidth = 2,
  filled = false,
  className = "",
}: Props) {
  // Handle empty or single-point data
  if (!data || data.length < 2) {
    return null;
  }

  // Find min/max for normalization
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Avoid division by zero for flat data

  // Padding to prevent stroke clipping at edges
  const padding = strokeWidth;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  // Generate points
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * innerWidth;
    const y = padding + innerHeight - ((value - min) / range) * innerHeight;
    return { x, y };
  });

  // Build line path
  const linePath = points
    .map(
      (point, i) =>
        `${i === 0 ? "M" : "L"} ${point.x.toFixed(2)},${point.y.toFixed(2)}`,
    )
    .join(" ");

  // Build area path (closes to bottom)
  const areaPath = filled
    ? `${linePath} L ${points[points.length - 1].x.toFixed(2)},${height - padding} L ${padding},${height - padding} Z`
    : "";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      {filled && <path d={areaPath} fill={color} fillOpacity={0.2} />}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

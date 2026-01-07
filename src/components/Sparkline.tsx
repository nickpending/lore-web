interface Props {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
  className?: string;
  xLabels?: string[];
}

export default function Sparkline({
  data,
  width = 100,
  height = 32,
  color = "#00D9FF",
  strokeWidth = 2,
  filled = false,
  className = "",
  xLabels,
}: Props) {
  // Add extra height for labels if provided
  const labelHeight = xLabels && xLabels.length > 0 ? 16 : 0;
  const totalHeight = height + labelHeight;
  const chartHeight = height;
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

  // Build area path (closes to bottom of chart area)
  const areaPath = filled
    ? `${linePath} L ${points[points.length - 1].x.toFixed(2)},${chartHeight - padding} L ${padding},${chartHeight - padding} Z`
    : "";

  // Generate label positions (evenly spaced)
  const labelPositions = xLabels?.map((label, index) => {
    const x = padding + (index / Math.max(1, xLabels.length - 1)) * innerWidth;
    return { label, x };
  });

  return (
    <svg
      width={width}
      height={totalHeight}
      viewBox={`0 0 ${width} ${totalHeight}`}
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
      {/* X-axis labels */}
      {labelPositions?.map((item, i) => (
        <text
          key={i}
          x={item.x}
          y={chartHeight + 12}
          textAnchor="middle"
          fill="#6b7280"
          fontSize="10"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {item.label}
        </text>
      ))}
    </svg>
  );
}

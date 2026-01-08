import { useRef, useState, useEffect } from "react";

interface Props {
  label: string;
  data: number[];
  weekDates: string[]; // ISO date strings for each data point
  total?: number;
  unit?: string;
  color?: string;
  className?: string;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface MonthLabel {
  month: string;
  x: number; // Position as fraction 0-1
}

// Generate month labels positioned at center of each month's data range
function generateMonthLabels(dates: string[]): MonthLabel[] {
  if (dates.length === 0) return [];

  const monthGroups: { month: string; indices: number[] }[] = [];
  let currentMonth = "";

  dates.forEach((dateStr, index) => {
    const date = new Date(dateStr);
    const monthName = MONTHS[date.getMonth()];

    if (monthName !== currentMonth) {
      monthGroups.push({ month: monthName, indices: [index] });
      currentMonth = monthName;
    } else {
      monthGroups[monthGroups.length - 1].indices.push(index);
    }
  });

  // Position label at center of each month's range
  return monthGroups.map((group) => {
    const centerIndex = group.indices[Math.floor(group.indices.length / 2)];
    return {
      month: group.month,
      x: centerIndex / (dates.length - 1),
    };
  });
}

// Get month boundary positions for grid lines
function getMonthBoundaries(dates: string[]): number[] {
  if (dates.length < 2) return [];

  const boundaries: number[] = [];
  let currentMonth = new Date(dates[0]).getMonth();

  dates.forEach((dateStr, index) => {
    const month = new Date(dateStr).getMonth();
    if (month !== currentMonth && index > 0) {
      boundaries.push(index / (dates.length - 1));
      currentMonth = month;
    }
  });

  return boundaries;
}

// Build smooth bezier path using Catmull-Rom spline
function buildSmoothPath(
  points: { x: number; y: number }[],
  tension: number = 0.5,
  yMax?: number,
): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  }

  const chartBottom = yMax ?? Math.max(...points.map((p) => p.y));

  let path = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Calculate control points
    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 3;
    let cp1y = p1.y + ((p2.y - p0.y) * tension) / 3;
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 3;
    let cp2y = p2.y - ((p3.y - p1.y) * tension) / 3;

    // Clamp control points to chart floor
    cp1y = Math.min(cp1y, chartBottom);
    cp2y = Math.min(cp2y, chartBottom);

    path += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }

  return path;
}

export default function ProjectActivityCard({
  label,
  data,
  weekDates,
  total,
  unit = "items",
  color = "#00D9FF",
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(200);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Chart dimensions
  const height = 80;
  const labelHeight = 16;
  const totalHeight = height + labelHeight;
  const paddingLeft = 24; // Space for Y-axis labels
  const paddingRight = 4;
  const paddingTop = 4;
  const paddingBottom = 4;
  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  // Generate month labels and grid lines
  const monthLabels = generateMonthLabels(weekDates);
  const monthBoundaries = getMonthBoundaries(weekDates);

  // Normalize data
  const min = 0; // Always start Y-axis at 0
  const max = Math.max(...data, 1); // At least 1 to avoid division by zero
  const range = max - min;

  // Generate points
  const points = data.map((value, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((value - min) / range) * innerHeight;
    return { x, y, value };
  });

  // Build smooth curved path
  const chartBottom = height - paddingBottom;
  const linePath = buildSmoothPath(points, 0.5, chartBottom);

  // Build area path by closing to bottom
  const areaPath =
    points.length >= 2
      ? `${linePath} L ${points[points.length - 1].x.toFixed(2)},${chartBottom} L ${paddingLeft},${chartBottom} Z`
      : "";

  return (
    <div
      className={`bg-bg-card border border-dark-gray p-4 rounded hover:border-cyan transition-colors ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white truncate">{label}</h3>
        {total !== undefined && (
          <span className="text-xs text-cyan">
            {total} {unit}
          </span>
        )}
      </div>

      {/* Activity chart with grid and labels */}
      <div ref={containerRef} className="w-full">
        <svg
          width={width}
          height={totalHeight}
          viewBox={`0 0 ${width} ${totalHeight}`}
          aria-hidden="true"
        >
          {/* Grid lines at month boundaries */}
          {monthBoundaries.map((pos, i) => (
            <line
              key={`grid-${i}`}
              x1={paddingLeft + pos * innerWidth}
              y1={0}
              x2={paddingLeft + pos * innerWidth}
              y2={height}
              stroke={color}
              strokeOpacity={0.15}
              strokeWidth={1}
            />
          ))}

          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75].map((ratio, i) => (
            <line
              key={`hgrid-${i}`}
              x1={paddingLeft}
              y1={paddingTop + innerHeight * ratio}
              x2={paddingLeft + innerWidth}
              y2={paddingTop + innerHeight * ratio}
              stroke={color}
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          ))}

          {/* Area fill */}
          <path d={areaPath} fill={color} fillOpacity={0.15} />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Y-axis labels */}
          <text
            x={paddingLeft - 4}
            y={paddingTop + 4}
            textAnchor="end"
            fill="#6b7280"
            fontSize="9"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {max}
          </text>
          <text
            x={paddingLeft - 4}
            y={chartBottom}
            textAnchor="end"
            fill="#6b7280"
            fontSize="9"
            fontFamily="Inter, system-ui, sans-serif"
          >
            0
          </text>

          {/* Month labels on X-axis */}
          {monthLabels.map((ml, i) => (
            <text
              key={`label-${i}`}
              x={paddingLeft + ml.x * innerWidth}
              y={height + 12}
              textAnchor="middle"
              fill="#6b7280"
              fontSize="10"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {ml.month}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

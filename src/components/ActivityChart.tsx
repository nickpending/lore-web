import { useState, useRef, useLayoutEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataPoint {
  date: string;
  value: number;
  commits?: number;
  tasks?: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
  color?: string;
  title?: string;
  className?: string;
  monthsToShow?: number;
}

interface HoverInfo {
  x: number;
  commitY: number;
  taskY: number;
  date: string;
  commits: number;
  tasks: number;
  screenX: number;
  screenY: number;
}

export default function ActivityChart({
  data,
  height = 350,
  color = "#00D9FF",
  title = "Heros",
  className = "",
  monthsToShow = 1,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [hover, setHover] = useState<HoverInfo | null>(null);

  // Calculate days to show based on months
  const daysToShow = monthsToShow * 30;

  // Window offset from the end (0 = most recent, positive = going back in time)
  const [windowOffset, setWindowOffset] = useState(0);

  // Calculate max offset (can't go beyond start of data)
  const maxOffset = Math.max(0, data.length - daysToShow);

  // Measure container width on mount and resize
  useLayoutEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  if (!data || data.length < 2) {
    return null;
  }

  // Get the windowed data (3 months from the offset position)
  const startIndex = Math.max(0, data.length - daysToShow - windowOffset);
  const endIndex = Math.min(data.length, startIndex + daysToShow);
  const windowedData = data.slice(startIndex, endIndex);

  // Use measured container width for viewBox
  const width = containerWidth;
  const padding = { top: 60, right: 20, bottom: 50, left: 20 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Find max for normalization - use combined max for consistent scale
  const commitValues = windowedData.map((d) => d.commits ?? 0);
  const taskValues = windowedData.map((d) => d.tasks ?? 0);
  const maxCommits = Math.max(...commitValues, 1);
  const maxTasks = Math.max(...taskValues, 1);
  const maxValue = Math.max(maxCommits, maxTasks, 1);

  // Generate points for commits line
  const commitPoints = windowedData.map((d, index) => {
    const x =
      padding.left +
      (index / Math.max(1, windowedData.length - 1)) * innerWidth;
    const commits = d.commits ?? 0;
    const y = padding.top + innerHeight - (commits / maxValue) * innerHeight;
    return {
      x,
      y,
      date: d.date,
      value: commits,
      commits: commits,
      tasks: d.tasks ?? 0,
    };
  });

  // Generate points for tasks line
  const taskPoints = windowedData.map((d, index) => {
    const x =
      padding.left +
      (index / Math.max(1, windowedData.length - 1)) * innerWidth;
    const tasks = d.tasks ?? 0;
    const y = padding.top + innerHeight - (tasks / maxValue) * innerHeight;
    return {
      x,
      y,
      date: d.date,
      value: tasks,
      commits: d.commits ?? 0,
      tasks: tasks,
    };
  });

  // Build smooth bezier paths - higher tension (0.5) for smoother curves
  const commitPath = buildSmoothPath(commitPoints, 0.5);
  const taskPath = buildSmoothPath(taskPoints, 0.5);

  // Build area paths (closes to bottom)
  const commitAreaPath =
    commitPoints.length > 1
      ? `${commitPath} L ${commitPoints[commitPoints.length - 1].x.toFixed(2)},${padding.top + innerHeight} L ${padding.left},${padding.top + innerHeight} Z`
      : "";
  const taskAreaPath =
    taskPoints.length > 1
      ? `${taskPath} L ${taskPoints[taskPoints.length - 1].x.toFixed(2)},${padding.top + innerHeight} L ${padding.left},${padding.top + innerHeight} Z`
      : "";

  // Generate month labels from windowed data
  const monthLabels = generateMonthLabels(windowedData, padding, innerWidth);

  // Generate vertical grid lines at month boundaries
  const gridLines = monthLabels.map((label) => ({
    x: label.x,
    y1: padding.top,
    y2: padding.top + innerHeight,
  }));

  // Navigation handlers
  const canGoBack = windowOffset < maxOffset;
  const canGoForward = windowOffset > 0;

  const goBack = () => {
    if (canGoBack) {
      setWindowOffset(Math.min(maxOffset, windowOffset + 30)); // Go back ~1 month
    }
  };

  const goForward = () => {
    if (canGoForward) {
      setWindowOffset(Math.max(0, windowOffset - 30)); // Go forward ~1 month
    }
  };

  // Handle mouse move for tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;

    // Find closest data point index by x position
    let closestIdx = 0;
    let closestDist = Math.abs(mouseX - commitPoints[0].x);

    for (let i = 0; i < commitPoints.length; i++) {
      const dist = Math.abs(mouseX - commitPoints[i].x);
      if (dist < closestDist) {
        closestIdx = i;
        closestDist = dist;
      }
    }

    if (closestDist < 30) {
      const commitPt = commitPoints[closestIdx];
      const taskPt = taskPoints[closestIdx];
      setHover({
        x: commitPt.x,
        commitY: commitPt.y,
        taskY: taskPt.y,
        date: commitPt.date,
        commits: commitPt.commits,
        tasks: taskPt.tasks,
        screenX: e.clientX,
        screenY: e.clientY,
      });
    } else {
      setHover(null);
    }
  };

  const handleMouseLeave = () => setHover(null);

  // Get date range for display
  const startDate = windowedData[0]?.date;
  const endDate = windowedData[windowedData.length - 1]?.date;
  const dateRangeLabel =
    startDate && endDate
      ? `${formatMonthYear(startDate)} - ${formatMonthYear(endDate)}`
      : "";

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Navigation controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <span className="text-gray text-sm mr-2">{dateRangeLabel}</span>
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className={`p-1 rounded border border-dark-gray ${
            canGoBack
              ? "text-gray hover:text-white hover:bg-bg-card cursor-pointer"
              : "text-dark-gray cursor-not-allowed"
          }`}
          aria-label="View earlier data"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={goForward}
          disabled={!canGoForward}
          className={`p-1 rounded border border-dark-gray ${
            canGoForward
              ? "text-gray hover:text-white hover:bg-bg-card cursor-pointer"
              : "text-dark-gray cursor-not-allowed"
          }`}
          aria-label="View later data"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={`w-full h-full ${className}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label="Activity chart showing contribution trends over time"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Subtle line glow filter */}
          <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Commits area gradient (cyan) */}
          <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="20%" stopColor={color} stopOpacity="0.3" />
            <stop offset="50%" stopColor={color} stopOpacity="0.12" />
            <stop offset="80%" stopColor={color} stopOpacity="0.04" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>

          {/* Tasks area gradient (purple) */}
          <linearGradient id="taskGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9F4DFF" stopOpacity="0.5" />
            <stop offset="20%" stopColor="#9F4DFF" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#9F4DFF" stopOpacity="0.12" />
            <stop offset="80%" stopColor="#9F4DFF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#9F4DFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Title inside chart */}
        <text
          x={padding.left + 10}
          y={padding.top - 20}
          fill="#EEEEEE"
          fontSize="24"
          fontFamily="Archivo, system-ui, sans-serif"
          fontWeight="500"
        >
          {title}
        </text>

        {/* Vertical grid lines */}
        {gridLines.map((line, i) => (
          <line
            key={i}
            x1={line.x}
            y1={line.y1}
            x2={line.x}
            y2={line.y2}
            stroke="#1a2530"
            strokeWidth="1"
          />
        ))}

        {/* Tasks area and line (purple, behind) */}
        {taskAreaPath && <path d={taskAreaPath} fill="url(#taskGradient)" />}
        {taskPath && (
          <path
            d={taskPath}
            fill="none"
            stroke="#9F4DFF"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#line-glow)"
          />
        )}

        {/* Commits area and line (cyan, in front) */}
        {commitAreaPath && (
          <path d={commitAreaPath} fill="url(#commitGradient)" />
        )}
        {commitPath && (
          <path
            d={commitPath}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#line-glow)"
          />
        )}

        {/* Hover indicators - one on each line */}
        {hover && (
          <>
            {/* Vertical guide line */}
            <line
              x1={hover.x}
              y1={padding.top}
              x2={hover.x}
              y2={padding.top + innerHeight}
              stroke="#666"
              strokeWidth={1}
              strokeOpacity={0.4}
              strokeDasharray="4,4"
            />
            {/* Commit dot (cyan) */}
            <circle cx={hover.x} cy={hover.commitY} r={6} fill={color} />
            <circle
              cx={hover.x}
              cy={hover.commitY}
              r={10}
              fill={color}
              fillOpacity={0.3}
            />
            {/* Task dot (purple) */}
            <circle cx={hover.x} cy={hover.taskY} r={6} fill="#9F4DFF" />
            <circle
              cx={hover.x}
              cy={hover.taskY}
              r={10}
              fill="#9F4DFF"
              fillOpacity={0.3}
            />
          </>
        )}

        {/* X-axis month labels */}
        {monthLabels.map((label, i) => (
          <text
            key={`${label.month}-${i}`}
            x={label.x}
            y={height - 15}
            textAnchor="middle"
            fill="#4a5568"
            fontSize="13"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {label.month}
          </text>
        ))}
      </svg>

      {/* Tooltip with activity breakdown */}
      {hover && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: hover.screenX + 15,
            top: hover.screenY - 10,
          }}
        >
          <div className="bg-bg-card border border-dark-gray px-3 py-2 text-sm shadow-lg">
            <div className="text-white font-medium">
              {formatDate(hover.date)}
            </div>
            <div className="text-cyan">{hover.commits} commits</div>
            <div className="text-purple">{hover.tasks} tasks</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Build smooth bezier path using Catmull-Rom spline
// Lower tension (0.15) prevents overshoot where curves show peaks on zero-activity days
// yMax clamps control points so curve can't go above the chart floor (visual bottom)
function buildSmoothPath(
  points: { x: number; y: number }[],
  tension: number = 0.15,
  yMax?: number,
): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  }

  // Find the highest y value (bottom of chart) for clamping
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

    // Clamp control points to not go below chart floor (higher y = lower visual position)
    cp1y = Math.min(cp1y, chartBottom);
    cp2y = Math.min(cp2y, chartBottom);

    path += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }

  return path;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatMonthYear(isoDate: string): string {
  const date = new Date(isoDate + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function generateMonthLabels(
  data: { date: string }[],
  padding: { left: number; right: number },
  innerWidth: number,
): { month: string; x: number }[] {
  if (data.length === 0) return [];

  const months = [
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

  // Group data points by month
  const monthIndices: { month: string; indices: number[] }[] = [];
  let currentMonth = "";

  data.forEach((d, index) => {
    const date = new Date(d.date);
    const monthName = months[date.getMonth()];

    if (monthName !== currentMonth) {
      monthIndices.push({ month: monthName, indices: [index] });
      currentMonth = monthName;
    } else {
      monthIndices[monthIndices.length - 1].indices.push(index);
    }
  });

  // Calculate x position for each month (center of its data points)
  return monthIndices.map((m) => {
    const avgIndex =
      m.indices.reduce((sum, i) => sum + i, 0) / m.indices.length;
    const x =
      padding.left + (avgIndex / Math.max(1, data.length - 1)) * innerWidth;
    return { month: m.month, x };
  });
}

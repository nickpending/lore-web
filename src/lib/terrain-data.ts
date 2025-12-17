// Terrain data types and aggregation for 3D activity visualization
// 52×7 grid representing weeks × days of activity

import type { Commit, PersonalItem, Task } from "./types";

// Single cell in the terrain grid
export interface TerrainCell {
  week: number; // 1-52 (ISO week number)
  day: number; // 0-6 (Sunday-Saturday)
  value: number; // 0-1 normalized activity level
  count: number; // raw activity count
  date: string; // ISO date string for tooltip
  commits: number;
  tasks: number;
  personal: number;
}

// 52×7 grid of terrain cells (weeks × days)
export type TerrainGrid = TerrainCell[][];

// Get ISO week number (1-52) from a date
function getISOWeek(date: Date): number {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  // Set to nearest Thursday (ISO week starts Monday, week 1 contains Jan 4)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return Math.min(weekNum, 52); // Clamp to 52
}

// Get the Monday of a given ISO week in a year
function getDateFromWeekDay(
  year: number,
  week: number,
  dayOfWeek: number,
): Date {
  // Jan 4 is always in week 1
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7; // Convert Sunday (0) to 7
  // Find Monday of week 1
  const week1Monday = new Date(jan4);
  week1Monday.setDate(jan4.getDate() - jan4Day + 1);
  // Calculate target date
  const targetDate = new Date(week1Monday);
  targetDate.setDate(week1Monday.getDate() + (week - 1) * 7 + dayOfWeek);
  return targetDate;
}

// Build 52×7 heightmap grid from activity data
export function buildTerrainHeightmap(
  commits: Commit[],
  tasks: Task[],
  personal: PersonalItem[],
): TerrainGrid {
  // Use current year for grid
  const currentYear = new Date().getFullYear();

  // Track counts per type
  interface CellCounts {
    commits: number;
    tasks: number;
    personal: number;
  }
  const cellCounts = new Map<string, CellCounts>();

  // Helper to get key from date
  const getKey = (dateStr: string): string | null => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    if (date.getFullYear() !== currentYear) return null;
    const week = getISOWeek(date);
    const day = date.getDay();
    return `${week}-${day}`;
  };

  // Helper to ensure cell exists
  const ensureCell = (key: string): CellCounts => {
    if (!cellCounts.has(key)) {
      cellCounts.set(key, { commits: 0, tasks: 0, personal: 0 });
    }
    return cellCounts.get(key)!;
  };

  // Aggregate from all sources
  commits.forEach((c) => {
    const key = getKey(c.date);
    if (key) ensureCell(key).commits++;
  });
  tasks.forEach((t) => {
    const key = getKey(t.captured);
    if (key) ensureCell(key).tasks++;
  });
  personal.forEach((p) => {
    const key = getKey(p.date);
    if (key) ensureCell(key).personal++;
  });

  // Find max for normalization
  let maxCount = 1;
  cellCounts.forEach((c) => {
    const total = c.commits + c.tasks + c.personal;
    if (total > maxCount) maxCount = total;
  });

  // Build 52×7 grid
  const grid: TerrainGrid = [];

  for (let week = 1; week <= 52; week++) {
    const weekRow: TerrainCell[] = [];

    for (let day = 0; day < 7; day++) {
      const key = `${week}-${day}`;
      const counts = cellCounts.get(key) ?? {
        commits: 0,
        tasks: 0,
        personal: 0,
      };
      const total = counts.commits + counts.tasks + counts.personal;
      const cellDate = getDateFromWeekDay(currentYear, week, day);

      weekRow.push({
        week,
        day,
        value: total / maxCount,
        count: total,
        date: cellDate.toISOString().split("T")[0],
        commits: counts.commits,
        tasks: counts.tasks,
        personal: counts.personal,
      });
    }

    grid.push(weekRow);
  }

  return grid;
}

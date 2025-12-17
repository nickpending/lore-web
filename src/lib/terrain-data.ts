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

  // Count activities per week/day
  const activityCounts = new Map<string, number>();

  // Helper to increment count for a date
  const addActivity = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;
    if (date.getFullYear() !== currentYear) return;

    const week = getISOWeek(date);
    const day = date.getDay(); // 0=Sunday, 6=Saturday
    const key = `${week}-${day}`;
    activityCounts.set(key, (activityCounts.get(key) ?? 0) + 1);
  };

  // Aggregate from all sources
  commits.forEach((c) => addActivity(c.date));
  tasks.forEach((t) => addActivity(t.captured));
  personal.forEach((p) => addActivity(p.date));

  // Find max for normalization
  const maxCount = Math.max(1, ...Array.from(activityCounts.values()));

  // Build 52×7 grid
  const grid: TerrainGrid = [];

  for (let week = 1; week <= 52; week++) {
    const weekRow: TerrainCell[] = [];

    for (let day = 0; day < 7; day++) {
      const key = `${week}-${day}`;
      const count = activityCounts.get(key) ?? 0;
      const cellDate = getDateFromWeekDay(currentYear, week, day);

      weekRow.push({
        week,
        day,
        value: count / maxCount,
        count,
        date: cellDate.toISOString().split("T")[0],
      });
    }

    grid.push(weekRow);
  }

  return grid;
}

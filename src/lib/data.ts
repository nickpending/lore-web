// Aggregated data export for Astro pages
// Single import point for all lore data

import { getAllCounts } from "./db";
import {
  getBlogs,
  getCaptures,
  getCommits,
  getExplorations,
  getPersonalItems,
  getProjects,
  getTasks,
} from "./lore";
import { buildTerrainHeightmap, type TerrainGrid } from "./terrain-data";
import type {
  Blog,
  Capture,
  Commit,
  Exploration,
  LoreCounts,
  PersonalItem,
  Project,
  Task,
} from "./types";

// Load all data at module initialization (build time)
export const projects: Project[] = getProjects();
export const commits: Commit[] = getCommits();
export const personal: PersonalItem[] = getPersonalItems();
export const tasks: Task[] = getTasks();
export const explorations: Exploration[] = getExplorations();
export const blogs: Blog[] = getBlogs();
export const captures: Capture[] = getCaptures();

// Counts for dashboard
const rawCounts = getAllCounts();
export const counts: LoreCounts = {
  projects: rawCounts.development ?? 0,
  commits: rawCounts.commits ?? 0,
  personal: rawCounts.personal ?? 0,
  tasks: rawCounts.tasks ?? 0,
  explorations: rawCounts.explorations ?? 0,
  blogs: rawCounts.blogs ?? 0,
  captures: rawCounts.captures ?? 0,
};

// Total entries across all sources
export const totalEntries =
  counts.projects +
  counts.commits +
  counts.personal +
  counts.tasks +
  counts.explorations +
  counts.blogs +
  counts.captures;

// Terrain grid for 3D visualization
export const terrainGrid: TerrainGrid = buildTerrainHeightmap(
  commits,
  tasks,
  personal,
);

// --- Activity Data for Dashboard Cards ---

export interface ActivityData {
  label: string;
  data: number[]; // Weekly counts
  weekDates: string[]; // ISO date strings for each week start
  total: number;
}

// Helper: build month keys for last N months
function buildMonthKeys(monthsBack: number = 12): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return keys;
}

// Helper: aggregate items with date field into monthly counts
function aggregateByMonth(
  items: { date: string }[],
  monthKeys: string[],
): number[] {
  const monthMap = new Map<string, number>();
  monthKeys.forEach((k) => monthMap.set(k, 0));

  items.forEach((item) => {
    const d = new Date(item.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthMap.has(key)) {
      monthMap.set(key, monthMap.get(key)! + 1);
    }
  });

  return monthKeys.map((k) => monthMap.get(k) || 0);
}

// Helper: build week keys for last N weeks (YYYY-WW format)
// Returns both keys and ISO date strings for week starts
function buildWeekKeys(weeksBack: number = 12): {
  keys: string[];
  dates: string[];
} {
  const keys: string[] = [];
  const dates: string[] = [];
  const now = new Date();

  for (let i = weeksBack - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const year = d.getFullYear();
    const week = getWeekNumber(d);
    keys.push(`${year}-W${String(week).padStart(2, "0")}`);
    dates.push(d.toISOString().split("T")[0]);
  }
  return { keys, dates };
}

// Helper: get ISO week number
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Helper: aggregate items with date field into weekly counts
function aggregateByWeek(
  items: { date: string }[],
  weekKeys: string[],
): number[] {
  const weekMap = new Map<string, number>();
  weekKeys.forEach((k) => weekMap.set(k, 0));

  items.forEach((item) => {
    const d = new Date(item.date);
    const year = d.getFullYear();
    const week = getWeekNumber(d);
    const key = `${year}-W${String(week).padStart(2, "0")}`;
    if (weekMap.has(key)) {
      weekMap.set(key, weekMap.get(key)! + 1);
    }
  });

  return weekKeys.map((k) => weekMap.get(k) || 0);
}

export interface ProjectActivity {
  projectName: string;
  data: number[]; // Weekly commit counts
  weekDates: string[]; // ISO date strings for each week
  totalCommits: number;
}

/**
 * Aggregates commit activity per project over the last N weeks.
 * Returns top N projects sorted by total commits.
 */
export function getProjectActivityData(
  topN: number = 4,
  weeks: number = 12,
): ProjectActivity[] {
  const { keys: weekKeys, dates: weekDates } = buildWeekKeys(weeks);

  // Group commits by project, then by week
  const projectMap = new Map<string, Map<string, number>>();

  commits.forEach((commit) => {
    const project = commit.project;
    if (!project) return;

    const commitDate = new Date(commit.date);
    const year = commitDate.getFullYear();
    const week = getWeekNumber(commitDate);
    const weekKey = `${year}-W${String(week).padStart(2, "0")}`;

    // Only include commits within our window
    if (!weekKeys.includes(weekKey)) return;

    if (!projectMap.has(project)) {
      projectMap.set(project, new Map());
    }
    const weekMap = projectMap.get(project)!;
    weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + 1);
  });

  // Convert to ProjectActivity array
  const activities: ProjectActivity[] = [];

  projectMap.forEach((weekMap, projectName) => {
    const data = weekKeys.map((key) => weekMap.get(key) || 0);
    const totalCommits = data.reduce((sum, n) => sum + n, 0);

    activities.push({
      projectName,
      data,
      weekDates,
      totalCommits,
    });
  });

  // Sort by total commits descending, take top N
  return activities
    .sort((a, b) => b.totalCommits - a.totalCommits)
    .slice(0, topN);
}

/**
 * Aggregates captures over the last N weeks.
 */
export function getCapturesActivityData(weeks: number = 12): ActivityData {
  const { keys: weekKeys, dates: weekDates } = buildWeekKeys(weeks);
  const data = aggregateByWeek(captures, weekKeys);
  const total = data.reduce((sum, n) => sum + n, 0);

  return {
    label: "Captures",
    data,
    weekDates,
    total,
  };
}

/**
 * Aggregates tasks over the last N weeks.
 * Uses 'captured' field as the date.
 */
export function getTasksActivityData(weeks: number = 12): ActivityData {
  const { keys: weekKeys, dates: weekDates } = buildWeekKeys(weeks);
  // Tasks use 'captured' field, not 'date'
  const tasksWithDate = tasks.map((t) => ({ date: t.captured }));
  const data = aggregateByWeek(tasksWithDate, weekKeys);
  const total = data.reduce((sum, n) => sum + n, 0);

  return {
    label: "Tasks",
    data,
    weekDates,
    total,
  };
}

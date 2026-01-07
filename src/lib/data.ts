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

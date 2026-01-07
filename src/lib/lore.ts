// Domain-specific query functions for lore.db
// Wraps db.ts queries and parses metadata JSON

import { queryBySource } from "./db";
import type {
  Blog,
  BlogMetadata,
  Capture,
  CaptureMetadata,
  Commit,
  CommitMetadata,
  Exploration,
  ExplorationMetadata,
  LoreEntry,
  PersonalItem,
  Project,
  ProjectMetadata,
  Task,
  TaskMetadata,
} from "./types";

// Parse metadata JSON safely
function parseMetadata<T>(entry: LoreEntry): T | null {
  try {
    return JSON.parse(entry.metadata) as T;
  } catch {
    console.warn(`Failed to parse metadata for: ${entry.title}`);
    return null;
  }
}

// --- Projects ---
export function getProjects(): Project[] {
  const entries = queryBySource("development");
  return entries
    .map((entry) => {
      const meta = parseMetadata<ProjectMetadata>(entry);
      if (!meta) return null;
      return {
        ...meta,
        title: entry.title,
        content: entry.content,
      };
    })
    .filter((p): p is Project => p !== null);
}

// --- Commits ---
export function getCommits(): Commit[] {
  const entries = queryBySource("commits");
  return entries
    .map((entry) => {
      const meta = parseMetadata<CommitMetadata>(entry);
      if (!meta) return null;
      return {
        ...meta,
        title: entry.title,
        content: entry.content,
      };
    })
    .filter((c): c is Commit => c !== null);
}

// --- Personal Items ---
export function getPersonalItems(): PersonalItem[] {
  const entries = queryBySource("personal");
  return entries
    .map((entry) => {
      const meta = parseMetadata<PersonalItem>(entry);
      return meta;
    })
    .filter((p): p is PersonalItem => p !== null);
}

// --- Tasks ---
export function getTasks(): Task[] {
  const entries = queryBySource("tasks");
  return entries
    .map((entry) => {
      const meta = parseMetadata<TaskMetadata>(entry);
      if (!meta) return null;
      return {
        ...meta,
        title: entry.title,
        content: entry.content,
      };
    })
    .filter((t): t is Task => t !== null);
}

// --- Explorations ---
export function getExplorations(): Exploration[] {
  const entries = queryBySource("explorations");
  return entries
    .map((entry) => {
      const meta = parseMetadata<ExplorationMetadata>(entry);
      if (!meta) return null;
      return {
        ...meta,
        title: entry.title,
        content: entry.content,
      };
    })
    .filter((e): e is Exploration => e !== null);
}

// --- Blogs ---
export function getBlogs(): Blog[] {
  const entries = queryBySource("blogs");
  return entries
    .map((entry) => {
      const meta = parseMetadata<BlogMetadata>(entry);
      if (!meta) return null;
      return {
        ...meta,
        title: entry.title,
        content: entry.content,
      };
    })
    .filter((b): b is Blog => b !== null);
}

// --- Captures ---
export function getCaptures(): Capture[] {
  const entries = queryBySource("captures");
  return entries
    .map((entry) => {
      const meta = parseMetadata<CaptureMetadata>(entry);
      if (!meta) return null;
      return {
        ...meta,
        title: entry.title,
        content: entry.content,
      };
    })
    .filter((c): c is Capture => c !== null);
}

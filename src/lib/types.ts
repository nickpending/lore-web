// Types for lore.db FTS5 schema
// Database: ~/.local/share/lore/lore.db

// Base row from FTS5 search table
export interface LoreEntry {
  source: string;
  title: string;
  content: string;
  metadata: string; // JSON blob, parse per source type
}

// Source types available in lore.db
export type LoreSource =
  | "development"
  | "commits"
  | "personal"
  | "tasks"
  | "explorations"
  | "blogs"
  | "obsidian"
  | "sessions"
  | "captures"
  | "readmes"
  | "events";

// --- Development Projects ---
export interface ProjectMetadata {
  project: string;
  description: string;
  date: string;
  tech: string[];
  path: string;
}

export interface Project extends ProjectMetadata {
  title: string; // from LoreEntry.title
  content: string; // from LoreEntry.content (searchable text)
}

// --- Commits ---
export interface CommitAuthor {
  name: string;
  email: string;
}

export interface CommitStats {
  files_changed: number;
  insertions: number;
  deletions: number;
}

export interface CommitMetadata {
  sha: string;
  date: string; // ISO 8601
  project: string;
  author: CommitAuthor;
  stats: CommitStats;
}

export interface Commit extends CommitMetadata {
  title: string; // from LoreEntry.title (commit message summary)
  content: string; // from LoreEntry.content (full message)
}

// --- Personal Items ---
export type PersonalType = "interest" | "book" | "movie" | "podcast" | "habit";

interface PersonalBase {
  type: PersonalType;
  date: string;
}

export interface Interest extends PersonalBase {
  type: "interest";
  name: string;
}

export interface Book extends PersonalBase {
  type: "book";
  title: string;
  author: string;
  isbn?: string;
  rating: number;
  date_read?: string;
  shelf?: string;
}

export interface Movie extends PersonalBase {
  type: "movie";
  title: string;
  year: number;
  rating: number;
  watched_date?: string;
}

export interface Podcast extends PersonalBase {
  type: "podcast";
  title: string;
  url: string;
  description?: string;
  categories?: string[];
}

export interface Habit extends PersonalBase {
  type: "habit";
  habit: string;
  frequency?: string;
}

export type PersonalItem = Interest | Book | Movie | Podcast | Habit;

// --- Tasks ---
export type TaskType = "idea" | "todo" | "task" | "bug" | "feature";
export type TaskStatus = "later" | "active" | "done" | "archived";

export interface TaskMetadata {
  type: TaskType;
  id: string;
  date: string;
  captured: string;
  status: TaskStatus;
  project: string | null;
}

export interface Task extends TaskMetadata {
  title: string; // from LoreEntry.title (task description)
  content: string; // from LoreEntry.content
}

// --- Explorations ---
export type ExplorationStatus = "active" | "complete" | "archived";

export interface ExplorationMetadata {
  date: string;
  status: ExplorationStatus;
  purpose: string;
  project: string;
  path: string;
}

export interface Exploration extends ExplorationMetadata {
  title: string; // from LoreEntry.title
  content: string; // from LoreEntry.content
}

// --- Blogs ---
export type BlogStatus = "published" | "draft";

export interface BlogMetadata {
  date: string;
  topics: string[];
  word_count: number;
  url: string;
  path: string;
  status: BlogStatus;
}

export interface Blog extends BlogMetadata {
  title: string; // from LoreEntry.title
  content: string; // from LoreEntry.content (preview)
}

// --- Aggregated counts for dashboard ---
export interface LoreCounts {
  projects: number;
  commits: number;
  personal: number;
  tasks: number;
  explorations: number;
  blogs: number;
}

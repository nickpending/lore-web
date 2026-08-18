---
type: project
domain: technical
status: active
started: 2025-12-03
---
# lore-web - Core Idea

## The Problem

**What specific problem does this solve?**

Lore captures everything - projects, commits, tasks, personal data, events - but there's no visual way to see the knowledge fabric. CLI search (`lore-search`) works but isn't inspiring. You can't *see* patterns, browse your data, or get an overview of what you know.

**Who has this problem?**

You (Rudy). Personal knowledge system user who wants to visualize and explore the data Lore captures, not just query it via command line.

**How do they solve it today?**

`lore-search <domain> <query>` via terminal. Works for targeted lookups, but no browsing, no visual overview, no way to discover connections or patterns.

## The Solution

**Core Value Proposition**

Visual dashboard for your Lore knowledge fabric. Browse projects, personal data, commits, and tasks. Search everything instantly. See your knowledge, don't just query it.

**Key Differentiators**

- Consumes existing Lore JSONL indices - no new data infrastructure
- Static site (Astro) - rebuild when data changes, instant client-side interaction
- Client-side search with Fuse.js - all data loaded, zero latency
- Cyberpunk aesthetic matching Argus

## System Flow (Initial Sketch)

1. Lore indices exist at `~/.cache/lore/indices/*.jsonl`
2. At build time, Astro reads all JSONL files
3. Data transformed to JSON, embedded in static site
4. Client loads all data (~235KB, ~50KB gzipped)
5. Fuse.js indexes data for instant search
6. User browses views and searches interactively

## User Experience Vision

**Primary User Journey**

1. Run `lore-index-all` to update indices
2. Run `astro build` (or dev server)
3. Open dashboard, browse/search knowledge

**Core User Workflows**

- Browse projects grid - see all development projects at a glance
- Search across everything - find commits, tasks, personal data by keyword
- View personal data - books, movies, interests, people
- Explore commits - recent activity timeline

**Success Criteria**

- Can find anything Lore knows in <2 seconds
- Visual overview replaces "what projects do I have again?"
- Actually enjoyable to use (not just functional)

## MVP Definition

**What is the absolute minimum viable version?**

Static Astro site with dashboard showing projects, personal data, and global search. Read-only visualization of existing Lore indices.

**MVP Scope**

- Dashboard home with summary stats
- Projects view (from development.jsonl)
- Personal view (from personal.jsonl - interests, books, movies)
- Global search with Fuse.js
- Cyberpunk dark theme

**MVP Constraints**

- Build-time data only (no live server)
- Hardcoded index paths (`~/.cache/lore/indices/`)
- No graph visualization (later)
- No Daemon export (later)

**Post-MVP Evolution**

- Commits timeline view
- Tasks/flux view
- Graph visualization (lore-graph data)
- Daemon.md export (select items for public projection)

## Features Status

**Status Legend:**

- 📋 **Planned** - Feature defined and ready for iteration planning
- 🔄 **In Progress** - Feature currently being developed
- ✅ **Built** - Feature completed and shipped

**Current Features:**

- ✅ Dashboard home with stats summary (iteration-1)
- ✅ Projects grid view (iteration-1)
- ✅ Personal data view (interests, books, movies) (iteration-1)
- 📋 Global search (deferred - lore-search integration)
- ✅ Commits timeline view (iteration-1)
- ✅ Tasks view (iteration-1)
- ✅ Cyberpunk theme (voidwire-design) (iteration-1)
- ✅ 2D activity chart hero with glow effects (iteration-2)
- ✅ Sparkline trends and stat cards overlay (iteration-2)
- ✅ Sidebar navigation with responsive layout (iteration-2)
- ✅ Recent activity list from 7 sources (iteration-2)
- ✅ Project activity cards with mini charts (iteration-2)
- ✅ Click-through navigation on dashboard (2026-02-02)
- 🔄 Knowledge view (insights + teachings + captures) (iteration-3)
- 🔄 Sessions view with heatmap (iteration-3)
- 🔄 Subpage redesigns (commits, tasks, projects, personal) (iteration-3)
- 📋 Project detail pages (deferred)
- 📋 Global search (deferred)

## Technical Approach

**Architecture Decision**

- [x] **Single Tool/Application** - Standalone Astro static site

**Why this approach?**

Separate project from Lore because:
- Different tech stack (Astro/React vs bash/TypeScript CLI)
- Different deployment model (static site vs CLI tools)
- Frontend is a consumer of Lore data, not part of core Lore

**Dependencies & Prerequisites**

- Lore installed and indices populated
- Bun (Astro runtime)
- No external APIs

**Data Requirements**

- Read `~/.cache/lore/indices/development.jsonl`
- Read `~/.cache/lore/indices/personal.jsonl`
- Read `~/.cache/lore/indices/commits.jsonl`
- Read `~/.cache/lore/indices/tasks.jsonl`
- Read `~/.cache/lore/indices/blogs.jsonl`

## Technical Architecture (Tentative)

**Data Design (Draft)**

```typescript
// Build-time: read JSONL, transform to JSON
interface LoreData {
  projects: Project[];
  personal: PersonalItem[];
  commits: Commit[];
  tasks: Task[];
  blogs: BlogPost[];
}

// Runtime: loaded into Fuse.js for search
const fuse = new Fuse(allItems, {
  keys: ['name', 'desc', 'content', 'title'],
  threshold: 0.3
});
```

**Component Architecture (Working Model)**

```
src/
├── lib/
│   └── lore.ts           # Read JSONL at build time
├── components/
│   ├── Dashboard.tsx     # Home view with stats
│   ├── ProjectsGrid.tsx  # Projects view
│   ├── PersonalView.tsx  # Books, movies, interests
│   ├── SearchBar.tsx     # Global Fuse.js search
│   └── CommitsTimeline.tsx
├── layouts/
│   └── Layout.astro      # Base layout with nav
└── pages/
    ├── index.astro       # Dashboard
    ├── projects.astro
    ├── personal.astro
    └── search.astro
```

**Tool/Technology Stack (Current Thinking)**

- Astro 5.x (static site generator)
- React 19 (UI components as islands)
- Tailwind CSS 4 (styling)
- Framer Motion (animations)
- Fuse.js (client-side fuzzy search)
- Lucide React (icons)

## Open Questions

**Technical Questions**

- Should search results link to detail views or inline expand?
- How to handle rebuild workflow (watch mode? manual trigger?)

**Future Questions**

- When to add Daemon export functionality?
- Graph visualization - worth the complexity?

## Success Metrics

**Primary Metrics**

- Use the dashboard instead of terminal for browsing
- Find things faster than `lore-search`
- Actually know what's in your knowledge fabric

## Risks and Assumptions

**Key Assumptions**

- ~235KB of data is acceptable to load client-side (validated: trivial)
- Build-time data is fresh enough (rebuild when indices update)
- Fuse.js handles the search well enough

**Primary Risks**

- Scope creep into "full knowledge management app"
- Over-engineering views nobody uses

**Mitigation Strategies**

- MVP first: dashboard, projects, personal, search
- Add views only when actually needed

## References

**Lore Data Schemas:**
- `~/obsidian/projects/lore/explorations/EXPLORATION-2025-10-28-personal-data-capture.md` - Personal data types (profile, interests, people, books, movies, podcasts, habits, preferences)
- `~/development/projects/lore/LORE.md` - Usage guide for lore-search, lore-capture, indexers

**Related Projects:**
- Daemon (`/tmp/Daemon`) - Public-facing personal API (potential future integration)
- Argus (`~/development/projects/argus`) - Observability platform (UI aesthetic reference)

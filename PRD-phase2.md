# Mission Control Phase 2 — Projects View

**Author:** Otto  
**Date:** 2026-02-06  
**Status:** Ready for GSD  

---

## Overview

Build out the Projects view for Mission Control. Currently a "Coming Soon" stub that needs to become a functional project management interface.

## Current State

- `ProjectsPage.tsx` is a placeholder stub
- Schema already has foundational support (tasks have optional projectId concept)
- Activity feed and Tasks kanban are working

## Requirements

### 1. Schema Updates

Add a `projects` table to the Convex schema:

```typescript
projects: defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  status: v.union(
    v.literal("active"),
    v.literal("paused"),
    v.literal("complete"),
    v.literal("archived")
  ),
  color: v.optional(v.string()), // hex color for visual distinction
  tenantId: v.optional(v.string()),
})
  .index("by_tenant", ["tenantId"])
  .index("by_status", ["status"]),
```

Update `tasks` table to add:
```typescript
projectId: v.optional(v.id("projects")),
```

### 2. Convex Functions

Create `convex/projects.ts` with:
- `create` — mutation to create a project
- `update` — mutation to update project (name, description, status, color)
- `archive` — mutation to archive (soft delete)
- `list` — query to list all projects for tenant
- `getWithTasks` — query to get project with its linked tasks

Update `convex/tasks.ts`:
- Add `projectId` to create/update mutations
- Add query to list tasks by projectId

### 3. Projects Page UI

Replace the stub with a functional page:

**Layout:**
- Header with "Projects" title + "New Project" button
- Grid/list of project cards

**Project Card:**
- Project name (with color indicator)
- Status badge (active/paused/complete)
- Task count (total / done)
- Last activity timestamp
- Click to expand or navigate to filtered tasks view

**New Project Modal:**
- Name (required)
- Description (optional)
- Color picker (optional, default to a random pleasant color)
- Status dropdown (default: active)

**Project Actions:**
- Edit (inline or modal)
- Archive
- View tasks (filters kanban to this project)

### 4. Task Integration

**On Tasks Page:**
- Add project filter dropdown in header
- Show project badge on task cards
- When creating task, allow selecting a project

**On Task Detail Panel:**
- Show/edit project assignment
- Quick link to project

### 5. Navigation

- Projects should be accessible from the sidebar/header nav
- Clicking a project should filter the Tasks view to that project

## Tech Stack

- React + TypeScript
- Convex for backend
- Tailwind CSS (already in use)
- shadcn/ui components (already in use)

## Out of Scope

- Project templates
- Project-level permissions
- Gantt charts / timeline views
- Bulk operations

## Success Criteria

- Can create, edit, and archive projects
- Can assign tasks to projects
- Can filter tasks by project
- Projects show accurate task counts
- Real-time updates (Convex reactivity)

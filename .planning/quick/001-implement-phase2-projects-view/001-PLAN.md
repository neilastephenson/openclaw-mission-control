---
phase: quick
plan: 001
type: execute
wave: 1
depends_on: []
files_modified:
  - convex/schema.ts
  - convex/projects.ts
  - convex/tasks.ts
  - convex/queries.ts
  - src/pages/ProjectsPage.tsx
  - src/components/ProjectCard.tsx
  - src/components/ProjectModal.tsx
  - src/components/AddTaskModal.tsx
  - src/components/MissionQueue.tsx
  - src/components/TaskCard.tsx
  - src/components/TaskDetailPanel.tsx
autonomous: true

must_haves:
  truths:
    - "User can view a grid of project cards on /projects page"
    - "User can create a new project with name, description, color, and status"
    - "User can edit and archive existing projects"
    - "User can assign tasks to projects when creating or editing tasks"
    - "User can filter the Tasks kanban by project"
    - "Project cards show accurate task counts and status badges"
  artifacts:
    - path: "convex/schema.ts"
      provides: "projects table definition and projectId on tasks"
      contains: "projects: defineTable"
    - path: "convex/projects.ts"
      provides: "CRUD mutations and queries for projects"
      exports: ["create", "update", "archive", "list", "getWithTasks"]
    - path: "src/pages/ProjectsPage.tsx"
      provides: "Functional projects page replacing stub"
      min_lines: 80
    - path: "src/components/ProjectModal.tsx"
      provides: "Create/edit project modal"
      min_lines: 60
  key_links:
    - from: "src/pages/ProjectsPage.tsx"
      to: "convex/projects.ts"
      via: "useQuery(api.projects.list) and useMutation(api.projects.create)"
      pattern: "api\\.projects\\."
    - from: "src/components/AddTaskModal.tsx"
      to: "convex/projects.ts"
      via: "useQuery(api.projects.list) for project selector"
      pattern: "api\\.projects\\.list"
    - from: "src/components/MissionQueue.tsx"
      to: "convex/projects.ts"
      via: "useQuery(api.projects.list) for project filter dropdown"
      pattern: "api\\.projects\\.list"
---

<objective>
Implement the Phase 2 Projects feature end-to-end: schema, Convex backend functions, Projects page UI, and task-project integration across the existing Tasks views.

Purpose: Replace the "Coming Soon" Projects stub with a fully functional project management interface that integrates with the existing task kanban.
Output: Working projects CRUD, project cards grid, task-project linking, and project filtering on the tasks kanban.
</objective>

<execution_context>
@/Users/otto/.claude/get-shit-done/workflows/execute-plan.md
@/Users/otto/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@PRD-phase2.md
@convex/schema.ts
@convex/tasks.ts
@convex/queries.ts
@convex/messages.ts
@src/pages/ProjectsPage.tsx
@src/pages/TasksPage.tsx
@src/components/AddTaskModal.tsx
@src/components/MissionQueue.tsx
@src/components/TaskCard.tsx
@src/components/TaskDetailPanel.tsx
@src/components/layout/TabNavigation.tsx
@src/lib/tenant.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Schema + Convex backend (projects table, CRUD functions, task integration)</name>
  <files>
    convex/schema.ts
    convex/projects.ts
    convex/tasks.ts
    convex/queries.ts
  </files>
  <action>
**1. Update `convex/schema.ts`:**

Add `projects` table BEFORE the `tasks` table definition (since tasks will reference it):

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
  color: v.optional(v.string()),
  tenantId: v.optional(v.string()),
})
  .index("by_tenant", ["tenantId"])
  .index("by_status", ["status"]),
```

Add `projectId: v.optional(v.id("projects"))` to the `tasks` table field list. Also add an index: `.index("by_project", ["projectId"])` to the tasks table.

**2. Create `convex/projects.ts`:**

Follow the exact patterns from `convex/tasks.ts` and `convex/messages.ts`:
- Import `v` from "convex/values", `mutation` and `query` from "./_generated/server"
- Copy the `requireTenant` helper function (same pattern as in tasks.ts)
- IMPORTANT: This codebase uses `ctx.db.get("tableName", id)` with TWO arguments (table name string + id). Match this exact pattern.

Implement these exports:

- `create` mutation: args = `{ name: v.string(), description: v.optional(v.string()), status: v.string(), color: v.optional(v.string()), tenantId: v.string() }`. Insert into "projects" table, casting status as any (same pattern as createTask). Return the projectId.

- `update` mutation: args = `{ projectId: v.id("projects"), tenantId: v.string(), name: v.optional(v.string()), description: v.optional(v.string()), status: v.optional(v.string()), color: v.optional(v.string()) }`. Use `requireTenant` to validate, then `ctx.db.patch` with only defined fields (follow the updateTask pattern of building a fields object).

- `archive` mutation: args = `{ projectId: v.id("projects"), tenantId: v.string() }`. Use `requireTenant` to validate, then patch status to "archived".

- `list` query: args = `{ tenantId: v.string() }`. Query "projects" with index "by_tenant", collect all. For each project, count tasks by querying the "tasks" table filtered by projectId (use `.filter()` since we added the by_project index). Return projects enriched with `taskCount` (total non-archived) and `doneCount`.

- `getWithTasks` query: args = `{ projectId: v.id("projects"), tenantId: v.string() }`. Get project by id, validate tenant, then query tasks filtered to this projectId. Return `{ ...project, tasks }`.

**3. Update `convex/tasks.ts`:**

- In `createTask` mutation: Add `projectId: v.optional(v.id("projects"))` to args. Pass `projectId: args.projectId` in the insert call.

- In `updateTask` mutation: Add `projectId: v.optional(v.id("projects"))` to args. Add to the fields-building block: `if (args.projectId !== undefined) { fields.projectId = args.projectId; updates.push("project"); }`.

**4. Update `convex/queries.ts`:**

In `listTasks` query: The enriched task objects already spread all task fields, so `projectId` will automatically be included once the schema is updated. No code changes needed here.

  </action>
  <verify>
Run `npx convex dev` (or check that the Convex dev server syncs successfully). The schema push should succeed with the new projects table and updated tasks table. Verify no TypeScript errors with `npx tsc --noEmit` in the convex directory.
  </verify>
  <done>
- `projects` table exists in schema with by_tenant and by_status indexes
- `tasks` table has optional `projectId` field and by_project index
- `convex/projects.ts` exports create, update, archive, list, getWithTasks
- `createTask` and `updateTask` accept optional projectId
- All functions follow existing tenantId isolation patterns
  </done>
</task>

<task type="auto">
  <name>Task 2: Projects page UI (card grid, create/edit modal, project actions)</name>
  <files>
    src/pages/ProjectsPage.tsx
    src/components/ProjectCard.tsx
    src/components/ProjectModal.tsx
  </files>
  <action>
**1. Create `src/components/ProjectModal.tsx`:**

A modal for creating AND editing projects. Follow the exact modal pattern from `AddTaskModal.tsx`:
- Fixed z-50 overlay with `bg-black/40` backdrop
- White rounded-xl card with border, shadow-2xl, max-w-lg
- Header with title + close button (same "x" pattern)
- Form with sections matching AddTaskModal styling

Props: `{ onClose: () => void; onSaved: () => void; project?: { _id, name, description, status, color, tenantId } }` (if project is provided, it's edit mode).

Form fields:
- **Name** (required): Text input, same styling as AddTaskModal title input. Label style: `text-[11px] font-semibold text-muted-foreground tracking-wide mb-1.5`
- **Description** (optional): Textarea, 3 rows, same styling
- **Status**: Select dropdown with options: Active, Paused, Complete. Default "active". Same select styling as AddTaskModal status.
- **Color**: Reuse the same `COLOR_SWATCHES` array from AddTaskModal: `["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#64748b"]`. Same round button pattern with selected state (border-foreground scale-110).

On submit:
- Create mode: Call `useMutation(api.projects.create)` with `{ name, description, status, color, tenantId: DEFAULT_TENANT_ID }`
- Edit mode: Call `useMutation(api.projects.update)` with `{ projectId: project._id, tenantId: DEFAULT_TENANT_ID, name, description, status, color }`
- Call `onSaved()` after success

Footer: Cancel + "Create Project" / "Save Changes" buttons (same styling as AddTaskModal).

**2. Create `src/components/ProjectCard.tsx`:**

A card component for the projects grid.

Props: `{ project: { _id, name, description, status, color, taskCount, doneCount, _creationTime }, onEdit: () => void, onArchive: () => void, onViewTasks: () => void }`

Layout (follow existing card patterns from TaskCard):
- White bg, rounded-lg, border border-border, p-4, shadow-sm, hover:-translate-y-0.5 hover:shadow-md transition
- Left border with project color: `borderLeft: 4px solid ${project.color || '#64748b'}`
- **Top row:** Project name (text-sm font-semibold) + actions menu (three-dot or inline buttons)
- **Status badge:** Small pill badge. Colors: active = accent-green bg with green text, paused = accent-orange, complete = accent-blue, archived = text-subtle. Use `text-[10px] px-2 py-0.5 rounded font-medium` (same as tag badges).
- **Description:** If exists, show truncated (line-clamp-2, text-xs text-muted-foreground)
- **Bottom row:** Task count `"N/M tasks done"` (text-[11px] text-muted-foreground) + creation date (text-[11px] text-muted-foreground)
- **Actions:** Three icon buttons (edit with IconPencil, archive with IconArchive, view tasks with IconLayoutKanban). Import from @tabler/icons-react. Style: `p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground`. Use `e.stopPropagation()` on each.

Clicking the card itself should call `onViewTasks()`.

**3. Replace `src/pages/ProjectsPage.tsx`:**

Remove the stub entirely. Build a full page:

```
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { IconPlus } from "@tabler/icons-react";
import { DEFAULT_TENANT_ID } from "../lib/tenant";
import TabNavigation from "../components/layout/TabNavigation";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";
```

State: `showModal` (boolean), `editingProject` (project object or null), `showArchived` (boolean).

Query: `useQuery(api.projects.list, { tenantId: DEFAULT_TENANT_ID })`.
Mutation: `useMutation(api.projects.archive)`.

Layout (follow TasksPage pattern - TabNavigation at top, then content):
- `<TabNavigation />` at top
- Content area: `flex-1 overflow-y-auto p-6`
- **Header row:** flex justify-between items-center mb-6.
  - Left: h1 "Projects" (text-2xl font-bold) + subtitle "Organize tasks into project workspaces" (text-sm text-muted-foreground mt-1)
  - Right: "New Project" button (same styling as the submit button in AddTaskModal: `px-4 py-2 text-sm font-semibold text-white bg-[var(--accent-blue)] rounded-lg hover:opacity-90`). Icon: IconPlus size 16 in a flex items-center gap-1.5.

- **Filter row:** Toggle for showing archived projects (same pattern as the archive toggle in MissionQueue).

- **Grid:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`. If projects is undefined, show loading skeleton (animate-pulse with 6 placeholder cards: rounded-lg bg-muted h-40). If projects is empty array, show empty state similar to the old stub but with a CTA button.

- Render `<ProjectCard>` for each project. Filter out archived unless `showArchived` is true.
  - `onEdit`: Set `editingProject` to the project, `showModal` to true
  - `onArchive`: Call archive mutation with `{ projectId: project._id, tenantId: DEFAULT_TENANT_ID }`
  - `onViewTasks`: `navigate("/tasks?project=" + project._id)` using react-router-dom's `useNavigate`

- Render `<ProjectModal>` when `showModal` is true. Pass `editingProject` as the `project` prop if editing. `onClose` resets both states. `onSaved` resets both states.

  </action>
  <verify>
Navigate to /projects in the browser. Verify:
1. Page shows grid layout (not "Coming Soon" stub)
2. "New Project" button opens modal
3. Can create a project with name, color, status
4. Created project appears as a card in the grid
5. Edit button opens modal pre-filled with project data
6. Archive button removes project from default view
7. No TypeScript errors: `npx tsc --noEmit`
  </verify>
  <done>
- ProjectsPage shows a responsive grid of project cards
- ProjectModal allows creating and editing projects with name, description, color, status
- ProjectCard shows name, color indicator, status badge, task counts, description preview
- Archive action works, archived projects hidden by default with toggle to show
- Clicking a project card navigates to tasks filtered by that project
  </done>
</task>

<task type="auto">
  <name>Task 3: Task-project integration (filter dropdown, badges, assignment)</name>
  <files>
    src/components/MissionQueue.tsx
    src/components/TaskCard.tsx
    src/components/TaskDetailPanel.tsx
    src/components/AddTaskModal.tsx
  </files>
  <action>
**1. Update `src/components/AddTaskModal.tsx`:**

- Add import: `import { api } from "../../convex/_generated/api";` (already imported, but add projects query)
- Add query: `const projects = useQuery(api.projects.list, { tenantId: DEFAULT_TENANT_ID });`
- Add state: `const [projectId, setProjectId] = useState("");`
- Add a PROJECT field section between the Status and Tags sections. Same label pattern (text-[11px] font-semibold text-muted-foreground tracking-wide mb-1.5, label text "PROJECT"):
  ```
  <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="...same as status select...">
    <option value="">No Project</option>
    {projects?.filter(p => p.status !== "archived").map((p) => (
      <option key={p._id} value={p._id}>{p.name}</option>
    ))}
  </select>
  ```
- In `handleSubmit`, pass `projectId: projectId ? (projectId as Id<"projects">) : undefined` to `createTask`.
- Add `projectId` to the useCallback dependency array.

**2. Update `src/components/MissionQueue.tsx`:**

- Add query: `const projects = useQuery(api.projects.list, { tenantId: DEFAULT_TENANT_ID });`
- Add state: `const [filterProjectId, setFilterProjectId] = useState<string>("");`
- Read URL search params on mount to support deep-linking from ProjectsPage: Use `useSearchParams` from react-router-dom (or `window.location.search`). If `?project=xxx` is present, set `filterProjectId` to that value on mount via useEffect.
  ```
  import { useSearchParams } from "react-router-dom";
  // inside component:
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const projectParam = searchParams.get("project");
    if (projectParam) setFilterProjectId(projectParam);
  }, [searchParams]);
  ```
- In the header bar (the div with "MISSION QUEUE" label), add a project filter dropdown BEFORE the existing stats buttons:
  ```
  <select
    value={filterProjectId}
    onChange={(e) => {
      setFilterProjectId(e.target.value);
      if (e.target.value) {
        setSearchParams({ project: e.target.value });
      } else {
        setSearchParams({});
      }
    }}
    className="text-[11px] font-semibold px-3 py-1 rounded bg-[#f0f0f0] text-[#999] border-none focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
  >
    <option value="">All Projects</option>
    {projects?.filter(p => p.status !== "archived").map((p) => (
      <option key={p._id} value={p._id}>{p.name}</option>
    ))}
  </select>
  ```
- Filter tasks: Where tasks are used (in the column rendering), filter by projectId if `filterProjectId` is set:
  ```
  const filteredTasks = filterProjectId
    ? tasks.filter(t => (t as any).projectId === filterProjectId)
    : tasks;
  ```
  Use `filteredTasks` instead of `tasks` in the column task counts and the `.filter((t) => t.status === col.id)` chains. Keep the original `tasks` for drag-drop handlers (they still need to find any task by id).

**3. Update `src/components/TaskCard.tsx`:**

- Update the Task interface to add `projectId?: string;`
- Accept an optional new prop: `projectName?: string` and `projectColor?: string`
- In the bottom area (the div with tags), add a project badge BEFORE the tags if projectName exists:
  ```
  {projectName && (
    <span
      className="text-[10px] px-2 py-0.5 rounded font-medium text-white"
      style={{ backgroundColor: projectColor || '#64748b' }}
    >
      {projectName}
    </span>
  )}
  ```

**4. Update `src/components/MissionQueue.tsx` (project names on cards):**

- Build a project lookup map from the projects query:
  ```
  const projectMap = useMemo(() => {
    const map = new Map<string, { name: string; color?: string }>();
    if (projects) {
      projects.forEach(p => map.set(p._id, { name: p.name, color: p.color }));
    }
    return map;
  }, [projects]);
  ```
- When rendering `<TaskCard>`, pass the new props:
  ```
  projectName={projectMap.get((task as any).projectId)?.name}
  projectColor={projectMap.get((task as any).projectId)?.color}
  ```

**5. Update `src/components/TaskDetailPanel.tsx`:**

- Add query: `const projects = useQuery(api.projects.list, { tenantId: DEFAULT_TENANT_ID });`
- Add state: track if editing project assignment
- After the Status section and before Description, add a PROJECT section:
  ```
  <div className="space-y-1">
    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Project</label>
    <select
      value={(task as any).projectId || ""}
      onChange={(e) => {
        if (currentUserAgent) {
          updateTask({
            taskId: task._id,
            projectId: e.target.value ? (e.target.value as Id<"projects">) : undefined,
            agentId: currentUserAgent._id,
            tenantId: DEFAULT_TENANT_ID,
          });
        }
      }}
      disabled={!currentUserAgent}
      className="w-full p-1.5 text-sm border border-border rounded bg-secondary text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] disabled:opacity-50"
    >
      <option value="">No Project</option>
      {projects?.filter(p => p.status !== "archived").map((p) => (
        <option key={p._id} value={p._id}>{p.name}</option>
      ))}
    </select>
  </div>
  ```
- Add `projectId` to the `updateTask` args in `convex/tasks.ts` (already done in Task 1) -- just make sure the UI passes it correctly.

**TypeScript note:** Since `projectId` is added to the schema but the `listTasks` return type infers from Convex, the field will be available on task objects. However, the local `Task` interface in MissionQueue.tsx and TaskCard.tsx needs updating. Add `projectId?: Id<"projects">` (or just `projectId?: string`) to the Task interfaces in both files.

  </action>
  <verify>
1. On /tasks: Project filter dropdown appears in the MissionQueue header
2. Selecting a project filters the kanban to only tasks in that project
3. Navigating from /projects (clicking a card) pre-filters the tasks view
4. Task cards show project badge with color when assigned to a project
5. AddTaskModal has a project dropdown, creating a task with project links it
6. TaskDetailPanel shows project assignment with ability to change it
7. Run `npx tsc --noEmit` -- no TypeScript errors
8. Run the app and verify Convex dev server has no errors
  </verify>
  <done>
- MissionQueue has project filter dropdown that syncs with URL params
- TaskCard shows project badge with color
- AddTaskModal includes project selector
- TaskDetailPanel shows and allows editing project assignment
- Navigating from ProjectsPage to Tasks pre-filters by project
- All existing functionality (drag-drop, archive, play) still works
  </done>
</task>

</tasks>

<verification>
1. Navigate to /projects -- see project cards grid (or empty state with CTA)
2. Create a project with name "Alpha", color blue, status active -- card appears
3. Create two tasks, assign one to "Alpha" project -- task card shows blue "Alpha" badge
4. On /projects, "Alpha" card shows "1/2 tasks done" or similar count
5. Click "Alpha" card -- navigates to /tasks?project=xxx, kanban shows only that task
6. Clear filter -- all tasks visible again
7. Edit project (change name, color) -- changes reflected everywhere
8. Archive project -- disappears from default view, toggle shows it
9. On TaskDetailPanel, change project assignment -- badge updates on card
10. Drag-and-drop still works on kanban
11. `npx tsc --noEmit` passes with zero errors
</verification>

<success_criteria>
- Projects CRUD fully functional (create, edit, archive, list)
- Task-project linking works in both directions (assign from task, view from project)
- Project filter on kanban works with URL deep-linking
- All existing task functionality preserved (drag-drop, status changes, agent play)
- No TypeScript errors, Convex dev server syncs cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/001-implement-phase2-projects-view/001-SUMMARY.md`
</output>

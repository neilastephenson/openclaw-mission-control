import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function requireTenant<T extends { tenantId?: string }>(
	record: T | null,
	tenantId: string,
	entityName: string,
): T {
	if (!record || record.tenantId !== tenantId) {
		throw new Error(`${entityName} not found`);
	}
	return record;
}

export const create = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		status: v.string(),
		color: v.optional(v.string()),
		tenantId: v.string(),
	},
	handler: async (ctx, args) => {
		const projectId = await ctx.db.insert("projects", {
			name: args.name,
			description: args.description,
			status: args.status as any,
			color: args.color,
			tenantId: args.tenantId,
		});
		return projectId;
	},
});

export const update = mutation({
	args: {
		projectId: v.id("projects"),
		tenantId: v.string(),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		status: v.optional(v.string()),
		color: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		requireTenant(
			await ctx.db.get("projects", args.projectId),
			args.tenantId,
			"Project"
		);

		const fields: any = {};

		if (args.name !== undefined) {
			fields.name = args.name;
		}
		if (args.description !== undefined) {
			fields.description = args.description;
		}
		if (args.status !== undefined) {
			fields.status = args.status;
		}
		if (args.color !== undefined) {
			fields.color = args.color;
		}

		await ctx.db.patch(args.projectId, fields);
	},
});

export const archive = mutation({
	args: {
		projectId: v.id("projects"),
		tenantId: v.string(),
	},
	handler: async (ctx, args) => {
		requireTenant(
			await ctx.db.get("projects", args.projectId),
			args.tenantId,
			"Project"
		);

		await ctx.db.patch(args.projectId, { status: "archived" });
	},
});

export const list = query({
	args: {
		tenantId: v.string(),
	},
	handler: async (ctx, args) => {
		const projects = await ctx.db
			.query("projects")
			.withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
			.collect();

		// Query all tenant tasks once and group by projectId for efficiency
		const allTasks = await ctx.db
			.query("tasks")
			.withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
			.collect();

		// Build task counts per project
		const taskCounts = new Map<string, { total: number; done: number }>();
		for (const task of allTasks) {
			if (task.status === "archived") continue;

			const projId = task.projectId || "";
			if (!projId) continue;

			const counts = taskCounts.get(projId) || { total: 0, done: 0 };
			counts.total++;
			if (task.status === "done") {
				counts.done++;
			}
			taskCounts.set(projId, counts);
		}

		// Enrich projects with task counts
		return projects.map((project) => {
			const counts = taskCounts.get(project._id) || { total: 0, done: 0 };
			return {
				...project,
				taskCount: counts.total,
				doneCount: counts.done,
			};
		});
	},
});

export const getWithTasks = query({
	args: {
		projectId: v.id("projects"),
		tenantId: v.string(),
	},
	handler: async (ctx, args) => {
		const project = requireTenant(
			await ctx.db.get("projects", args.projectId),
			args.tenantId,
			"Project"
		);

		const tasks = await ctx.db
			.query("tasks")
			.withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
			.filter((q) => q.eq(q.field("projectId"), args.projectId))
			.collect();

		return {
			...project,
			tasks,
		};
	},
});

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Activity queries for the dashboard feed.
 * These queries read from the webhookEvents table for richer data including usage tracking.
 */

/**
 * List recent webhook events across all agents.
 * Returns the last 100 events ordered by creation time (most recent first).
 */
export const listRecentActivity = query({
	args: {
		tenantId: v.string(),
	},
	handler: async (ctx, args) => {
		const events = await ctx.db
			.query("webhookEvents")
			.withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
			.order("desc")
			.take(100);

		return events;
	},
});

/**
 * List webhook events filtered by agent.
 * Useful for showing agent-specific activity feeds.
 */
export const listActivityByAgent = query({
	args: {
		tenantId: v.string(),
		agentId: v.string(),
	},
	handler: async (ctx, args) => {
		const events = await ctx.db
			.query("webhookEvents")
			.withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
			.filter((q) => q.eq(q.field("tenantId"), args.tenantId))
			.order("desc")
			.take(100);

		return events;
	},
});

/**
 * List webhook events for a specific run.
 * Useful for showing the full lifecycle of a single agent run (start -> progress -> end).
 */
export const listActivityByRun = query({
	args: {
		tenantId: v.string(),
		runId: v.string(),
	},
	handler: async (ctx, args) => {
		const events = await ctx.db
			.query("webhookEvents")
			.withIndex("by_runId", (q) => q.eq("runId", args.runId))
			.filter((q) => q.eq(q.field("tenantId"), args.tenantId))
			.order("asc") // Chronological order for run lifecycle
			.collect();

		return events;
	},
});

import { mutation } from "./_generated/server";

/**
 * Log activity from API calls (simplified - uses agentName string instead of ID)
 */
export const logSimple = mutation({
	args: {
		type: v.string(),
		message: v.string(),
		agentName: v.string(),
		targetId: v.optional(v.id("tasks")),
		tenantId: v.string(),
	},
	handler: async (ctx, args) => {
		// Find or create a placeholder agent
		const agents = await ctx.db
			.query("agents")
			.withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
			.filter((q) => q.eq(q.field("name"), args.agentName))
			.first();

		let agentId = agents?._id;

		// If no agent found, create a placeholder
		if (!agentId) {
			agentId = await ctx.db.insert("agents", {
				name: args.agentName,
				role: "API Agent",
				status: "idle",
				level: "INT",
				avatar: "🤖",
				tenantId: args.tenantId,
			});
		}

		await ctx.db.insert("activities", {
			type: args.type,
			agentId,
			message: args.message,
			targetId: args.targetId,
			tenantId: args.tenantId,
		});

		return { ok: true };
	},
});

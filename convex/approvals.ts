import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all approvals, optionally filtered by status
 */
export const list = query({
	args: {
		tenantId: v.string(),
		status: v.optional(
			v.union(
				v.literal("pending"),
				v.literal("approved"),
				v.literal("denied"),
				v.literal("expired")
			)
		),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit || 50;

		let approvals;
		if (args.status) {
			approvals = await ctx.db
				.query("approvals")
				.withIndex("by_tenant_status", (q) =>
					q.eq("tenantId", args.tenantId).eq("status", args.status!)
				)
				.order("desc")
				.take(limit);
		} else {
			approvals = await ctx.db
				.query("approvals")
				.withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
				.order("desc")
				.take(limit);
		}

		return approvals;
	},
});

/**
 * Get pending approvals count
 */
export const getPendingCount = query({
	args: {
		tenantId: v.string(),
	},
	handler: async (ctx, args) => {
		const pending = await ctx.db
			.query("approvals")
			.withIndex("by_tenant_status", (q) =>
				q.eq("tenantId", args.tenantId).eq("status", "pending")
			)
			.collect();

		return pending.length;
	},
});

/**
 * Create a new approval request
 */
export const create = mutation({
	args: {
		tenantId: v.string(),
		type: v.union(
			v.literal("delete_file"),
			v.literal("external_send"),
			v.literal("spawn_agent"),
			v.literal("modify_config"),
			v.literal("dangerous_command"),
			v.literal("other")
		),
		title: v.string(),
		description: v.string(),
		agentId: v.optional(v.string()),
		agentName: v.optional(v.string()),
		taskId: v.optional(v.id("tasks")),
		metadata: v.optional(v.any()),
		expiresInMs: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const expiresAt = args.expiresInMs
			? Date.now() + args.expiresInMs
			: Date.now() + 24 * 60 * 60 * 1000; // Default 24h expiry

		const id = await ctx.db.insert("approvals", {
			type: args.type,
			status: "pending",
			title: args.title,
			description: args.description,
			agentId: args.agentId,
			agentName: args.agentName,
			taskId: args.taskId,
			metadata: args.metadata,
			expiresAt,
			notificationSent: false,
			tenantId: args.tenantId,
		});

		return id;
	},
});

/**
 * Approve a request
 */
export const approve = mutation({
	args: {
		approvalId: v.id("approvals"),
		resolvedBy: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const approval = await ctx.db.get(args.approvalId);
		if (!approval) throw new Error("Approval not found");
		if (approval.status !== "pending") {
			throw new Error(`Cannot approve: status is ${approval.status}`);
		}

		await ctx.db.patch(args.approvalId, {
			status: "approved",
			resolvedAt: Date.now(),
			resolvedBy: args.resolvedBy || "dashboard",
		});

		return { success: true };
	},
});

/**
 * Deny a request
 */
export const deny = mutation({
	args: {
		approvalId: v.id("approvals"),
		resolvedBy: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const approval = await ctx.db.get(args.approvalId);
		if (!approval) throw new Error("Approval not found");
		if (approval.status !== "pending") {
			throw new Error(`Cannot deny: status is ${approval.status}`);
		}

		await ctx.db.patch(args.approvalId, {
			status: "denied",
			resolvedAt: Date.now(),
			resolvedBy: args.resolvedBy || "dashboard",
		});

		return { success: true };
	},
});

/**
 * Mark notification as sent
 */
export const markNotified = mutation({
	args: {
		approvalId: v.id("approvals"),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.approvalId, {
			notificationSent: true,
		});
	},
});

/**
 * Expire old pending approvals
 */
export const expireOld = mutation({
	args: {
		tenantId: v.string(),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const pending = await ctx.db
			.query("approvals")
			.withIndex("by_tenant_status", (q) =>
				q.eq("tenantId", args.tenantId).eq("status", "pending")
			)
			.collect();

		let expiredCount = 0;
		for (const approval of pending) {
			if (approval.expiresAt && approval.expiresAt < now) {
				await ctx.db.patch(approval._id, {
					status: "expired",
					resolvedAt: now,
				});
				expiredCount++;
			}
		}

		return { expiredCount };
	},
});

/**
 * Get a single approval by ID
 */
export const get = query({
	args: {
		approvalId: v.id("approvals"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.approvalId);
	},
});

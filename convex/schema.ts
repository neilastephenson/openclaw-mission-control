import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
	...authTables,
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
		agents: defineTable({
			name: v.string(),
			role: v.string(),
		status: v.union(
			v.literal("idle"),
			v.literal("active"),
			v.literal("blocked"),
		),
		level: v.union(v.literal("LEAD"), v.literal("INT"), v.literal("SPC")),
		avatar: v.string(),
		currentTaskId: v.optional(v.id("tasks")),
		sessionKey: v.optional(v.string()),
		systemPrompt: v.optional(v.string()),
		character: v.optional(v.string()),
			lore: v.optional(v.string()),
			orgId: v.optional(v.string()),
			workspaceId: v.optional(v.string()),
			tenantId: v.optional(v.string()),
		}).index("by_tenant", ["tenantId"]),
		tasks: defineTable({
		title: v.string(),
		description: v.string(),
		status: v.union(
			v.literal("inbox"),
			v.literal("assigned"),
			v.literal("in_progress"),
			v.literal("review"),
			v.literal("done"),
			v.literal("archived"),
		),
		assigneeIds: v.array(v.id("agents")),
		tags: v.array(v.string()),
		borderColor: v.optional(v.string()),
		projectId: v.optional(v.id("projects")),
		sessionKey: v.optional(v.string()),
		openclawRunId: v.optional(v.string()),
		startedAt: v.optional(v.number()),
			usedCodingTools: v.optional(v.boolean()),
			orgId: v.optional(v.string()),
			workspaceId: v.optional(v.string()),
			tenantId: v.optional(v.string()),
		})
			.index("by_tenant", ["tenantId"])
			.index("by_project", ["projectId"]),
		messages: defineTable({
		taskId: v.id("tasks"),
		fromAgentId: v.id("agents"),
			content: v.string(),
			attachments: v.array(v.id("documents")),
			orgId: v.optional(v.string()),
			workspaceId: v.optional(v.string()),
			tenantId: v.optional(v.string()),
		})
			.index("by_tenant", ["tenantId"])
			.index("by_tenant_task", ["tenantId", "taskId"]),
		activities: defineTable({
			type: v.string(),
			agentId: v.id("agents"),
			message: v.string(),
			targetId: v.optional(v.id("tasks")),
			orgId: v.optional(v.string()),
			workspaceId: v.optional(v.string()),
			tenantId: v.optional(v.string()),
		})
			.index("by_tenant", ["tenantId"])
			.index("by_tenant_target", ["tenantId", "targetId"]),
		documents: defineTable({
		title: v.string(),
		content: v.string(),
		type: v.string(),
		path: v.optional(v.string()),
			taskId: v.optional(v.id("tasks")),
			createdByAgentId: v.optional(v.id("agents")),
			messageId: v.optional(v.id("messages")),
			orgId: v.optional(v.string()),
			workspaceId: v.optional(v.string()),
			tenantId: v.optional(v.string()),
		})
			.index("by_tenant", ["tenantId"])
			.index("by_tenant_task", ["tenantId", "taskId"]),
		notifications: defineTable({
			mentionedAgentId: v.id("agents"),
			content: v.string(),
			delivered: v.boolean(),
			orgId: v.optional(v.string()),
			workspaceId: v.optional(v.string()),
			tenantId: v.optional(v.string()),
		}),
	approvals: defineTable({
		type: v.union(
			v.literal("delete_file"),
			v.literal("external_send"),
			v.literal("spawn_agent"),
			v.literal("modify_config"),
			v.literal("dangerous_command"),
			v.literal("other")
		),
		status: v.union(
			v.literal("pending"),
			v.literal("approved"),
			v.literal("denied"),
			v.literal("expired")
		),
		title: v.string(),
		description: v.string(),
		agentId: v.optional(v.string()),
		agentName: v.optional(v.string()),
		taskId: v.optional(v.id("tasks")),
		metadata: v.optional(v.any()),
		expiresAt: v.optional(v.number()),
		resolvedAt: v.optional(v.number()),
		resolvedBy: v.optional(v.string()),
		notificationSent: v.optional(v.boolean()),
		tenantId: v.optional(v.string()),
	})
		.index("by_tenant", ["tenantId"])
		.index("by_status", ["status"])
		.index("by_tenant_status", ["tenantId", "status"]),
	apiTokens: defineTable({
		tokenHash: v.string(),
		tokenPrefix: v.string(),
		tenantId: v.optional(v.string()),
		orgId: v.optional(v.string()),
		name: v.optional(v.string()),
		createdAt: v.number(),
		lastUsedAt: v.optional(v.number()),
		revokedAt: v.optional(v.number()),
	})
		.index("by_tokenHash", ["tokenHash"])
		.index("by_tenant", ["tenantId"]),
	tenantSettings: defineTable({
		tenantId: v.string(),
		retentionDays: v.number(),
		onboardingCompletedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_tenant", ["tenantId"]),
	rateLimits: defineTable({
		tenantId: v.optional(v.string()),
		orgId: v.optional(v.string()),
		windowStartMs: v.number(),
		count: v.number(),
	}).index("by_tenant", ["tenantId"]),
	webhookEvents: defineTable({
		runId: v.string(),
		action: v.string(), // start | progress | end | error | document
		agentId: v.optional(v.string()),
		sessionKey: v.optional(v.string()),
		projectId: v.optional(v.string()),
		taskId: v.optional(v.id("tasks")),
		source: v.optional(v.string()),
		prompt: v.optional(v.string()),
		response: v.optional(v.string()),
		error: v.optional(v.string()),
		eventType: v.optional(v.string()),
		message: v.optional(v.string()),
		usage: v.optional(
			v.object({
				inputTokens: v.optional(v.number()),
				outputTokens: v.optional(v.number()),
				totalTokens: v.optional(v.number()),
				model: v.optional(v.string()),
				cost: v.optional(v.number()),
			})
		),
		tenantId: v.optional(v.string()),
	})
		.index("by_tenant", ["tenantId"])
		.index("by_runId", ["runId"])
		.index("by_agent", ["agentId"]),
});

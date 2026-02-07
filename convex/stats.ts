import { query } from "./_generated/server";
import { v } from "convex/values";

// Model pricing per 1M tokens (approximate)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
	"claude-sonnet-4-20250514": { input: 3, output: 15 },
	"claude-opus-4-20250514": { input: 15, output: 75 },
	"anthropic/claude-sonnet-4": { input: 3, output: 15 },
	"anthropic/claude-opus-4": { input: 15, output: 75 },
	"anthropic/claude-opus-4-5": { input: 15, output: 75 },
	"gpt-4o": { input: 2.5, output: 10 },
	"gpt-4o-mini": { input: 0.15, output: 0.6 },
	default: { input: 3, output: 15 },
};

function calculateCost(
	model: string | undefined,
	inputTokens: number,
	outputTokens: number
): number {
	const pricing = MODEL_PRICING[model || "default"] || MODEL_PRICING.default;
	return (
		(inputTokens / 1_000_000) * pricing.input +
		(outputTokens / 1_000_000) * pricing.output
	);
}

function getStartOfDay(timestamp: number): number {
	const date = new Date(timestamp);
	date.setHours(0, 0, 0, 0);
	return date.getTime();
}

/**
 * Get quick stats for the header dashboard
 */
export const getQuickStats = query({
	args: {
		tenantId: v.string(),
	},
	handler: async (ctx, args) => {
		const agents = await ctx.db
			.query("agents")
			.withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
			.collect();

		// Count total agents
		const agentCount = agents.length;

		// Count pending approvals
		const pendingApprovalsList = await ctx.db
			.query("approvals")
			.withIndex("by_tenant_status", (q) =>
				q.eq("tenantId", args.tenantId).eq("status", "pending")
			)
			.collect();
		const pendingApprovals = pendingApprovalsList.length;

		// Calculate today's cost from webhook events
		const todayStart = getStartOfDay(Date.now());
		const events = await ctx.db
			.query("webhookEvents")
			.withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
			.collect();

		let todayCost = 0;
		for (const event of events) {
			if (event._creationTime < todayStart) continue;
			if (!event.usage) continue;

			todayCost +=
				event.usage.cost ||
				calculateCost(
					event.usage.model,
					event.usage.inputTokens || 0,
					event.usage.outputTokens || 0
				);
		}

		return {
			agentCount,
			pendingApprovals,
			todayCost,
		};
	},
});

import { query } from "./_generated/server";
import { v } from "convex/values";

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

		// Pending approvals (placeholder - will be wired in Phase 4)
		const pendingApprovals = 0;

		// Today's cost (placeholder - will be wired in Phase 3)
		const todayCost = 0;

		return {
			agentCount,
			pendingApprovals,
			todayCost,
		};
	},
});

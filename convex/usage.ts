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

function getStartOfWeek(timestamp: number): number {
	const date = new Date(timestamp);
	const day = date.getDay();
	const diff = date.getDate() - day + (day === 0 ? -6 : 1);
	date.setDate(diff);
	date.setHours(0, 0, 0, 0);
	return date.getTime();
}

function getStartOfMonth(timestamp: number): number {
	const date = new Date(timestamp);
	date.setDate(1);
	date.setHours(0, 0, 0, 0);
	return date.getTime();
}

/**
 * Get usage summary for dashboard
 */
export const getSummary = query({
	args: {
		tenantId: v.string(),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const todayStart = getStartOfDay(now);
		const weekStart = getStartOfWeek(now);
		const monthStart = getStartOfMonth(now);

		const events = await ctx.db
			.query("webhookEvents")
			.withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
			.collect();

		let todayTokens = 0;
		let todayCost = 0;
		let weekTokens = 0;
		let weekCost = 0;
		let monthTokens = 0;
		let monthCost = 0;
		let totalTokens = 0;
		let totalCost = 0;

		for (const event of events) {
			if (!event.usage) continue;

			const tokens = event.usage.totalTokens || 0;
			const cost =
				event.usage.cost ||
				calculateCost(
					event.usage.model,
					event.usage.inputTokens || 0,
					event.usage.outputTokens || 0
				);
			const eventTime = event._creationTime;

			totalTokens += tokens;
			totalCost += cost;

			if (eventTime >= monthStart) {
				monthTokens += tokens;
				monthCost += cost;
			}
			if (eventTime >= weekStart) {
				weekTokens += tokens;
				weekCost += cost;
			}
			if (eventTime >= todayStart) {
				todayTokens += tokens;
				todayCost += cost;
			}
		}

		return {
			today: { tokens: todayTokens, cost: todayCost },
			week: { tokens: weekTokens, cost: weekCost },
			month: { tokens: monthTokens, cost: monthCost },
			total: { tokens: totalTokens, cost: totalCost },
		};
	},
});

/**
 * Get usage breakdown by agent
 */
export const getByAgent = query({
	args: {
		tenantId: v.string(),
		days: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const days = args.days || 30;
		const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

		const events = await ctx.db
			.query("webhookEvents")
			.withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
			.collect();

		const agents = await ctx.db
			.query("agents")
			.withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
			.collect();

		const agentMap = new Map(agents.map((a) => [a._id, a]));

		const byAgent: Record<
			string,
			{ name: string; tokens: number; cost: number; calls: number }
		> = {};

		for (const event of events) {
			if (event._creationTime < cutoff) continue;
			if (!event.usage) continue;

			const agentId = event.agentId || "unknown";
			const agent = agentMap.get(agentId as any);

			if (!byAgent[agentId]) {
				byAgent[agentId] = {
					name: agent?.name || agentId,
					tokens: 0,
					cost: 0,
					calls: 0,
				};
			}

			byAgent[agentId].tokens += event.usage.totalTokens || 0;
			byAgent[agentId].cost +=
				event.usage.cost ||
				calculateCost(
					event.usage.model,
					event.usage.inputTokens || 0,
					event.usage.outputTokens || 0
				);
			byAgent[agentId].calls += 1;
		}

		return Object.values(byAgent).sort((a, b) => b.cost - a.cost);
	},
});

/**
 * Get daily usage for trend chart
 */
export const getDailyTrend = query({
	args: {
		tenantId: v.string(),
		days: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const days = args.days || 14;
		const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

		const events = await ctx.db
			.query("webhookEvents")
			.withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
			.collect();

		const dailyData: Record<string, { tokens: number; cost: number; calls: number }> =
			{};

		// Initialize all days
		for (let i = 0; i < days; i++) {
			const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
			const key = date.toISOString().split("T")[0];
			dailyData[key] = { tokens: 0, cost: 0, calls: 0 };
		}

		for (const event of events) {
			if (event._creationTime < cutoff) continue;
			if (!event.usage) continue;

			const date = new Date(event._creationTime);
			const key = date.toISOString().split("T")[0];

			if (!dailyData[key]) continue;

			dailyData[key].tokens += event.usage.totalTokens || 0;
			dailyData[key].cost +=
				event.usage.cost ||
				calculateCost(
					event.usage.model,
					event.usage.inputTokens || 0,
					event.usage.outputTokens || 0
				);
			dailyData[key].calls += 1;
		}

		return Object.entries(dailyData)
			.map(([date, data]) => ({ date, ...data }))
			.sort((a, b) => a.date.localeCompare(b.date));
	},
});

/**
 * Get usage by model
 */
export const getByModel = query({
	args: {
		tenantId: v.string(),
		days: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const days = args.days || 30;
		const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

		const events = await ctx.db
			.query("webhookEvents")
			.withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
			.collect();

		const byModel: Record<
			string,
			{ tokens: number; cost: number; calls: number }
		> = {};

		for (const event of events) {
			if (event._creationTime < cutoff) continue;
			if (!event.usage) continue;

			const model = event.usage.model || "unknown";

			if (!byModel[model]) {
				byModel[model] = { tokens: 0, cost: 0, calls: 0 };
			}

			byModel[model].tokens += event.usage.totalTokens || 0;
			byModel[model].cost +=
				event.usage.cost ||
				calculateCost(
					event.usage.model,
					event.usage.inputTokens || 0,
					event.usage.outputTokens || 0
				);
			byModel[model].calls += 1;
		}

		return Object.entries(byModel)
			.map(([model, data]) => ({ model, ...data }))
			.sort((a, b) => b.cost - a.cost);
	},
});

/**
 * Get today's cost for header
 */
export const getTodayCost = query({
	args: {
		tenantId: v.string(),
	},
	handler: async (ctx, args) => {
		const todayStart = getStartOfDay(Date.now());

		const events = await ctx.db
			.query("webhookEvents")
			.withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
			.collect();

		let cost = 0;
		for (const event of events) {
			if (event._creationTime < todayStart) continue;
			if (!event.usage) continue;

			cost +=
				event.usage.cost ||
				calculateCost(
					event.usage.model,
					event.usage.inputTokens || 0,
					event.usage.outputTokens || 0
				);
		}

		return cost;
	},
});

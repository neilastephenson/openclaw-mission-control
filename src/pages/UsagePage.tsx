import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { DEFAULT_TENANT_ID } from "../lib/tenant";
import TabNavigation from "../components/layout/TabNavigation";

function formatCost(cost: number): string {
	if (cost < 0.01) return `$${cost.toFixed(4)}`;
	if (cost < 1) return `$${cost.toFixed(3)}`;
	return `$${cost.toFixed(2)}`;
}

function formatTokens(tokens: number): string {
	if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(2)}M`;
	if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
	return tokens.toString();
}

const UsagePage: React.FC = () => {
	const summary = useQuery(api.usage.getSummary, { tenantId: DEFAULT_TENANT_ID });
	const byAgent = useQuery(api.usage.getByAgent, { tenantId: DEFAULT_TENANT_ID, days: 30 });
	const dailyTrend = useQuery(api.usage.getDailyTrend, { tenantId: DEFAULT_TENANT_ID, days: 14 });
	const byModel = useQuery(api.usage.getByModel, { tenantId: DEFAULT_TENANT_ID, days: 30 });

	const maxDailyCost = dailyTrend ? Math.max(...dailyTrend.map(d => d.cost), 0.01) : 1;

	return (
		<div className="flex flex-col h-screen bg-background">
			<TabNavigation />

			<div className="flex-1 overflow-y-auto p-6">
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-foreground">Usage & Costs</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Track API usage, token consumption, and costs
					</p>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<div className="bg-card border border-border rounded-lg p-4">
						<div className="text-sm text-muted-foreground mb-1">Today</div>
						<div className="text-2xl font-bold text-foreground">
							{summary ? formatCost(summary.today.cost) : "..."}
						</div>
						<div className="text-xs text-muted-foreground mt-1">
							{summary ? formatTokens(summary.today.tokens) : "..."} tokens
						</div>
					</div>
					<div className="bg-card border border-border rounded-lg p-4">
						<div className="text-sm text-muted-foreground mb-1">This Week</div>
						<div className="text-2xl font-bold text-foreground">
							{summary ? formatCost(summary.week.cost) : "..."}
						</div>
						<div className="text-xs text-muted-foreground mt-1">
							{summary ? formatTokens(summary.week.tokens) : "..."} tokens
						</div>
					</div>
					<div className="bg-card border border-border rounded-lg p-4">
						<div className="text-sm text-muted-foreground mb-1">This Month</div>
						<div className="text-2xl font-bold text-foreground">
							{summary ? formatCost(summary.month.cost) : "..."}
						</div>
						<div className="text-xs text-muted-foreground mt-1">
							{summary ? formatTokens(summary.month.tokens) : "..."} tokens
						</div>
					</div>
					<div className="bg-card border border-border rounded-lg p-4">
						<div className="text-sm text-muted-foreground mb-1">All Time</div>
						<div className="text-2xl font-bold text-foreground">
							{summary ? formatCost(summary.total.cost) : "..."}
						</div>
						<div className="text-xs text-muted-foreground mt-1">
							{summary ? formatTokens(summary.total.tokens) : "..."} tokens
						</div>
					</div>
				</div>

				{/* Daily Trend Chart */}
				<div className="bg-card border border-border rounded-lg p-4 mb-8">
					<h2 className="text-lg font-semibold text-foreground mb-4">Daily Cost (14 days)</h2>
					{dailyTrend && dailyTrend.length > 0 ? (
						<div className="flex items-end gap-1 h-32">
							{dailyTrend.map((day) => (
								<div
									key={day.date}
									className="flex-1 flex flex-col items-center gap-1"
								>
									<div
										className="w-full bg-[var(--accent-blue)] rounded-t min-h-[2px] transition-all"
										style={{
											height: `${Math.max((day.cost / maxDailyCost) * 100, 2)}%`,
										}}
										title={`${day.date}: ${formatCost(day.cost)} (${formatTokens(day.tokens)} tokens)`}
									/>
									<div className="text-[10px] text-muted-foreground transform -rotate-45 origin-top-left whitespace-nowrap">
										{new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							No usage data yet
						</div>
					)}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* By Agent */}
					<div className="bg-card border border-border rounded-lg p-4">
						<h2 className="text-lg font-semibold text-foreground mb-4">By Agent (30 days)</h2>
						{byAgent && byAgent.length > 0 ? (
							<div className="space-y-3">
								{byAgent.map((agent) => (
									<div key={agent.name} className="flex items-center justify-between">
										<div>
											<div className="font-medium text-foreground">{agent.name}</div>
											<div className="text-xs text-muted-foreground">
												{formatTokens(agent.tokens)} tokens · {agent.calls} calls
											</div>
										</div>
										<div className="text-lg font-semibold text-foreground">
											{formatCost(agent.cost)}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground">
								No agent usage data yet
							</div>
						)}
					</div>

					{/* By Model */}
					<div className="bg-card border border-border rounded-lg p-4">
						<h2 className="text-lg font-semibold text-foreground mb-4">By Model (30 days)</h2>
						{byModel && byModel.length > 0 ? (
							<div className="space-y-3">
								{byModel.map((model) => (
									<div key={model.model} className="flex items-center justify-between">
										<div>
											<div className="font-medium text-foreground font-mono text-sm">
												{model.model}
											</div>
											<div className="text-xs text-muted-foreground">
												{formatTokens(model.tokens)} tokens · {model.calls} calls
											</div>
										</div>
										<div className="text-lg font-semibold text-foreground">
											{formatCost(model.cost)}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground">
								No model usage data yet
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default UsagePage;

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { DEFAULT_TENANT_ID } from "../lib/tenant";
import { useAgentFilter } from "../contexts/AgentFilterContext";

const ActivityPage: React.FC = () => {
	const { selectedAgentId } = useAgentFilter();
	const activities = useQuery(api.queries.listActivities, {
		tenantId: DEFAULT_TENANT_ID,
		agentId: selectedAgentId || undefined,
	});

	if (activities === undefined) {
		return (
			<div className="flex-1 p-6">
				<div className="animate-pulse space-y-4">
					{[...Array(10)].map((_, i) => (
						<div key={i} className="flex gap-3">
							<div className="w-10 h-10 bg-muted rounded-full" />
							<div className="flex-1 space-y-2">
								<div className="h-3 bg-muted rounded w-3/4" />
								<div className="h-2 bg-muted rounded w-1/2" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-foreground">Activity Feed</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Real-time agent activity{selectedAgentId && " (filtered by agent)"}
				</p>
			</div>

			<div className="space-y-4">
				{activities.length === 0 ? (
					<div className="text-center py-12 text-muted-foreground">
						No activities yet
					</div>
				) : (
					activities.map((activity) => (
						<div
							key={activity._id}
							className="flex gap-3 p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
						>
							<div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-sm font-semibold">
								{activity.agentName?.charAt(0) || "?"}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-baseline gap-2 mb-1">
									<span className="font-semibold text-foreground">
										{activity.agentName}
									</span>
									<span className="text-xs text-muted-foreground">
										{new Date(activity._creationTime).toLocaleString()}
									</span>
								</div>
								<div className="text-sm text-foreground/90">
									{activity.type === "status_update" && "Updated task status"}
									{activity.type === "message" && activity.message}
									{activity.type === "task_created" && "Created a task"}
									{activity.type === "assignees_update" && "Updated assignees"}
									{!["status_update", "message", "task_created", "assignees_update"].includes(activity.type) && activity.type}
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default ActivityPage;

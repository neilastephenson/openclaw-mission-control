import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { DEFAULT_TENANT_ID } from "../lib/tenant";
import TabNavigation from "../components/layout/TabNavigation";
import {
	IconCheck,
	IconX,
	IconClock,
	IconAlertTriangle,
	IconTrash,
	IconSend,
	IconRobot,
	IconSettings,
	IconTerminal,
} from "@tabler/icons-react";

const typeIcons: Record<string, React.ReactNode> = {
	delete_file: <IconTrash size={18} />,
	external_send: <IconSend size={18} />,
	spawn_agent: <IconRobot size={18} />,
	modify_config: <IconSettings size={18} />,
	dangerous_command: <IconTerminal size={18} />,
	other: <IconAlertTriangle size={18} />,
};

const typeLabels: Record<string, string> = {
	delete_file: "Delete File",
	external_send: "External Send",
	spawn_agent: "Spawn Agent",
	modify_config: "Modify Config",
	dangerous_command: "Dangerous Command",
	other: "Other",
};

const statusColors: Record<string, string> = {
	pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
	approved: "bg-green-500/20 text-green-400 border-green-500/30",
	denied: "bg-red-500/20 text-red-400 border-red-500/30",
	expired: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

function formatTimeAgo(timestamp: number): string {
	const seconds = Math.floor((Date.now() - timestamp) / 1000);
	if (seconds < 60) return "just now";
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
	return `${Math.floor(seconds / 86400)}d ago`;
}

function formatTimeRemaining(expiresAt: number): string {
	const remaining = expiresAt - Date.now();
	if (remaining <= 0) return "Expired";
	const hours = Math.floor(remaining / (1000 * 60 * 60));
	const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
	if (hours > 0) return `${hours}h ${minutes}m remaining`;
	return `${minutes}m remaining`;
}

const ApprovalsPage: React.FC = () => {
	const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");

	// Fetch all approvals and filter client-side to avoid query issues
	const approvals = useQuery(api.approvals.list, {
		tenantId: DEFAULT_TENANT_ID,
		limit: 100,
	});

	const approveMutation = useMutation(api.approvals.approve);
	const denyMutation = useMutation(api.approvals.deny);

	const [processing, setProcessing] = useState<string | null>(null);

	const handleApprove = async (id: Id<"approvals">) => {
		setProcessing(id);
		try {
			await approveMutation({ approvalId: id });
		} finally {
			setProcessing(null);
		}
	};

	const handleDeny = async (id: Id<"approvals">) => {
		setProcessing(id);
		try {
			await denyMutation({ approvalId: id });
		} finally {
			setProcessing(null);
		}
	};

	// Filter client-side
	const filteredApprovals = approvals?.filter((a) => {
		if (filter === "pending") return a.status === "pending";
		if (filter === "resolved") return a.status !== "pending";
		return true;
	});

	const pendingCount = approvals?.filter((a) => a.status === "pending").length || 0;

	return (
		<div className="flex flex-col h-screen bg-background">
			<TabNavigation />

			<div className="flex-1 overflow-y-auto p-6">
				<div className="flex items-start justify-between mb-6">
					<div>
						<h1 className="text-2xl font-bold text-foreground">Approvals</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Review and approve agent actions requiring authorization
						</p>
					</div>
					{pendingCount > 0 && (
						<div className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">
							{pendingCount} pending
						</div>
					)}
				</div>

				{/* Filter tabs */}
				<div className="flex gap-2 mb-6">
					{(["all", "pending", "resolved"] as const).map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
								filter === f
									? "bg-[var(--accent-blue)] text-white"
									: "bg-muted text-muted-foreground hover:bg-muted/80"
							}`}
						>
							{f.charAt(0).toUpperCase() + f.slice(1)}
						</button>
					))}
				</div>

				{/* Approvals list */}
				{approvals === undefined ? (
					<div className="space-y-4">
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className="rounded-lg bg-muted h-24 animate-pulse"
							/>
						))}
					</div>
				) : filteredApprovals && filteredApprovals.length > 0 ? (
					<div className="space-y-4">
						{filteredApprovals.map((approval) => (
							<div
								key={approval._id}
								className="bg-card border border-border rounded-lg p-4"
							>
								<div className="flex items-start justify-between">
									<div className="flex items-start gap-3">
										<div className="p-2 rounded-lg bg-muted text-muted-foreground">
											{typeIcons[approval.type] || <IconAlertTriangle size={18} />}
										</div>
										<div>
											<div className="flex items-center gap-2">
												<h3 className="font-medium text-foreground">
													{approval.title}
												</h3>
												<span
													className={`px-2 py-0.5 rounded-full text-xs border ${
														statusColors[approval.status] || statusColors.pending
													}`}
												>
													{approval.status}
												</span>
											</div>
											<p className="text-sm text-muted-foreground mt-1">
												{approval.description}
											</p>
											<div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
												<span>{typeLabels[approval.type] || "Unknown"}</span>
												{approval.agentName && (
													<span>• {approval.agentName}</span>
												)}
												<span>• {formatTimeAgo(approval._creationTime)}</span>
												{approval.status === "pending" && approval.expiresAt && (
													<span className="flex items-center gap-1">
														<IconClock size={12} />
														{formatTimeRemaining(approval.expiresAt)}
													</span>
												)}
											</div>
										</div>
									</div>

									{approval.status === "pending" && (
										<div className="flex items-center gap-2">
											<button
												onClick={() => handleApprove(approval._id)}
												disabled={processing === approval._id}
												className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
											>
												<IconCheck size={16} />
												Approve
											</button>
											<button
												onClick={() => handleDeny(approval._id)}
												disabled={processing === approval._id}
												className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
											>
												<IconX size={16} />
												Deny
											</button>
										</div>
									)}

									{approval.status !== "pending" && approval.resolvedAt && (
										<div className="text-xs text-muted-foreground">
											{approval.status === "approved" ? "Approved" : "Denied"}{" "}
											{formatTimeAgo(approval.resolvedAt)}
											{approval.resolvedBy && ` by ${approval.resolvedBy}`}
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="max-w-2xl mx-auto text-center py-12">
						<div className="text-6xl mb-4">✓</div>
						<h2 className="text-xl font-semibold text-foreground mb-2">
							{filter === "pending"
								? "No pending approvals"
								: "No approvals yet"}
						</h2>
						<p className="text-muted-foreground">
							{filter === "pending"
								? "All caught up! Agents will request approval for sensitive actions."
								: "Approval requests from agents will appear here."}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ApprovalsPage;

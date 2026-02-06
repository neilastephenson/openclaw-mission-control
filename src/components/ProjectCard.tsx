import React from "react";
import { IconPencil, IconArchive, IconLayoutKanban } from "@tabler/icons-react";
import { Id } from "../../convex/_generated/dataModel";

type ProjectCardProps = {
	project: {
		_id: Id<"projects">;
		name: string;
		description?: string;
		status: string;
		color?: string;
		taskCount: number;
		doneCount: number;
		_creationTime: number;
	};
	onEdit: () => void;
	onArchive: () => void;
	onViewTasks: () => void;
};

const ProjectCard: React.FC<ProjectCardProps> = ({
	project,
	onEdit,
	onArchive,
	onViewTasks,
}) => {
	const getStatusBadgeClass = (status: string) => {
		switch (status) {
			case "active":
				return "bg-[var(--accent-green)] text-green-700";
			case "paused":
				return "bg-[var(--accent-orange)] text-orange-700";
			case "complete":
				return "bg-[var(--accent-blue)] text-blue-700";
			case "archived":
				return "text-muted-foreground bg-muted";
			default:
				return "text-muted-foreground bg-muted";
		}
	};

	const formatDate = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	};

	return (
		<div
			className="bg-white rounded-lg border border-border p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer"
			style={{ borderLeft: `4px solid ${project.color || "#64748b"}` }}
			onClick={onViewTasks}
		>
			{/* Top row: Name + Actions */}
			<div className="flex items-start justify-between mb-2">
				<h3 className="text-sm font-semibold text-foreground flex-1">{project.name}</h3>
				<div className="flex items-center gap-1 ml-2">
					<button
						onClick={(e) => {
							e.stopPropagation();
							onEdit();
						}}
						className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
						aria-label="Edit project"
					>
						<IconPencil size={14} />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onViewTasks();
						}}
						className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
						aria-label="View tasks"
					>
						<IconLayoutKanban size={14} />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onArchive();
						}}
						className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
						aria-label="Archive project"
					>
						<IconArchive size={14} />
					</button>
				</div>
			</div>

			{/* Status Badge */}
			<div className="mb-2">
				<span className={`text-[10px] px-2 py-0.5 rounded font-medium ${getStatusBadgeClass(project.status)}`}>
					{project.status.charAt(0).toUpperCase() + project.status.slice(1)}
				</span>
			</div>

			{/* Description */}
			{project.description && (
				<p className="text-xs text-muted-foreground mb-3 line-clamp-2">
					{project.description}
				</p>
			)}

			{/* Bottom row: Task count + creation date */}
			<div className="flex items-center justify-between text-[11px] text-muted-foreground">
				<span>
					{project.doneCount}/{project.taskCount} tasks done
				</span>
				<span>{formatDate(project._creationTime)}</span>
			</div>
		</div>
	);
};

export default ProjectCard;

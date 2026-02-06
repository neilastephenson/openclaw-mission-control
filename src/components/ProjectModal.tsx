import React, { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { DEFAULT_TENANT_ID } from "../lib/tenant";

const STATUS_OPTIONS = [
	{ value: "active", label: "Active" },
	{ value: "paused", label: "Paused" },
	{ value: "complete", label: "Complete" },
] as const;

const COLOR_SWATCHES = [
	"#3b82f6",
	"#8b5cf6",
	"#ec4899",
	"#f97316",
	"#eab308",
	"#22c55e",
	"#06b6d4",
	"#64748b",
];

type ProjectModalProps = {
	onClose: () => void;
	onSaved: () => void;
	project?: {
		_id: Id<"projects">;
		name: string;
		description?: string;
		status: string;
		color?: string;
		tenantId?: string;
	};
};

const ProjectModal: React.FC<ProjectModalProps> = ({ onClose, onSaved, project }) => {
	const createProject = useMutation(api.projects.create);
	const updateProject = useMutation(api.projects.update);

	const [name, setName] = useState(project?.name || "");
	const [description, setDescription] = useState(project?.description || "");
	const [status, setStatus] = useState(project?.status || "active");
	const [color, setColor] = useState(project?.color || "");
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!name.trim()) return;
			setSubmitting(true);

			try {
				if (project) {
					// Edit mode
					await updateProject({
						projectId: project._id,
						tenantId: DEFAULT_TENANT_ID,
						name: name.trim(),
						description: description.trim() || undefined,
						status,
						color: color || undefined,
					});
				} else {
					// Create mode
					await createProject({
						name: name.trim(),
						description: description.trim() || undefined,
						status,
						color: color || undefined,
						tenantId: DEFAULT_TENANT_ID,
					});
				}

				onSaved();
			} catch {
				setSubmitting(false);
			}
		},
		[name, description, status, color, project, createProject, updateProject, onSaved]
	);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center"
			onClick={onClose}
			aria-hidden="true"
		>
			<div className="absolute inset-0 bg-black/40" />
			<div
				className="relative bg-white rounded-xl border border-border shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-6 py-4 border-b border-border">
					<h2 className="text-sm font-bold tracking-wide text-foreground">
						{project ? "Edit Project" : "New Project"}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
						aria-label="Close modal"
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
					{/* Name */}
					<div>
						<label className="block text-[11px] font-semibold text-muted-foreground tracking-wide mb-1.5">
							NAME
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-transparent"
							placeholder="Project name"
							required
							autoFocus
						/>
					</div>

					{/* Description */}
					<div>
						<label className="block text-[11px] font-semibold text-muted-foreground tracking-wide mb-1.5">
							DESCRIPTION
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-transparent resize-none"
							placeholder="Optional description"
							rows={3}
						/>
					</div>

					{/* Status */}
					<div>
						<label className="block text-[11px] font-semibold text-muted-foreground tracking-wide mb-1.5">
							STATUS
						</label>
						<select
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-transparent"
						>
							{STATUS_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>

					{/* Color */}
					<div>
						<label className="block text-[11px] font-semibold text-muted-foreground tracking-wide mb-1.5">
							COLOR
						</label>
						<div className="flex items-center gap-2">
							{COLOR_SWATCHES.map((swatch) => (
								<button
									key={swatch}
									type="button"
									onClick={() => setColor(color === swatch ? "" : swatch)}
									className={`w-7 h-7 rounded-full border-2 transition-all ${
										color === swatch
											? "border-foreground scale-110"
											: "border-transparent hover:scale-105"
									}`}
									style={{ backgroundColor: swatch }}
									aria-label={`Select color ${swatch}`}
								/>
							))}
							{color && (
								<button
									type="button"
									onClick={() => setColor("")}
									className="text-[11px] text-muted-foreground hover:text-foreground transition-colors ml-1"
								>
									Clear
								</button>
							)}
						</div>
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-2 pt-2 border-t border-border">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={submitting || !name.trim()}
							className="px-4 py-2 text-sm font-semibold text-white bg-[var(--accent-blue)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{submitting ? "Saving..." : project ? "Save Changes" : "Create Project"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ProjectModal;

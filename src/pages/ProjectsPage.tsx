import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { IconPlus } from "@tabler/icons-react";
import { DEFAULT_TENANT_ID } from "../lib/tenant";
import TabNavigation from "../components/layout/TabNavigation";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";

const ProjectsPage: React.FC = () => {
	const navigate = useNavigate();
	const projects = useQuery(api.projects.list, { tenantId: DEFAULT_TENANT_ID });
	const archiveProject = useMutation(api.projects.archive);

	const [showModal, setShowModal] = useState(false);
	const [editingProject, setEditingProject] = useState<any>(null);
	const [showArchived, setShowArchived] = useState(false);

	const handleNewProject = () => {
		setEditingProject(null);
		setShowModal(true);
	};

	const handleEditProject = (project: any) => {
		setEditingProject(project);
		setShowModal(true);
	};

	const handleArchiveProject = async (projectId: Id<"projects">) => {
		await archiveProject({
			projectId,
			tenantId: DEFAULT_TENANT_ID,
		});
	};

	const handleViewTasks = (projectId: Id<"projects">) => {
		navigate(`/tasks?project=${projectId}`);
	};

	const handleModalClose = () => {
		setShowModal(false);
		setEditingProject(null);
	};

	const handleModalSaved = () => {
		setShowModal(false);
		setEditingProject(null);
	};

	// Filter projects based on archived toggle
	const filteredProjects = projects?.filter((p) =>
		showArchived ? true : p.status !== "archived"
	);

	return (
		<div className="flex flex-col h-screen bg-background">
			<TabNavigation />

			<div className="flex-1 overflow-y-auto p-6">
				{/* Header */}
				<div className="flex items-start justify-between mb-6">
					<div>
						<h1 className="text-2xl font-bold text-foreground">Projects</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Organize tasks into project workspaces
						</p>
					</div>
					<button
						onClick={handleNewProject}
						className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[var(--accent-blue)] rounded-lg hover:opacity-90 transition-opacity"
					>
						<IconPlus size={16} />
						New Project
					</button>
				</div>

				{/* Filter row */}
				<div className="flex items-center gap-4 mb-4">
					<label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
						<input
							type="checkbox"
							checked={showArchived}
							onChange={(e) => setShowArchived(e.target.checked)}
							className="rounded border-border focus:ring-2 focus:ring-[var(--accent-blue)]"
						/>
						Show archived projects
					</label>
				</div>

				{/* Grid */}
				{projects === undefined ? (
					// Loading state
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="rounded-lg bg-muted h-40 animate-pulse" />
						))}
					</div>
				) : filteredProjects && filteredProjects.length > 0 ? (
					// Projects grid
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{filteredProjects.map((project) => (
							<ProjectCard
								key={project._id}
								project={project}
								onEdit={() => handleEditProject(project)}
								onArchive={() => handleArchiveProject(project._id)}
								onViewTasks={() => handleViewTasks(project._id)}
							/>
						))}
					</div>
				) : (
					// Empty state
					<div className="max-w-2xl mx-auto text-center py-12">
						<div className="text-6xl mb-4">📋</div>
						<h2 className="text-xl font-semibold text-foreground mb-2">
							{showArchived ? "No archived projects" : "No projects yet"}
						</h2>
						<p className="text-muted-foreground mb-4">
							{showArchived
								? "Archived projects will appear here"
								: "Create your first project to start organizing tasks"}
						</p>
						{!showArchived && (
							<button
								onClick={handleNewProject}
								className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[var(--accent-blue)] rounded-lg hover:opacity-90 transition-opacity"
							>
								<IconPlus size={16} />
								Create Project
							</button>
						)}
					</div>
				)}

				{/* Modal */}
				{showModal && (
					<ProjectModal
						onClose={handleModalClose}
						onSaved={handleModalSaved}
						project={editingProject}
					/>
				)}
			</div>
		</div>
	);
};

export default ProjectsPage;

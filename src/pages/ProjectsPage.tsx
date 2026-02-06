import React from "react";

const ProjectsPage: React.FC = () => {
	return (
		<div className="flex-1 overflow-y-auto p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-foreground">Projects</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Organize tasks into project workspaces
				</p>
			</div>

			<div className="max-w-2xl mx-auto text-center py-12">
				<div className="text-6xl mb-4">📋</div>
				<h2 className="text-xl font-semibold text-foreground mb-2">
					Projects Coming Soon
				</h2>
				<p className="text-muted-foreground">
					Project kanban board and workspace management will be available in Phase 2
				</p>
			</div>
		</div>
	);
};

export default ProjectsPage;

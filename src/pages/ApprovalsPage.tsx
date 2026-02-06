import React from "react";

const ApprovalsPage: React.FC = () => {
	return (
		<div className="flex-1 overflow-y-auto p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-foreground">Approvals</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Review and approve agent actions requiring authorization
				</p>
			</div>

			<div className="max-w-2xl mx-auto text-center py-12">
				<div className="text-6xl mb-4">✓</div>
				<h2 className="text-xl font-semibold text-foreground mb-2">
					Approvals Coming Soon
				</h2>
				<p className="text-muted-foreground">
					Agent approval workflow and authorization controls will be available in Phase 4
				</p>
			</div>
		</div>
	);
};

export default ApprovalsPage;

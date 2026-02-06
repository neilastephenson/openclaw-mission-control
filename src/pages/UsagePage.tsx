import React from "react";

const UsagePage: React.FC = () => {
	return (
		<div className="flex-1 overflow-y-auto p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-foreground">Usage & Costs</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Track API usage, token consumption, and costs
				</p>
			</div>

			<div className="max-w-2xl mx-auto text-center py-12">
				<div className="text-6xl mb-4">📊</div>
				<h2 className="text-xl font-semibold text-foreground mb-2">
					Usage Tracking Coming Soon
				</h2>
				<p className="text-muted-foreground">
					Detailed usage metrics and cost analysis will be available in Phase 3
				</p>
			</div>
		</div>
	);
};

export default UsagePage;

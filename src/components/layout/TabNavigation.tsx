import React from "react";
import { NavLink } from "react-router-dom";

const tabs = [
	{ name: "Activity", path: "/activity" },
	{ name: "Projects", path: "/projects" },
	{ name: "Tasks", path: "/tasks" },
	{ name: "Usage", path: "/usage" },
	{ name: "Approvals", path: "/approvals" },
];

const TabNavigation: React.FC = () => {
	return (
		<nav className="flex gap-8 px-6 border-b border-border bg-white">
			{tabs.map((tab) => (
				<NavLink
					key={tab.path}
					to={tab.path}
					className={({ isActive }) =>
						`text-sm font-semibold py-3 border-b-2 transition-colors ${
							isActive
								? "border-[var(--accent-orange)] text-foreground"
								: "border-transparent text-muted-foreground hover:text-foreground"
						}`
					}
				>
					{tab.name}
				</NavLink>
			))}
		</nav>
	);
};

export default TabNavigation;

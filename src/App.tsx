"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignInForm from "./components/SignIn";
import AppLayout from "./components/layout/AppLayout";
import ActivityPage from "./pages/ActivityPage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import UsagePage from "./pages/UsagePage";
import ApprovalsPage from "./pages/ApprovalsPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
	return (
		<>
			<Authenticated>
				<Routes>
					<Route path="/" element={<AppLayout />}>
						<Route index element={<Navigate to="/tasks" replace />} />
						<Route path="activity" element={<ActivityPage />} />
						<Route path="projects" element={<ProjectsPage />} />
						<Route path="tasks" element={<TasksPage />} />
						<Route path="usage" element={<UsagePage />} />
						<Route path="approvals" element={<ApprovalsPage />} />
						<Route path="settings" element={<SettingsPage />} />
					</Route>
				</Routes>
			</Authenticated>
			<Unauthenticated>
				<SignInForm />
			</Unauthenticated>
		</>
	);
}

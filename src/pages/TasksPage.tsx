import React, { useState, useCallback } from "react";
import MissionQueue from "../components/MissionQueue";
import TaskDetailPanel from "../components/TaskDetailPanel";
import AddTaskModal from "../components/AddTaskModal";
import TabNavigation from "../components/layout/TabNavigation";
import { Id } from "../../convex/_generated/dataModel";

const TasksPage: React.FC = () => {
	const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);
	const [showAddTaskModal, setShowAddTaskModal] = useState(false);
	const [selectedDocumentId, setSelectedDocumentId] = useState<Id<"documents"> | null>(null);

	const handlePreviewDocument = useCallback((id: Id<"documents">) => {
		setSelectedDocumentId(id);
	}, []);

	return (
		<>
			<TabNavigation />
			<div className="flex-1 overflow-hidden flex flex-col">
				<MissionQueue
					selectedTaskId={selectedTaskId}
					onSelectTask={setSelectedTaskId}
				/>
			</div>

			{selectedTaskId && (
				<>
					<div
						className="fixed inset-0 z-40"
						onClick={() => setSelectedTaskId(null)}
						aria-hidden="true"
					/>
					<TaskDetailPanel
						taskId={selectedTaskId}
						onClose={() => setSelectedTaskId(null)}
						onPreviewDocument={handlePreviewDocument}
					/>
				</>
			)}

			{showAddTaskModal && (
				<AddTaskModal
					onClose={() => setShowAddTaskModal(false)}
					onCreated={(taskId) => {
						setShowAddTaskModal(false);
						setSelectedTaskId(taskId);
					}}
				/>
			)}
		</>
	);
};

export default TasksPage;

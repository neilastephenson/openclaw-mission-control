import React, { useState } from "react";
import MissionQueue from "../components/MissionQueue";
import TaskDetailPanel from "../components/TaskDetailPanel";
import AddTaskModal from "../components/AddTaskModal";
import TabNavigation from "../components/layout/TabNavigation";
import { Id } from "../../convex/_generated/dataModel";

const TasksPage: React.FC = () => {
	const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);
	const [showAddTaskModal, setShowAddTaskModal] = useState(false);

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

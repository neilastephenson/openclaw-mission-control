import React, { useCallback, useState, useMemo, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header";
import AgentsSidebar from "../AgentsSidebar";
import RightSidebar from "../RightSidebar";
import TrayContainer from "../Trays/TrayContainer";
import AddAgentModal from "../AddAgentModal";
import AgentDetailTray from "../AgentDetailTray";
import { AgentFilterProvider, useAgentFilter } from "../../contexts/AgentFilterContext";
import { Id } from "../../../convex/_generated/dataModel";

function AppLayoutInner() {
	const { setSelectedAgentId } = useAgentFilter();
	const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
	const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
	const [showAddAgentModal, setShowAddAgentModal] = useState(false);
	const [selectedAgentIdForTray, setSelectedAgentIdForTray] = useState<Id<"agents"> | null>(null);

	// Document tray state
	const [selectedDocumentId, setSelectedDocumentId] = useState<Id<"documents"> | null>(null);
	const [showConversationTray, setShowConversationTray] = useState(false);
	const [showPreviewTray, setShowPreviewTray] = useState(false);

	const closeSidebars = useCallback(() => {
		setIsLeftSidebarOpen(false);
		setIsRightSidebarOpen(false);
	}, []);

	const isAnySidebarOpen = useMemo(
		() => isLeftSidebarOpen || isRightSidebarOpen,
		[isLeftSidebarOpen, isRightSidebarOpen],
	);

	useEffect(() => {
		if (!isAnySidebarOpen) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				closeSidebars();
			}
		};

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [closeSidebars, isAnySidebarOpen]);

	const handleSelectDocument = useCallback((id: Id<"documents"> | null) => {
		if (id === null) {
			setSelectedDocumentId(null);
			setShowConversationTray(false);
			setShowPreviewTray(false);
		} else {
			setSelectedDocumentId(id);
			setShowConversationTray(true);
			setShowPreviewTray(true);
		}
	}, []);

	const handlePreviewDocument = useCallback((id: Id<"documents">) => {
		setSelectedDocumentId(id);
		setShowConversationTray(true);
		setShowPreviewTray(true);
	}, []);

	const handleCloseConversation = useCallback(() => {
		setShowConversationTray(false);
		setShowPreviewTray(false);
		setSelectedDocumentId(null);
	}, []);

	const handleClosePreview = useCallback(() => {
		setShowPreviewTray(false);
	}, []);

	const handleOpenPreview = useCallback(() => {
		setShowPreviewTray(true);
	}, []);

	const handleSelectAgent = useCallback((agentId: string) => {
		setSelectedAgentIdForTray(agentId as Id<"agents">);
		setSelectedAgentId(agentId as Id<"agents">);
	}, [setSelectedAgentId]);

	return (
		<main className="app-container">
			<Header
				onOpenAgents={() => {
					setIsLeftSidebarOpen(true);
					setIsRightSidebarOpen(false);
				}}
				onOpenLiveFeed={() => {
					setIsRightSidebarOpen(true);
					setIsLeftSidebarOpen(false);
				}}
			/>

			{isAnySidebarOpen && (
				<div
					className="drawer-backdrop"
					onClick={closeSidebars}
					aria-hidden="true"
				/>
			)}

			<AgentsSidebar
				isOpen={isLeftSidebarOpen}
				onClose={() => setIsLeftSidebarOpen(false)}
				onAddAgent={() => setShowAddAgentModal(true)}
				onSelectAgent={handleSelectAgent}
			/>

			<div className="[grid-area:main] flex flex-col overflow-hidden">
				<Outlet />
			</div>

			<RightSidebar
				isOpen={isRightSidebarOpen}
				onClose={() => setIsRightSidebarOpen(false)}
				selectedDocumentId={selectedDocumentId}
				onSelectDocument={handleSelectDocument}
				onPreviewDocument={handlePreviewDocument}
			/>

			<TrayContainer
				selectedDocumentId={selectedDocumentId}
				showConversation={showConversationTray}
				showPreview={showPreviewTray}
				onCloseConversation={handleCloseConversation}
				onClosePreview={handleClosePreview}
				onOpenPreview={handleOpenPreview}
			/>

			{selectedAgentIdForTray && (
				<div
					className="fixed inset-0 z-[99]"
					onClick={() => {
						setSelectedAgentIdForTray(null);
						setSelectedAgentId(null);
					}}
					aria-hidden="true"
				/>
			)}
			<AgentDetailTray
				agentId={selectedAgentIdForTray}
				onClose={() => {
					setSelectedAgentIdForTray(null);
					setSelectedAgentId(null);
				}}
			/>

			{showAddAgentModal && (
				<AddAgentModal
					onClose={() => setShowAddAgentModal(false)}
					onCreated={() => setShowAddAgentModal(false)}
				/>
			)}
		</main>
	);
}

const AppLayout: React.FC = () => {
	return (
		<AgentFilterProvider>
			<AppLayoutInner />
		</AgentFilterProvider>
	);
};

export default AppLayout;

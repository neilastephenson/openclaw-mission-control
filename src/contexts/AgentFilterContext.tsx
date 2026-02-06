import { createContext, useContext, useState, ReactNode } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface AgentFilterContextType {
	selectedAgentId: Id<"agents"> | null;
	setSelectedAgentId: (id: Id<"agents"> | null) => void;
}

const AgentFilterContext = createContext<AgentFilterContextType | undefined>(
	undefined,
);

export function AgentFilterProvider({ children }: { children: ReactNode }) {
	const [selectedAgentId, setSelectedAgentId] = useState<Id<"agents"> | null>(
		null,
	);

	return (
		<AgentFilterContext.Provider value={{ selectedAgentId, setSelectedAgentId }}>
			{children}
		</AgentFilterContext.Provider>
	);
}

export function useAgentFilter() {
	const context = useContext(AgentFilterContext);
	if (context === undefined) {
		throw new Error("useAgentFilter must be used within AgentFilterProvider");
	}
	return context;
}

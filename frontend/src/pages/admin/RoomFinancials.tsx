import { useState } from "react";
import { AdminPageProps } from "../../constants/adminMenu";
import { AdminTabLayout } from "./AdminTabLayout";

export default function RoomFinancialsPage({ requiredPermission }: AdminPageProps) {
    const [activeTab, setActiveTab] = useState<"revenue" | "deposits" | "players" | "time">("revenue");

    return (
        <AdminTabLayout
            title="Room Financials"
            requiredPermission={requiredPermission}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onRefresh={() => {
                // Placeholder for refresh logic
            }}
            tabs={[
                {
                    id: "revenue",
                    label: "Revenue",
                    content: <div className="text-white">Revenue tab content (coming soon)</div>,
                },
                {
                    id: "deposits",
                    label: "Deposits",
                    content: <div className="text-white">Deposits tab content (coming soon)</div>,
                },
                {
                    id: "players",
                    label: "Players",
                    content: <div className="text-white">Players tab content (coming soon)</div>,
                },
                {
                    id: "time",
                    label: "Time Windows",
                    content: <div className="text-white">Time breakdown tab (coming soon)</div>,
                },
            ]}
        />
    );
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import PageLayout from "../../PageLayout";

type AdminTab<T extends string = string> = {
    id: T;
    label: string;
    content: React.ReactNode;
};

export function AdminTabLayout<T extends string>({
    title,
    tabs,
    activeTab,
    setActiveTab,
    onRefresh,
    requiredPermission,
}: {
    title: string;
    tabs: AdminTab<T>[];
    activeTab: T;
    setActiveTab: (tab: T) => void;
    onRefresh: () => void;
    requiredPermission?: string;
}) {
    const { permissions } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        console.log("[AdminTabLayout] Checking room permission", {
            requiredPermission,
            permissions
        });

        if (!permissions || permissions.room_permissions === undefined) return;

        console.log("[AdminTabLayout] Verifying permission:", requiredPermission);

        if (requiredPermission && permissions) {
            const hasPermission =
                permissions.global_permissions.includes(requiredPermission) ||
                permissions.room_permissions.includes(requiredPermission) ||
                permissions.event_permissions.includes(requiredPermission);

            if (!hasPermission) {
                navigate("/", { replace: true });
            }
        }
    }, [requiredPermission, permissions, navigate]);

    // While waiting for auth to resolve, avoid flicker
    if (requiredPermission && !permissions) {
        return null;
    }

    return (
        <PageLayout>
            <div className="p-8 text-white max-w-7xl mx-auto">
                <div className="mb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded"
                        onClick={onRefresh}
                    >
                        Refresh
                    </button>
                </div>

                <div className="mb-6 flex space-x-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-1 px-4 rounded ${activeTab === tab.id ? "bg-blue-600" : "bg-gray-700"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {tabs.find((tab) => tab.id === activeTab)?.content}
            </div>
        </PageLayout>
    );
}

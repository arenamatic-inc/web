import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { useSite } from "../../SiteContext";
import { AdminTabLayout } from "../admin/AdminTabLayout";
import { RoomFeeScheduleIn, RoomFeeScheduleOut } from "../../types/fees";
import { RoomFeeForm } from "../../components/RoomFeeForm";
import { RoomSelector } from "../../components/RoomSelector";

type RoomOption = {
    id: number;
    name: string;
    slug: string;
};

export default function RoomFeeAdminPage() {
    const { idToken, permissions } = useAuth();
    const { isArenamaticSite } = useSite();

    const [roomSlug, setRoomSlug] = useState<string | null>(null);
    const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);
    const [fees, setFees] = useState<RoomFeeScheduleOut[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const hasPermission = permissions?.global_permissions.includes("GlobalManageRoomFees");

    useEffect(() => {
        if (!isArenamaticSite || !idToken) return;

        fetch(`${import.meta.env.VITE_API_BASE}/room`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}), // still weird, but fine for now
        })
            .then(res => res.json())
            .then(data => {
                console.log("[RoomFetcher] Received rooms:", data);
                setRoomOptions(data);  // this updates your select input
            })
            .catch(err => {
                console.error("Failed to fetch rooms:", err);
            });
    }, [isArenamaticSite, idToken]);

    useEffect(() => {
        if (!roomSlug || !idToken) return;

        setLoading(true);
        fetch(`${import.meta.env.VITE_API_BASE}/web/admin/room-fees/${roomSlug}`, {
            headers: {
                Authorization: `Bearer ${idToken}`,
                "x-api-key": import.meta.env.VITE_API_KEY,
            },
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                return res.json();
            })
            .then((data) => setFees(data.fees || []))
            .catch((e) => setError(e.message || "Failed to load fee data"))
            .finally(() => setLoading(false));
    }, [roomSlug, idToken]);

    const handleSave = async (updated: RoomFeeScheduleIn[]) => {
        if (!roomSlug) return;

        const sanitized = updated.map((fee) => ({
            ...fee,
            percent: isNaN(fee.percent!) ? null : fee.percent,
            flat_cents: isNaN(fee.flat_cents!) ? null : fee.flat_cents,
            lower_bound_cents: fee.lower_bound_cents === 0 ? null : fee.lower_bound_cents,
            upper_bound_cents: fee.upper_bound_cents === 0 ? null : fee.upper_bound_cents,
        }));


        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/web/admin/room-fees/${roomSlug}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "x-api-key": import.meta.env.VITE_API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(sanitized),
            });

            if (!res.ok) throw new Error(await res.text());
            alert("Fee schedule updated.");
        } catch (err: any) {
            alert(`Failed to update fees: ${err.message}`);
        }
    };
    console.log("RoomFeeAdminPage", {
        permissions,
        hasPermission,
    });

    if (permissions === null) return <div>Loading permissions...</div>;

    if (!hasPermission) return <div className="p-6 text-red-600">Not authorized.</div>;

    return (
        <AdminTabLayout
            title="Room Fee Schedule"
            requiredPermission="GlobalManageRoomFees"
            activeTab="fees"
            setActiveTab={() => { }}
            onRefresh={() => { }}
            tabs={[
                {
                    id: "fees",
                    label: "Fee Schedule",
                    content: (
                        <div className="space-y-4">
                            {isArenamaticSite && (
                                <div className="mb-4">
                                    <label className="block font-medium text-sm mb-1 text-white">Select Room:</label>
                                    {isArenamaticSite && (
                                        <div className="mb-4">
                                            <RoomSelector
                                                value={roomSlug}
                                                onChange={setRoomSlug}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {loading && <div>Loading fee data...</div>}
                            {error && <div className="text-red-600">{error}</div>}
                            {!loading && !error && roomSlug && (
                                <RoomFeeForm
                                    initialFees={fees.map(f => ({
                                        revenue_type: f.revenue_type,
                                        pricing_model: f.pricing_model,
                                        percent: f.percent ?? null,
                                        flat_cents: f.flat_cents ?? null,
                                        lower_bound_cents: f.lower_bound_cents ?? null,
                                        upper_bound_cents: f.upper_bound_cents ?? null,
                                    }))}
                                    onSave={handleSave}
                                />
                            )}
                        </div>
                    ),
                },
            ]}
        />
    );
}

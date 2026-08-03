import { ReactNode, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { RoomSelector } from "../../components/RoomSelector";
import { AdminPageProps } from "../../constants/adminMenu";
import { getRoomSlug } from "../../utils/roomSlug";
import { AdminTabLayout } from "./AdminTabLayout";

type HealthTab = "overview" | "tables" | "tablets" | "controllers" | "unknown";

type HealthTableRow = {
    table_id: number;
    table_name: string;
    table_state: string;
    controller_id: number | null;
    controller_state: string;
    controller_last_seen_utc: string | null;
    controller_last_requestor_ip: string | null;
    tablet_table_id: number;
    tablet_state: string;
    tablet_last_seen_utc: string | null;
    tablet_last_requestor_ip: string | null;
};

type HealthControllerRow = {
    table_id: number;
    table_name: string;
    controller_id: number | null;
    health_state: string;
    last_seen_utc: string | null;
    last_requestor_ip: string | null;
};

type HealthTabletRow = {
    table_id: number;
    table_name: string;
    tablet_table_id: number;
    health_state: string;
    last_seen_utc: string | null;
    last_requestor_ip: string | null;
};

type HealthUnknownRow = {
    endpoint_type: string;
    identity: string;
    health_state: string;
    last_seen_utc: string | null;
    last_requestor_ip: string | null;
    reason?: string;
};

type RoomHealthResponse = {
    generated_at_utc: string | null;
    source_report_key: string;
    room: {
        id: number;
        slug: string;
        name: string;
    };
    state_counts: {
        healthy?: number;
        late?: number;
        down?: number;
        unknown?: number;
    };
    tables: HealthTableRow[];
    controllers: HealthControllerRow[];
    tablets: HealthTabletRow[];
    unknown_streams: HealthUnknownRow[];
    note?: string;
};

type RoomHealthPageProps = AdminPageProps & {
    initialRoomSlug?: string;
    enableRoomSelector?: boolean;
};

function stateBadgeClass(state: string): string {
    if (state === "healthy") return "bg-green-600 text-white";
    if (state === "late") return "bg-yellow-500 text-black";
    if (state === "down") return "bg-red-600 text-white";
    return "bg-gray-600 text-white";
}

function StatusBadge({ state }: { state: string }) {
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${stateBadgeClass(state)}`}>
            {state}
        </span>
    );
}

function fmtTs(value: string | null): string {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
}

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-gray-900/80 rounded-lg p-4 shadow min-w-[140px]">
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
        </div>
    );
}

function SimpleTable({
    headers,
    rows,
}: {
    headers: string[];
    rows: ReactNode[][];
}) {
    return (
        <div className="overflow-auto rounded border border-white/20">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-900/90">
                    <tr>
                        {headers.map((h) => (
                            <th key={h} className="text-left p-2 font-semibold text-gray-100">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => (
                        <tr key={idx} className="border-t border-white/10 even:bg-white/5">
                            {row.map((cell, cidx) => (
                                <td key={cidx} className="p-2 text-gray-100 align-top">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function RoomHealthPage({
    requiredPermission,
    initialRoomSlug,
    enableRoomSelector = false,
}: RoomHealthPageProps) {
    const { idToken } = useAuth();
    const [slug, setSlug] = useState<string | null>(initialRoomSlug ?? null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<HealthTab>("overview");
    const [data, setData] = useState<RoomHealthResponse | null>(null);

    useEffect(() => {
        if (!initialRoomSlug && !enableRoomSelector && slug === null) {
            (async () => {
                const s = await getRoomSlug();
                setSlug(s ?? "");
            })();
        }
    }, [initialRoomSlug, enableRoomSelector, slug]);

    const loadData = async () => {
        if (!slug || !idToken) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/health/summary/${slug}`,
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                        "x-api-key": import.meta.env.VITE_API_KEY,
                    },
                }
            );
            if (!res.ok) throw new Error(await res.text());
            setData(await res.json());
        } catch (e: any) {
            setError(e.message || "Unknown error");
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [slug, idToken]);

    const counts = useMemo(() => {
        return {
            healthy: data?.state_counts?.healthy ?? 0,
            late: data?.state_counts?.late ?? 0,
            down: data?.state_counts?.down ?? 0,
            unknown: data?.state_counts?.unknown ?? 0,
        };
    }, [data]);

    const withCommonHeader = (content: ReactNode) => (
        <div className="space-y-4">
            {enableRoomSelector && (
                <RoomSelector
                    value={slug}
                    onChange={(nextSlug) => {
                        localStorage.setItem("room_slug", nextSlug);
                        setSlug(nextSlug);
                    }}
                />
            )}
            {loading && <div className="text-sm text-gray-300">Loading room health...</div>}
            {error && <div className="text-sm text-red-400">{error}</div>}
            {!slug && <div className="text-sm text-gray-400">Select a room to view health.</div>}
            {content}
        </div>
    );

    const tabs = [
        {
            id: "overview" as const,
            label: "Overview",
            content: withCommonHeader(
                <div className="space-y-4">
                    <div className="flex gap-3 flex-wrap">
                        <SummaryCard label="Healthy" value={counts.healthy} />
                        <SummaryCard label="Late" value={counts.late} />
                        <SummaryCard label="Down" value={counts.down} />
                        <SummaryCard label="Unknown" value={counts.unknown} />
                    </div>

                    <div className="text-sm text-gray-300 space-y-1">
                        <div>Room: {data?.room?.name ?? "-"}</div>
                        <div>Room Slug: {data?.room?.slug ?? slug ?? "-"}</div>
                        <div>Generated At: {fmtTs(data?.generated_at_utc ?? null)}</div>
                        <div>Source Report Key: {data?.source_report_key ?? "-"}</div>
                        {data?.note && <div>Note: {data.note}</div>}
                    </div>
                </div>
            ),
        },
        {
            id: "tables" as const,
            label: `Tables (${data?.tables?.length ?? 0})`,
            content: withCommonHeader(
                <SimpleTable
                    headers={["Table", "State", "Controller", "Tablet"]}
                    rows={(data?.tables ?? []).map((row) => [
                        <div>
                            <div className="font-semibold">{row.table_name}</div>
                            <div className="text-xs text-gray-400">ID: {row.table_id}</div>
                        </div>,
                        <StatusBadge state={row.table_state} />,
                        <div>
                            <div>ID: {row.controller_id ?? "-"}</div>
                            <div><StatusBadge state={row.controller_state} /></div>
                            <div className="text-xs text-gray-400">Seen: {fmtTs(row.controller_last_seen_utc)}</div>
                            <div className="text-xs text-gray-400">IP: {row.controller_last_requestor_ip ?? "-"}</div>
                        </div>,
                        <div>
                            <div>table_id: {row.tablet_table_id}</div>
                            <div><StatusBadge state={row.tablet_state} /></div>
                            <div className="text-xs text-gray-400">Seen: {fmtTs(row.tablet_last_seen_utc)}</div>
                            <div className="text-xs text-gray-400">IP: {row.tablet_last_requestor_ip ?? "-"}</div>
                        </div>,
                    ])}
                />
            ),
        },
        {
            id: "tablets" as const,
            label: `Tablets (${data?.tablets?.length ?? 0})`,
            content: withCommonHeader(
                <SimpleTable
                    headers={["Table", "Tablet Identity", "State", "Last Seen", "IP"]}
                    rows={(data?.tablets ?? []).map((row) => [
                        `${row.table_name} (#${row.table_id})`,
                        String(row.tablet_table_id),
                        <StatusBadge state={row.health_state} />,
                        fmtTs(row.last_seen_utc),
                        row.last_requestor_ip ?? "-",
                    ])}
                />
            ),
        },
        {
            id: "controllers" as const,
            label: `Controllers (${data?.controllers?.length ?? 0})`,
            content: withCommonHeader(
                <SimpleTable
                    headers={["Table", "Controller ID", "State", "Last Seen", "IP"]}
                    rows={(data?.controllers ?? []).map((row) => [
                        `${row.table_name} (#${row.table_id})`,
                        row.controller_id != null ? String(row.controller_id) : "-",
                        <StatusBadge state={row.health_state} />,
                        fmtTs(row.last_seen_utc),
                        row.last_requestor_ip ?? "-",
                    ])}
                />
            ),
        },
        {
            id: "unknown" as const,
            label: `Unknown (${data?.unknown_streams?.length ?? 0})`,
            content: withCommonHeader(
                <SimpleTable
                    headers={["Endpoint", "Identity", "State", "Last Seen", "IP", "Reason"]}
                    rows={(data?.unknown_streams ?? []).map((row) => [
                        row.endpoint_type,
                        row.identity,
                        <StatusBadge state={row.health_state} />,
                        fmtTs(row.last_seen_utc),
                        row.last_requestor_ip ?? "-",
                        row.reason ?? "-",
                    ])}
                />
            ),
        },
    ];

    return (
        <AdminTabLayout
            title="Room Health"
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onRefresh={loadData}
            requiredPermission={requiredPermission}
        />
    );
}

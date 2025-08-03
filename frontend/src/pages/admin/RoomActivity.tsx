import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { AdminTabLayout } from "../admin/AdminTabLayout";
import { AdminTable } from "../admin/AdminTable";
import { getRoomSlug } from "../../utils/roomSlug";

import {
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    type ColumnDef,
    flexRender,
    SortingState,
} from "@tanstack/react-table";
import { AdminPageProps } from "../../constants/adminMenu";

export type MatchRow = {
    table_name: string;
    start: string;
    duration: number;
    players: string[];
    broadcast_id?: string | null;
    stream_status?: string | null;
};

export type DoorEventRow = {
    door_name: string;
    timestamp: string;
    user_name: string;
};

export default function RoomActivityPage({ requiredPermission }: AdminPageProps) {
    const { permissions, idToken } = useAuth();
    const [matchData, setMatchData] = useState<MatchRow[]>([]);
    const [doorData, setDoorData] = useState<DoorEventRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sortingMatches, setSortingMatches] = useState<SortingState>([]);
    const [sortingDoors, setSortingDoors] = useState<SortingState>([]);
    const [globalFilterMatches, setGlobalFilterMatches] = useState("");
    const [globalFilterDoors, setGlobalFilterDoors] = useState("");
    const [activeTab, setActiveTab] = useState<"matches" | "doors" | "streams">("matches");
    const [matchBefore, setMatchBefore] = useState<string | null>(null);
    const [doorBefore, setDoorBefore] = useState<string | null>(null);

    const loadData = async (append = false, matchBeforeParam: string | null = null, doorBeforeParam: string | null = null) => {
        if (!append) {
            setMatchBefore(null);
            setDoorBefore(null);
        }
        setLoading(true);
        setError("");
        try {
            const slug = await getRoomSlug();
            if (!slug) throw new Error("Room slug not found");

            const matchRes = await fetch(`${import.meta.env.VITE_API_BASE}/web/admin/recent-matches/${slug}?limit=50${matchBeforeParam ? `&before=${matchBeforeParam}` : ""}`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "x-api-key": import.meta.env.VITE_API_KEY,
                },
            });
            if (!matchRes.ok) throw new Error(await matchRes.text());
            const matchJson = await matchRes.json();
            const newMatches = matchJson.matches;
            setMatchData((prev) => append ? [...prev, ...newMatches] : newMatches);
            if (newMatches.length > 0) {
                const oldest = new Date(newMatches[newMatches.length - 1].start).getTime();
                setMatchBefore(new Date(oldest - 1000).toISOString());
            }

            const doorRes = await fetch(`${import.meta.env.VITE_API_BASE}/web/admin/door-events/${slug}?limit=50${doorBeforeParam ? `&before=${doorBeforeParam}` : ""}`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "x-api-key": import.meta.env.VITE_API_KEY,
                },
            });
            if (!doorRes.ok) throw new Error(await doorRes.text());
            const doorJson = await doorRes.json();
            const flat: DoorEventRow[] = [];
            if (Array.isArray(doorJson.door_activity)) {
                for (const entry of doorJson.door_activity) {
                    for (const open of entry.openings || []) {
                        flat.push({
                            door_name: entry.door_name,
                            timestamp: open.opened,
                            user_name: open.by,
                        });
                    }
                }
            }
            setDoorData((prev) => append ? [...prev, ...flat] : flat);
            if (flat.length > 0) {
                const oldest = new Date(flat[flat.length - 1].timestamp).getTime();
                setDoorBefore(new Date(oldest - 1000).toISOString());
            }
        } catch (e: any) {
            setError(e.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idToken) {
            loadData(false);
        }
    }, [idToken]);
    
    const filterFn = <T extends object>(row: any, _: unknown, filterValue: string) => {
        return Object.values(row.original).some((value) => {
            if (typeof value === "string") return value.toLowerCase().includes(filterValue.toLowerCase());
            if (Array.isArray(value)) return value.some((v) => v.toLowerCase().includes(filterValue.toLowerCase()));
            if (typeof value === "number") return value.toString().includes(filterValue);
            return false;
        });
    };

    const matchColumns: ColumnDef<MatchRow>[] = [
        { accessorKey: "table_name", header: "Table" },
        { accessorKey: "start", header: "Start Time", cell: (info) => new Date(info.getValue() as string).toLocaleString() },
        { accessorKey: "duration", header: "Duration (min)", cell: (info) => Math.round((info.getValue() as number) / 60) },
        { accessorKey: "players", header: "Players", cell: (info) => (info.getValue() as string[]).join(", ") },
        {
            header: "Stream",
            cell: (info) => {
                const row = info.row.original;
                if ((row.stream_status === "live" || row.stream_status === "ended" || row.stream_status === "bound") && row.broadcast_id) {
                    const url = `https://www.youtube.com/watch?v=${row.broadcast_id}`;
                    const label = row.stream_status === "live" ? "Watch Live" : "Watch VOD";
                    return (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                        >
                            {label}
                        </a>
                    );
                }
                return null;
            }
        }

    ];

    const doorColumns: ColumnDef<DoorEventRow>[] = [
        { accessorKey: "door_name", header: "Door" },
        { accessorKey: "timestamp", header: "Time", cell: (info) => new Date(info.getValue() as string).toLocaleString() },
        { accessorKey: "user_name", header: "User" },
    ];

    return (
        <AdminTabLayout
            title="Room Activity"
            requiredPermission={requiredPermission}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onRefresh={() => loadData(false)}
            tabs={[
                {
                    id: "matches",
                    label: "Room Activity",
                    content: (
                        <AdminTable
                            title="Recent Matches"
                            data={matchData}
                            columns={matchColumns}
                            sorting={sortingMatches}
                            setSorting={setSortingMatches}
                            globalFilter={globalFilterMatches}
                            setGlobalFilter={setGlobalFilterMatches}
                            onLoadMore={() => loadData(true, matchBefore, doorBefore)}
                        />
                    ),
                },
                {
                    id: "doors",
                    label: "Door Access",
                    content: (
                        <AdminTable
                            title="Door Open Events"
                            data={doorData}
                            columns={doorColumns}
                            sorting={sortingDoors}
                            setSorting={setSortingDoors}
                            globalFilter={globalFilterDoors}
                            setGlobalFilter={setGlobalFilterDoors}
                            onLoadMore={() => loadData(true, matchBefore, doorBefore)}
                        />
                    ),
                },
                {
                    id: "streams",
                    label: "Streams",
                    content: (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(
                                matchData.reduce((acc, match) => {
                                    if (!acc[match.table_name]) {
                                        acc[match.table_name] = match;
                                    } else if (new Date(match.start) > new Date(acc[match.table_name].start)) {
                                        acc[match.table_name] = match;
                                    }
                                    return acc;
                                }, {} as Record<string, MatchRow>)
                            )
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([tableName, match]) => {
                                    const valid = match.broadcast_id && ["live", "ended", "bound"].includes(match.stream_status ?? "");
                                    return (
                                        <div
                                            key={tableName}
                                            className="bg-black/20 border border-white/30 backdrop-blur-sm rounded p-4"
                                        >
                                            <div className="mb-2 font-bold text-white">{tableName}</div>
                                            <div className="aspect-video">
                                                {valid ? (
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${match.broadcast_id}?autoplay=1&mute=1`}
                                                        allow="autoplay; encrypted-media"
                                                        allowFullScreen
                                                        title={tableName}
                                                        className="w-full h-full rounded"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400 rounded">
                                                        No stream available
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    ),
                },
            ]}
        />
    );
}

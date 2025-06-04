import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import PageLayout from "../../PageLayout";
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

export type MatchRow = {
    table_name: string;
    start: string;
    duration: number;
    players: string[];
};

export type DoorEventRow = {
    door_name: string;
    timestamp: string;
    user_name: string;
};

export default function RoomActivityPage() {
    const { permissions, idToken } = useAuth();
    const [matchData, setMatchData] = useState<MatchRow[]>([]);
    const [doorData, setDoorData] = useState<DoorEventRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sortingMatches, setSortingMatches] = useState<SortingState>([]);
    const [sortingDoors, setSortingDoors] = useState<SortingState>([]);
    const [globalFilterMatches, setGlobalFilterMatches] = useState("");
    const [globalFilterDoors, setGlobalFilterDoors] = useState("");
    const [activeTab, setActiveTab] = useState<"matches" | "doors">("matches");
    const [matchBefore, setMatchBefore] = useState<string | null>(null);
    const [doorBefore, setDoorBefore] = useState<string | null>(null);

    const hasPermission = permissions?.room_permissions.includes("RoomReadActivity");

    const loadData = async (append = false) => {
        setLoading(true);
        setError("");
        try {
            const slug = await getRoomSlug();
            if (!slug) throw new Error("Room slug not found");

            const matchRes = await fetch(`${import.meta.env.VITE_API_BASE}/web/admin/recent-matches/${slug}?limit=50${matchBefore ? `&before=${matchBefore}` : ""}`, {
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

            const doorRes = await fetch(`${import.meta.env.VITE_API_BASE}/web/admin/door-events/${slug}?limit=50${doorBefore ? `&before=${doorBefore}` : ""}`, {
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
        loadData();
    }, []);

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
    ];

    const doorColumns: ColumnDef<DoorEventRow>[] = [
        { accessorKey: "door_name", header: "Door" },
        { accessorKey: "timestamp", header: "Time", cell: (info) => new Date(info.getValue() as string).toLocaleString() },
        { accessorKey: "user_name", header: "User" },
    ];

    const matchTable = useReactTable({
        data: matchData,
        columns: matchColumns,
        state: { sorting: sortingMatches, globalFilter: globalFilterMatches },
        onSortingChange: setSortingMatches,
        onGlobalFilterChange: setGlobalFilterMatches,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: filterFn,
    });

    const doorTable = useReactTable({
        data: doorData,
        columns: doorColumns,
        state: { sorting: sortingDoors, globalFilter: globalFilterDoors },
        onSortingChange: setSortingDoors,
        onGlobalFilterChange: setGlobalFilterDoors,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: filterFn,
    });

    return (
        <PageLayout>
            <div className="p-8 text-white max-w-7xl mx-auto">
                <div className="mb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Room Activity</h1>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded"
                        onClick={() => loadData(false)}
                    >
                        Refresh
                    </button>
                </div>

                <div className="mb-6 flex space-x-4">
                    <button
                        onClick={() => setActiveTab("matches")}
                        className={`py-1 px-4 rounded ${activeTab === "matches" ? "bg-blue-600" : "bg-gray-700"}`}
                    >
                        Room Activity
                    </button>
                    <button
                        onClick={() => setActiveTab("doors")}
                        className={`py-1 px-4 rounded ${activeTab === "doors" ? "bg-blue-600" : "bg-gray-700"}`}
                    >
                        Door Access
                    </button>
                </div>

                {loading && <div>Loading...</div>}
                {error && <div className="text-red-400">Error: {error}</div>}

                <input
                    type="text"
                    value={activeTab === "matches" ? globalFilterMatches : globalFilterDoors}
                    onChange={(e) =>
                        activeTab === "matches"
                            ? setGlobalFilterMatches(e.target.value)
                            : setGlobalFilterDoors(e.target.value)
                    }
                    placeholder="Search..."
                    className="mb-4 px-2 py-1 rounded border border-gray-600 bg-gray-900 text-white"
                />

                {activeTab === "matches" && (
                    <div className="overflow-x-auto border border-white/30 bg-black/20 backdrop-blur-sm rounded p-4">
                        <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
                        <table className="min-w-full text-sm">
                            <thead>
                                {matchTable.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="p-2 text-left font-bold cursor-pointer"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {{ asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string] ?? null}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {matchTable.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="border-t border-white/10">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="p-2">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4 text-center">
                            <button
                                className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded"
                                onClick={() => loadData(true)}
                            >
                                Load More
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "doors" && (
                    <div className="overflow-x-auto border border-white/30 bg-black/20 backdrop-blur-sm rounded p-4">
                        <h2 className="text-xl font-semibold mb-4">Door Open Events</h2>
                        <table className="min-w-full text-sm">
                            <thead>
                                {doorTable.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="p-2 text-left font-bold cursor-pointer"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {{ asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string] ?? null}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {doorTable.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="border-t border-white/10">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="p-2">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4 text-center">
                            <button
                                className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded"
                                onClick={() => loadData(true)}
                            >
                                Load More
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}

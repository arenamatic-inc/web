import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { RoomTransactionRow } from "../../types/webFinancials";
import { AdminTabLayout } from "../admin/AdminTabLayout";
import { AdminTable } from "../admin/AdminTable";
import { getRoomSlug } from "../../utils/roomSlug";
import {
    RoomFinancialSummary,
} from "../../types/webFinancials";
import { ColumnDef, SortingState } from "@tanstack/react-table";
// import { Card, CardContent } from "../../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { formatCurrency, formatShortDateTime } from "../../utils/format" // Utility for currency formatting
import { RoomSelector } from "../../components/RoomSelector";


type RoomFinancialsPageProps = {
    requiredPermission: string;
    initialRoomSlug?: string;
    enableRoomSelector?: boolean;
};

function SummaryCard({ label, value, color = "text-white" }: { label: string; value: number | string; color?: string }) {
    return (
        <div className={`rounded-lg p-4 shadow bg-gray-900/80 flex-1 min-w-[120px]`}>
            <div className="text-xs text-gray-400">{label}</div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
        </div>
    );
}

function Row({ label, value, color = "" }: { label: string; value: number | string; color?: string }) {
    return (
        <div className="flex justify-between items-center py-0.5">
            <span className="text-gray-200">{label}</span>
            <span className={`font-mono font-bold ${color}`}>{value}</span>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-black/40 rounded-xl shadow-md p-4 mb-4 min-w-[320px]">
            <div className="font-semibold text-md uppercase tracking-wide text-gray-400 mb-2 border-b border-gray-700 pb-1">
                {title}
            </div>
            {children}
        </div>
    );
}

export default function RoomFinancialsPage({
    requiredPermission,
    initialRoomSlug,
    enableRoomSelector = false
}: RoomFinancialsPageProps) {
    const { idToken } = useAuth();
    // const [slug, setSlug] = useState<string>(initialRoomSlug ?? "");
    const [slug, setSlug] = useState<string | null>(initialRoomSlug ?? (enableRoomSelector ? "" : null));
    const [summary, setSummary] = useState<RoomFinancialSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState("summary");
    const [error, setError] = useState("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [journalBefore, setJournalBefore] = useState<string | null>(null);
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [startDate, setStartDate] = useState<string>(startOfMonth.toISOString().slice(0, 10)); // "YYYY-MM-DD"
    const [endDate, setEndDate] = useState<string>(today.toISOString().slice(0, 10));
    const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        return {
            label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
            value: d.toISOString().slice(0, 7), // "YYYY-MM"
        };
    });

    useEffect(() => {
        if (!initialRoomSlug && !enableRoomSelector && slug === null) {
            (async () => {
                const s = await getRoomSlug();
                setSlug(s ?? ""); // Fallback to empty string if not found
            })();
        }
        // eslint-disable-next-line
    }, [initialRoomSlug, enableRoomSelector, slug]);

    useEffect(() => {
        if (!slug) return;
        setArenaTransactions([]);
        setArenaTransactionsOffset(0);
        setArenaTransactionsHasMore(true);
        loadMoreArenaTransactions(slug, 0, true, startDate, endDate);

        (async () => {
            setLoading(true);
            setError("");
            try {
                const headers = {
                    Authorization: `Bearer ${idToken}`,
                    "x-api-key": import.meta.env.VITE_API_KEY,
                };
                const summaryRes = await fetch(
                    `${import.meta.env.VITE_API_BASE}/web/financials/room-summary/${slug}?start_date=${startDate}&end_date=${endDate}`,
                    { headers }
                );
                if (!summaryRes.ok) throw new Error(await summaryRes.text());
                setSummary(await summaryRes.json());
            } catch (e: any) {
                setError(e.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        })();
    }, [idToken, slug, startDate, endDate]);

    useEffect(() => {
        // Clear out data any time slug changes
        setSummary(null);
        setError("");
        setLoading(false); // Optional, or true if you prefer spinner right away
    }, [slug]);

    const [arenaTransactions, setArenaTransactions] = useState<RoomTransactionRow[]>([]);
    const [arenaTransactionsOffset, setArenaTransactionsOffset] = useState(0);
    const [arenaTransactionsHasMore, setArenaTransactionsHasMore] = useState(true);
    const [sortingTransactions, setSortingTransactions] = useState<SortingState>([]);
    const [globalFilterTransactions, setGlobalFilterTransactions] = useState("");

    const roomTransactionColumns: ColumnDef<RoomTransactionRow>[] = [
        { accessorKey: "date", header: "Date", cell: info => formatShortDateTime(info.getValue() as string) },
        { accessorKey: "user", header: "User" },
        { accessorKey: "type", header: "Type", cell: info => (info.getValue() === "spend" ? "Spend" : "Refund") },
        { accessorKey: "revenue_type", header: "RType", cell: info => (info.getValue() ? info.getValue() : "") },
        { accessorKey: "amount", header: "Sale", cell: info => formatCurrency((info.getValue() as number) / 100) },
        { accessorKey: "tax", header: "Tax", cell: info => info.getValue() ? formatCurrency((info.getValue() as number) / 100) : "" },
        { accessorKey: "bonus_spend", header: "Bonus Used", cell: info => info.getValue() ? formatCurrency((info.getValue() as number) / 100) : "" },
        { accessorKey: "room_spend", header: "Room Wallet", cell: info => info.getValue() ? formatCurrency((info.getValue() as number) / 100) : "" },
        { accessorKey: "arenamatic_spend", header: "Arena Wallet", cell: info => info.getValue() ? formatCurrency((info.getValue() as number) / 100) : "" },
        { accessorKey: "arenamatic_fee", header: "Platform Fee", cell: info => info.getValue() ? formatCurrency((info.getValue() as number) / 100) : "" },
        { accessorKey: "processing_fee", header: "Processing Fee", cell: info => info.getValue() ? formatCurrency((info.getValue() as number) / 100) : "" },
        // { accessorKey: "revenue", header: "Revenue", cell: info => info.getValue() ? formatCurrency((info.getValue() as number) / 100) : "" },
        // { accessorKey: "due_to_club", header: "Due to Club", cell: info => info.getValue() ? formatCurrency((info.getValue() as number) / 100) : "" },
        // { accessorKey: "note", header: "Note" },
    ];

    const loadMoreArenaTransactions = async (
        _slug = slug,
        offset = arenaTransactionsOffset,
        reset = false,
        start = startDate,
        end = endDate
    ) => {
        if (!_slug || (!arenaTransactionsHasMore && !reset)) return;
        setLoading(true);
        try {
            const headers = {
                Authorization: `Bearer ${idToken}`,
                "x-api-key": import.meta.env.VITE_API_KEY,
            };
            const limit = 100;
            const url = `${import.meta.env.VITE_API_BASE}/web/financials/spend-refund/${_slug}?limit=${limit}&offset=${offset}&start_date=${start}&end_date=${end}`;
            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error(await res.text());
            const newRows = await res.json();
            if (reset) {
                setArenaTransactions(newRows);
                setArenaTransactionsOffset(newRows.length);
                setArenaTransactionsHasMore(newRows.length === limit);
            } else {
                setArenaTransactions(prev => [...prev, ...newRows]);
                setArenaTransactionsOffset(prev => prev + newRows.length);
                setArenaTransactionsHasMore(newRows.length === limit);
            }
        } catch (e: any) {
            setError(e.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    // if (enableRoomSelector) {
    //     return (
    //         <div className="max-w-2xl mx-auto py-12">
    //             <RoomSelector value={slug} onChange={setSlug} />
    //             <div className="text-gray-400 mt-4">Please select a room to view financials.</div>
    //         </div>
    //     );
    // }

    // --- Render ---
    return (
        <div>
            {enableRoomSelector && (
                <div className="mb-6 max-w-2xl mx-auto mt-20">
                    <RoomSelector value={slug} onChange={setSlug} />
                    {!slug && (
                        <div className="text-gray-400 mt-4">Please select a room to view financials.</div>
                    )}
                </div>
            )}
            {(slug) && (
                <div>
                    {/* Date Range Controls */}

                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <select
                            value={startDate.slice(0, 7)}
                            onChange={e => {
                                const [year, month] = e.target.value.split('-');
                                setStartDate(new Date(Number(year), Number(month) - 1, 1).toISOString().slice(0, 10));
                                // End = last day of month
                                setEndDate(new Date(Number(year), Number(month), 0).toISOString().slice(0, 10));
                            }}
                            className="px-2 py-1 border rounded"
                        >
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>

                        <label>
                            Start:
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="ml-2 px-2 py-1 border rounded"
                            />
                        </label>
                        <label>
                            End:
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="ml-2 px-2 py-1 border rounded"
                            />
                        </label>
                    </div>

                    <AdminTabLayout
                        title="Financial Reporting"
                        requiredPermission={requiredPermission}
                        activeTab={tab}
                        setActiveTab={setTab}
                        onRefresh={() => window.location.reload()}
                        tabs={[
                            {
                                id: "summary",
                                label: "Summary",
                                content: (
                                    <div>
                                        <div className="w-full max-w-4xl mx-auto">
                                            {/* Side-by-side for first two sections */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                {/* Player Spend (Left) */}
                                                <Section title="Sales">
                                                    {summary?.revenue_by_type &&
                                                        Object.entries(summary.revenue_by_type).map(([typ, breakdown]) => (
                                                            <div key={typ} className="mb-2">
                                                                <div className="font-semibold text-sm text-gray-300 mb-1">
                                                                    {typ.replaceAll('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                                                                </div>
                                                                <Row label="Sales:" value={formatCurrency(((breakdown.sales_cents ?? 0)) / 100)} />
                                                                <Row label="Tax Collected:" value={formatCurrency((breakdown.tax_collected_cents ?? 0) / 100)} />
                                                                <div className="border-t border-gray-800 mt-2 mb-2" />
                                                            </div>
                                                        ))
                                                    }
                                                    {/* Overall Totals */}
                                                    <div className="border-t border-gray-700 mt-2 mb-1" />
                                                    <Row label="Total Player Spend:" value={formatCurrency((summary?.total_player_spend_cents ?? 0) / 100)} />
                                                </Section>

                                                {/* Payment Sources (Right) */}
                                                <Section title="Room Wallets">
                                                    <Row label="Total Sales:" value={
                                                        formatCurrency(((summary?.room_wallet_spend_cents ?? 0) -
                                                            (summary?.tax_collected_cents ?? 0) +
                                                            (summary?.arenamatic_tax_collected ?? 0)) / 100)} />
                                                    <Row label="Tax Collected:" value={
                                                        formatCurrency(((summary?.tax_collected_cents ?? 0) -
                                                            (summary?.arenamatic_tax_collected ?? 0)) / 100)} />
                                                    <Row label="Player Spend:" value={
                                                        formatCurrency((summary?.room_wallet_spend_cents ?? 0) / 100)} />
                                                    <Row label="Arenamatic Fees:" value={
                                                        formatCurrency((summary?.arenamatic_fees_from_room_wallet ?? 0) / 100)} />
                                                </Section>
                                                <Section title="Global Wallets">
                                                    <Row label="Total Sales:" value={
                                                        formatCurrency(((summary?.arenamatic_wallet_spend_cents ?? 0) - (summary?.arenamatic_tax_collected ?? 0)) / 100)} />
                                                    <Row label="Tax Collected:" value={
                                                        formatCurrency(((summary?.arenamatic_tax_collected ?? 0)) / 100)} />
                                                    <Row label="Player Spend:" value=
                                                        {formatCurrency((summary?.arenamatic_wallet_spend_cents ?? 0) / 100)} />
                                                    <Row label="Arenamatic Fees:" value={
                                                        formatCurrency(((summary?.arenamatic_fee_cents ?? 0) -
                                                            (summary?.arenamatic_fees_from_room_wallet ?? 0)) / 100)} />
                                                    <Row label="Processing Fees:" value={
                                                        formatCurrency(((summary?.stripe_clawback_cents ?? 0)) / 100)} />
                                                </Section>
                                            </div>
                                            {/* ───── Settlement ───── */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <Section title="Arenamatic Fees">
                                                    {summary?.fees_by_type &&
                                                        Object.entries(summary.fees_by_type).map(([typ, breakdown]) => (
                                                            <div key={typ} className="mb-2">
                                                                <div className="font-semibold text-sm text-gray-300 mb-1">
                                                                    {typ.replaceAll('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                                                                </div>
                                                                <Row label="Processing Fees:" value={formatCurrency((breakdown.processing_fees_cents ?? 0) / 100)} />
                                                                <Row label="Arenamatic Share:" value={formatCurrency((breakdown.arenamatic_share_cents ?? 0) / 100)} />
                                                                <Row label="Total:" value={formatCurrency((breakdown.total_fees_cents ?? 0) / 100)} />
                                                                <div className="border-t border-gray-800 mt-2 mb-2" />
                                                            </div>
                                                        ))
                                                    }
                                                    <div className="border-t border-gray-700 mt-2 mb-1" />
                                                    <Row label="Total Processing Fees:" value={formatCurrency((summary?.stripe_clawback_due_cents ?? 0) / 100)} />
                                                    <Row label="Total Arenamatic Share:" value={formatCurrency((summary?.arenamatic_fees_due_cents ?? 0) / 100)} />
                                                    <Row label="Total Fees:" value={formatCurrency(((summary?.stripe_clawback_due_cents ?? 0) + (summary?.arenamatic_fees_due_cents ?? 0)) / 100)} />
                                                </Section>


                                                <Section title="Settlement">
                                                    <Section title="Due to room">
                                                        <Row label="Sales:" value={formatCurrency(((summary?.arenamatic_wallet_spend_cents ?? 0) - (summary?.arenamatic_tax_collected ?? 0)) / 100)} />
                                                        <Row label="+ Tax Collected:" value={formatCurrency((summary?.arenamatic_tax_collected ?? 0) / 100)} />
                                                        <Row label="- Arenamatic Fees:" value={formatCurrency(((summary?.arenamatic_fee_cents ?? 0) - (summary?.arenamatic_fees_from_room_wallet ?? 0)) / 100)} />
                                                        <Row label="- Processing Fees:" value={formatCurrency(((summary?.stripe_clawback_cents ?? 0)) / 100)} />
                                                        <Row label="= Total Due to Room:" value={formatCurrency(((summary?.arenamatic_wallet_spend_cents ?? 0) - ((summary?.arenamatic_fee_cents ?? 0) - (summary?.arenamatic_fees_from_room_wallet ?? 0)) - ((summary?.stripe_clawback_cents ?? 0))) / 100)} color={(((summary?.arenamatic_wallet_spend_cents ?? 0)) - ((summary?.arenamatic_fee_cents ?? 0) - (summary?.arenamatic_fees_from_room_wallet ?? 0)) - ((summary?.stripe_clawback_cents ?? 0))) < 0 ? "text-green-400" : ""} />

                                                    </Section>
                                                    <Section title="Due to Arenamatic">
                                                        <Row label="Arenamatic Fees:" value={formatCurrency((summary?.arenamatic_fees_from_room_wallet ?? 0) / 100)} />
                                                    </Section>
                                                    <Section title="Net Settlement">
                                                        <div className="border-t border-gray-700 mt-2 mb-1" />
                                                        <Row
                                                            label={((summary?.arenamatic_wallet_spend_cents ?? 0) - ((summary?.arenamatic_fee_cents ?? 0) - (summary?.arenamatic_fees_from_room_wallet ?? 0)) - ((summary?.stripe_clawback_cents ?? 0)) - (summary?.arenamatic_fees_from_room_wallet ?? 0)) / 100 > 0 ? "Arenamatic Owes Room:" : "Room Owes Arenamatic:"}
                                                            value={formatCurrency(((summary?.arenamatic_wallet_spend_cents ?? 0) - ((summary?.arenamatic_fee_cents ?? 0) - (summary?.arenamatic_fees_from_room_wallet ?? 0)) - ((summary?.stripe_clawback_cents ?? 0)) - (summary?.arenamatic_fees_from_room_wallet ?? 0)) / 100)}
                                                            color={((summary?.arenamatic_wallet_spend_cents ?? 0) - ((summary?.arenamatic_fee_cents ?? 0) - (summary?.arenamatic_fees_from_room_wallet ?? 0)) - ((summary?.stripe_clawback_cents ?? 0)) - (summary?.arenamatic_fees_from_room_wallet ?? 0)) < 0 ? "text-green-400" : ""}
                                                        />
                                                    </Section>
                                                </Section>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <Section title="Bonus Liability">
                                                    <Row label={`Opening Bonus Outstanding (${summary?.period_start})`} value={formatCurrency((summary?.bonus?.opening_outstanding_cents ?? 0) / 100)} />
                                                    <Row label="Net Bonus Granted:" value={formatCurrency((summary?.bonus?.net_granted_cents ?? 0) / 100)} />
                                                    <Row label="Net Bonus Consumed:" value={formatCurrency((summary?.bonus?.net_consumed_cents ?? 0) / 100)} />
                                                    <div className="border-t border-gray-700 mt-2 mb-1" />
                                                    <Row label={`Closing Bonus Outstanding (${summary?.period_end})`} value={formatCurrency((summary?.bonus?.closing_outstanding_cents ?? 0) / 100)} />
                                                </Section>
                                                {/* ───── User Liability ───── */}
                                                <Section title="Room User Liability">
                                                    <Row label={`Opening Liability (${summary?.period_start})`} value={formatCurrency((summary?.opening_liability_cents ?? 0) / 100)} />
                                                    <Row label="Net Deposits:" value={formatCurrency((summary?.net_deposits_cents ?? 0) / 100)} />
                                                    <Row label="– Room Wallet Spend:" value={formatCurrency((summary?.room_wallet_spend_period_cents ?? 0) / 100)} />
                                                    <div className="border-t border-gray-700 mt-2 mb-1" />
                                                    <Row label={`Closing Liability (${summary?.period_end})`} value={formatCurrency((summary?.closing_liability_cents ?? 0) / 100)} />
                                                </Section>
                                            </div>                                </div>

                                    </div>
                                )
                            },
                            {
                                id: "transactions",
                                label: "Spend/Refunds",
                                content: (
                                    <AdminTable
                                        title="Spend / Refunds"
                                        data={arenaTransactions}
                                        columns={roomTransactionColumns}
                                        sorting={sortingTransactions}
                                        setSorting={setSortingTransactions}
                                        globalFilter={globalFilterTransactions}
                                        setGlobalFilter={setGlobalFilterTransactions}
                                        onLoadMore={
                                            arenaTransactionsHasMore
                                                ? () => loadMoreArenaTransactions(slug, arenaTransactionsOffset, false, startDate, endDate)
                                                : undefined
                                        }
                                    />
                                ),
                            },

                        ]}
                    />
                </div>)}
        </div>
    );
}

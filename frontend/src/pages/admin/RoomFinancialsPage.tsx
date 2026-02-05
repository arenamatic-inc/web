import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { RoomFinancialsMonthlyRow, RoomFinancialsMonthlySummaryResponse, RoomTransactionRow } from "../../types/webFinancials";
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

function Row({ label, value, color = "" }: { label: string; value: React.ReactNode; color?: string }) {
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

async function handleRefund(row: RoomTransactionRow, slug: string, idToken: string) {
    // Optionally, show a confirmation dialog here
    if (!window.confirm("Are you sure you want to refund this transaction?")) return;

    try {
        const headers = {
            Authorization: `Bearer ${idToken}`,
            "x-api-key": import.meta.env.VITE_API_KEY,
        };

        const resp = await fetch(`${import.meta.env.VITE_WEB_FIN_API_BASE}/web/financials/refund/${slug}`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ original_tx_id: row.id }) // or row.tx_id or whatever key is correct
        });
        if (!resp.ok) throw new Error(await resp.text());
        // Optionally, refresh table data after
        alert("Refund issued.");
        // refetch or mutate your data here
    } catch (err) {
        alert("Refund failed: " + err);
    }
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

    const [monthlyRows, setMonthlyRows] = useState<RoomFinancialsMonthlyRow[]>([]);
    const [monthlyLoading, setMonthlyLoading] = useState(false);
    const [monthlyError, setMonthlyError] = useState("");


    useEffect(() => {
        if (!slug) return;
        setMonthlyRows([]);
        setMonthlyLoading(true);
        setMonthlyError("");
        (async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${idToken}`,
                    "x-api-key": import.meta.env.VITE_API_KEY,
                };
                const res = await fetch(
                    `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/financials/monthly-summary/${slug}?months=24`,
                    { headers }
                );
                if (!res.ok) throw new Error(await res.text());
                const data: RoomFinancialsMonthlySummaryResponse = await res.json();
                setMonthlyRows(data.months || []);
            } catch (e: any) {
                setMonthlyError(e.message || "Unknown error");
            } finally {
                setMonthlyLoading(false);
            }
        })();
    }, [idToken, slug]);

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

        setDepositWithdrawalRows([]);
        setDepositWithdrawalOffset(0);
        setDepositWithdrawalHasMore(true);
        loadMoreDepositWithdrawal(slug, 0, true, startDate, endDate);

        setBonusRows([]);
        setBonusOffset(0);
        setBonusHasMore(true);
        loadMoreBonus(slug, 0, true, startDate, endDate);


        (async () => {
            setLoading(true);
            setError("");
            try {
                const headers = {
                    Authorization: `Bearer ${idToken}`,
                    "x-api-key": import.meta.env.VITE_API_KEY,
                };
                const summaryRes = await fetch(
                    `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/financials/room-summary/${slug}?start_date=${startDate}&end_date=${endDate}`,
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
        {
            id: "refund",
            header: "Refund",
            cell: info => {
                const row = info.row.original as RoomTransactionRow;
                // Show button if not already a refund and not already refunded
                if (!row.is_refund && !row.refunded) {
                    return (
                        <button
                            className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-white"
                            onClick={() => {
                                if (!slug || !idToken) return;
                                handleRefund(row, slug, idToken);
                            }}
                        >
                            Refund
                        </button>
                    );
                } else if (row.refunded) {
                    // You can use a badge, crossed-out text, etc.
                    return <span className="text-xs text-red-500 font-semibold">Refunded</span>;
                } else if (row.is_refund) {
                    return <span className="text-xs text-gray-400 italic">Reversal</span>;
                }
                return null;
            }
        }
    ];

    const monthlyColumns: ColumnDef<RoomFinancialsMonthlyRow>[] = [
        {
            id: "month",
            header: "Month",
            cell: info => {
                const row = info.row.original as RoomFinancialsMonthlyRow;
                // Use period_start field (with fallback in case field names change)
                const dateString = row.period_start || row.month || row.period_end || "";
                // Diagnostic: log what we're parsing
                console.log("Trying to parse date:", dateString);

                const dt = new Date(dateString);
                // Diagnostic: log result
                console.log("Parsed Date:", dt);

                const label = isNaN(dt.getTime())
                    ? "?"
                    : dt.toLocaleString('default', { month: 'short', year: 'numeric' });
                return (
                    <button
                        className="underline text-blue-400 hover:text-blue-600"
                        onClick={() => {
                            setStartDate(row.period_start?.slice(0, 10) ?? "");
                            setEndDate(row.period_end?.slice(0, 10) ?? "");
                            setTab("summary");
                        }}
                        title="View details for this month"
                    >
                        {label}
                    </button>
                );
            },
        },
        { accessorKey: "sales_platform_cents", header: "Sales Platform", cell: info => formatCurrency(info.getValue() as number / 100) },
        { accessorKey: "sales_room_cents", header: "Sales Room", cell: info => formatCurrency(info.getValue() as number / 100) },
        { accessorKey: "sales_total_cents", header: "Sales Total", cell: info => formatCurrency(info.getValue() as number / 100) },
        { accessorKey: "tax_platform_cents", header: "Tax Platform", cell: info => formatCurrency(info.getValue() as number / 100) },
        { accessorKey: "tax_room_cents", header: "Tax Room", cell: info => formatCurrency(info.getValue() as number / 100) },
        { accessorKey: "tax_total_cents", header: "Tax Total", cell: info => formatCurrency(info.getValue() as number / 100) },
        { accessorKey: "arenamatic_fees_platform_cents", header: "Fees Platform", cell: info => formatCurrency(info.getValue() as number / 100) },
        { accessorKey: "arenamatic_fees_room_cents", header: "Fees Room", cell: info => formatCurrency(info.getValue() as number / 100) },
        { accessorKey: "arenamatic_fees_total_cents", header: "Fees Total", cell: info => formatCurrency(info.getValue() as number / 100) },
        { accessorKey: "processing_fees_cents", header: "Processing", cell: info => formatCurrency(info.getValue() as number / 100) },
        { accessorKey: "net_cents", header: "Net", cell: info => <span className="font-bold">{formatCurrency(info.getValue() as number / 100)}</span> },
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
            const url = `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/financials/spend-refund/${_slug}?limit=${limit}&offset=${offset}&start_date=${start}&end_date=${end}`;
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

    const [depositWithdrawalRows, setDepositWithdrawalRows] = useState<RoomTransactionRow[]>([]);
    const [depositWithdrawalOffset, setDepositWithdrawalOffset] = useState(0);
    const [depositWithdrawalHasMore, setDepositWithdrawalHasMore] = useState(true);

    const loadMoreDepositWithdrawal = async (
        _slug = slug,
        offset = depositWithdrawalOffset,
        reset = false,
        start = startDate,
        end = endDate
    ) => {
        if (!_slug || (!depositWithdrawalHasMore && !reset)) return;
        setLoading(true);
        try {
            const headers = {
                Authorization: `Bearer ${idToken}`,
                "x-api-key": import.meta.env.VITE_API_KEY,
            };
            const limit = 100;
            const url = `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/financials/deposits-withdrawals/${_slug}?limit=${limit}&offset=${offset}&start_date=${start}&end_date=${end}`;
            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error(await res.text());
            const newRows = await res.json();
            if (reset) {
                setDepositWithdrawalRows(newRows);
                setDepositWithdrawalOffset(newRows.length);
                setDepositWithdrawalHasMore(newRows.length === limit);
            } else {
                setDepositWithdrawalRows(prev => [...prev, ...newRows]);
                setDepositWithdrawalOffset(prev => prev + newRows.length);
                setDepositWithdrawalHasMore(newRows.length === limit);
            }
        } catch (e: any) {
            setError(e.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    // --- Bonus Grant/Revoke Transactions ---
    const [bonusRows, setBonusRows] = useState<RoomTransactionRow[]>([]);
    const [bonusOffset, setBonusOffset] = useState(0);
    const [bonusHasMore, setBonusHasMore] = useState(true);

    const loadMoreBonus = async (
        _slug = slug,
        offset = bonusOffset,
        reset = false,
        start = startDate,
        end = endDate
    ) => {
        if (!_slug || (!bonusHasMore && !reset)) return;
        setLoading(true);
        try {
            const headers = {
                Authorization: `Bearer ${idToken}`,
                "x-api-key": import.meta.env.VITE_API_KEY,
            };
            const limit = 100;
            const url = `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/financials/bonus-grant-revoke/${_slug}?limit=${limit}&offset=${offset}&start_date=${start}&end_date=${end}`;
            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error(await res.text());
            const newRows = await res.json();
            if (reset) {
                setBonusRows(newRows);
                setBonusOffset(newRows.length);
                setBonusHasMore(newRows.length === limit);
            } else {
                setBonusRows(prev => [...prev, ...newRows]);
                setBonusOffset(prev => prev + newRows.length);
                setBonusHasMore(newRows.length === limit);
            }
        } catch (e: any) {
            setError(e.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };


    if (!enableRoomSelector && slug === null) {
        return <div className="text-gray-400 mt-20 text-center">Loading club info...</div>;
    }

    return (
        <div>
            {enableRoomSelector ? (
                <div className="mb-6 max-w-2xl mx-auto mt-20">
                    <RoomSelector value={slug ?? ""} onChange={setSlug} />
                    {!slug && (
                        <div className="text-gray-400 mt-4">Please select a room to view financials.</div>
                    )}
                </div>
            ) : (
                // Render equivalent blank space to match layout in club case
                <div className="mt-20" />
            )}


            {/* Date Range Controls: always render when we have a slug */}
            {slug && (
                <>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <select
                            value={startDate.slice(0, 7)}
                            onChange={e => {
                                const [year, month] = e.target.value.split('-');
                                setStartDate(new Date(Number(year), Number(month) - 1, 1).toISOString().slice(0, 10));
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
                                id: "monthly_summary",
                                label: "Monthly Summary",
                                content: (
                                    monthlyLoading ? (
                                        <div className="text-gray-400 p-8 text-center">Loading…</div>
                                    ) : monthlyError ? (
                                        <div className="text-red-400 p-8 text-center">{monthlyError}</div>
                                    ) : (
                                        <AdminTable
                                            title="Monthly Financial Summary"
                                            data={monthlyRows}
                                            columns={monthlyColumns}
                                            sorting={sorting}
                                            setSorting={setSorting}
                                            globalFilter={globalFilterTransactions}
                                            setGlobalFilter={setGlobalFilterTransactions}
                                        // You could add row click to deep-link to that month's summary
                                        />
                                    )
                                )
                            },
                            {
                                id: "summary",
                                label: "Summary",
                                content: (
                                    <div>
                                        {summary ? (
                                            <div className="w-full max-w-6xl mx-auto">
                                                {/* ===== Top Row: Sales, Room Wallets, Global Wallets ===== */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                    {/* SALES (by type and total) */}
                                                    <Section title="All Sales (Excl Bonus)">
                                                        {summary.all_wallet_breakdown && Object.entries(summary.all_wallet_breakdown).map(([typ, breakdown]) => (
                                                            <div key={typ} className="mb-2">
                                                                <div className="font-semibold text-sm text-gray-300 mb-1">
                                                                    {typ.replaceAll('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                                                                </div>
                                                                <Row label="Sales:" value={formatCurrency(breakdown.sales_cents / 100)} />
                                                                <Row label="Tax Collected:" value={formatCurrency(breakdown.tax_collected_cents / 100)} />
                                                                <Row label="Arenamatic Fees:" value={formatCurrency(breakdown.arenamatic_fee_cents / 100)} />
                                                                <Row label="Processing Fees:" value={formatCurrency(breakdown.stripe_clawback_cents / 100)} />
                                                            </div>
                                                        ))}
                                                        {/* <div className="border-t border-gray-700 mt-2 mb-1" />
                                                        <Row label="Total Player Spend:" value={
                                                            <span className="font-bold text-lg">
                                                                {formatCurrency((summary.room_wallet_sales_cents + summary.room_wallet_tax_cents + summary.room_wallet_arenamatic_fees_cents) / 100)}
                                                            </span>
                                                        } color="text-white" /> */}
                                                    </Section>

                                                    {/* ROOM WALLETS */}
                                                    <Section title="Room Wallets">
                                                        <Row label="Sales:" value={<span className="font-bold">{formatCurrency(summary.room_wallet_sales_cents / 100)}</span>} />
                                                        <Row label="Tax Collected:" value={formatCurrency(summary.room_wallet_tax_cents / 100)} />
                                                        {/* <Row label="Player Spend:" value={formatCurrency((summary.room_wallet_sales_cents + summary.room_wallet_tax_cents) / 100)} /> */}
                                                        <Row label="Arenamatic Fees:" value={formatCurrency(summary.room_wallet_arenamatic_fees_cents / 100)} />
                                                    </Section>

                                                    {/* GLOBAL (PLATFORM) WALLETS */}
                                                    <Section title="Platform Wallets">
                                                        <Row label="Sales:" value={<span className="font-bold">{formatCurrency(summary.platform_wallet_sales_cents / 100)}</span>} />
                                                        <Row label="Tax Collected:" value={formatCurrency(summary.platform_wallet_tax_cents / 100)} />
                                                        {/* <Row label="Player Spend:" value={formatCurrency((summary.platform_wallet_sales_cents + summary.platform_wallet_tax_cents) / 100)} /> */}
                                                        <Row label="Arenamatic Fees:" value={formatCurrency(summary.platform_wallet_arenamatic_fees_cents / 100)} />
                                                        <Row label="Processing Fees:" value={formatCurrency(summary.platform_processing_fees_cents / 100)} />
                                                    </Section>
                                                </div>

                                                {/* ===== Second Row: Arenamatic Fees, Settlement ===== */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                    {/* ARENAMATIC FEES */}
                                                    {/* <Section title="Arenamatic Fees">
                                                        {summary.platform_wallet_breakdown && Object.entries(summary.platform_wallet_breakdown).map(([typ, breakdown]) => (
                                                            <div key={typ} className="mb-2">
                                                                <div className="font-semibold text-sm text-gray-300 mb-1">
                                                                    {typ.replaceAll('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                                                                </div>
                                                                <Row label="Processing Fees:" value={formatCurrency(breakdown.stripe_clawback_cents / 100)} />
                                                                <Row label="Arenamatic Share:" value={formatCurrency(breakdown.arenamatic_fee_cents / 100)} />
                                                                <Row label="Total:" value={formatCurrency((breakdown.stripe_clawback_cents + breakdown.arenamatic_fee_cents) / 100)} />
                                                                <div className="border-t border-gray-800 mt-2 mb-2" />
                                                            </div>
                                                        ))}
                                                        <Row label="Total Processing Fees:" value={formatCurrency(summary.platform_processing_fees_cents / 100)} />
                                                        <Row label="Total Arenamatic Share:" value={formatCurrency(summary.platform_wallet_arenamatic_fees_cents / 100)} />
                                                        <Row label="Total Fees:" value={formatCurrency((summary.platform_processing_fees_cents + summary.platform_wallet_arenamatic_fees_cents) / 100)} />
                                                    </Section>
 */}
                                                    {/* SETTLEMENT */}
                                                    <Section title="Settlement">
                                                        <Section title="Due to Room">
                                                            <Row label="Sales:" value={formatCurrency(summary.platform_wallet_sales_cents / 100)} />
                                                            <Row label="+ Tax Collected:" value={formatCurrency(summary.platform_wallet_tax_cents / 100)} />
                                                            <Row label="- Arenamatic Fees:" value={formatCurrency(summary.platform_wallet_arenamatic_fees_cents / 100)} />
                                                            <Row label="- Processing Fees:" value={formatCurrency(summary.platform_processing_fees_cents / 100)} />
                                                            <Row label="= Total Due to Room:" value={
                                                                <span className="font-bold text-lg">
                                                                    {formatCurrency(summary.total_due_to_room_cents / 100)}
                                                                </span>
                                                            } color="text-white" />
                                                        </Section>
                                                        <Section title="Due to Arenamatic">
                                                            <Row label="Arenamatic Fees:" value={formatCurrency(summary.room_wallet_arenamatic_fees_cents / 100)} />
                                                        </Section>
                                                        <Section title="Net Settlement">
                                                            <Row
                                                                label="Arenamatic Owes Room:"
                                                                value={<span className="font-bold text-lg">{formatCurrency(summary.total_due_to_room_cents / 100 - summary.room_wallet_arenamatic_fees_cents / 100)}</span>}
                                                                color="text-white"
                                                            />
                                                        </Section>
                                                    </Section>
                                                    {/* BONUS LIABILITY */}
                                                    <Section title="Bonus Liability">
                                                        <Row label={`Opening Bonus Outstanding`} value={<span className="font-bold">{formatCurrency(summary.bonus_outstanding_start_cents / 100)}</span>} />
                                                        <Row label="Net Bonus Granted:" value={formatCurrency(summary.bonus_granted_cents / 100)} />
                                                        <Row label="Net Bonus Revoked:" value={formatCurrency(summary.bonus_revoked_cents / 100)} />
                                                        <Row label="Net Bonus Consumed:" value={formatCurrency(summary.bonus_consumed_cents / 100)} />
                                                        <Row label={`Closing Bonus Outstanding`} value={<span className="font-bold">{formatCurrency(summary.bonus_outstanding_end_cents / 100)}</span>} />
                                                    </Section>
                                                    {/* ROOM USER LIABILITY */}
                                                    <Section title="Room User Liability">
                                                        <Row
                                                            label={`Opening Liability`}
                                                            value={<span className="font-bold">{formatCurrency(summary.room_user_liability_start_cents / 100)}</span>}
                                                        />
                                                        <Row label="Deposits:" value={formatCurrency(summary.room_wallet_deposits_cents / 100)} />
                                                        <Row label="Withdrawals:" value={formatCurrency(summary.room_wallet_withdrawals_cents / 100)} />
                                                        <Row label="Net Spend:" value={formatCurrency(summary.room_wallet_spend_cents / 100)} />
                                                        <Row
                                                            label={`Closing Liability`}
                                                            value={<span className="font-bold">{formatCurrency(summary.room_user_liability_end_cents / 100)}</span>}
                                                        />
                                                    </Section>
                                                </div>
                                            </div>
                                        ) : loading ? (
                                            <div className="text-gray-400 p-8 text-center">Loading…</div>
                                        ) : (
                                            <div className="text-gray-400 p-8 text-center">No summary data.</div>
                                        )}
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
                            {
                                id: "deposit_withdrawal",
                                label: "Deposits/Withdrawals",
                                content: (
                                    <AdminTable
                                        title="Deposits / Withdrawals"
                                        data={depositWithdrawalRows}
                                        columns={[
                                            { accessorKey: "date", header: "Date", cell: info => formatShortDateTime(info.getValue() as string) },
                                            { accessorKey: "user", header: "User" },
                                            { accessorKey: "type", header: "Type", cell: info => (info.getValue() === "room_cash_deposit" ? "Deposit" : "Withdrawal") },
                                            { accessorKey: "amount", header: "Amount", cell: info => formatCurrency((info.getValue() as number) / 100) },
                                            { accessorKey: "note", header: "Note" },
                                        ]}
                                        sorting={sortingTransactions}
                                        setSorting={setSortingTransactions}
                                        globalFilter={globalFilterTransactions}
                                        setGlobalFilter={setGlobalFilterTransactions}
                                        onLoadMore={
                                            depositWithdrawalHasMore
                                                ? () => loadMoreDepositWithdrawal(slug, depositWithdrawalOffset, false, startDate, endDate)
                                                : undefined
                                        }
                                    />
                                ),
                            },
                            {
                                id: "bonus_transactions",
                                label: "Bonus Grants/Revokes",
                                content: (
                                    <AdminTable
                                        title="Bonus Grant / Revoke / Consume"
                                        data={bonusRows}
                                        columns={[
                                            { accessorKey: "date", header: "Date", cell: info => formatShortDateTime(info.getValue() as string) },
                                            { accessorKey: "user", header: "User" },
                                            {
                                                accessorKey: "type", header: "Type", cell: info => {
                                                    if (info.getValue() === "bonus_granted") return "Grant";
                                                    if (info.getValue() === "bonus_revoked") return "Revoke";
                                                    if (info.getValue() === "spend") return "Consumed";
                                                    return info.getValue();
                                                }
                                            },
                                            { accessorKey: "amount", header: "Amount", cell: info => formatCurrency((info.getValue() as number) / 100) },
                                            { accessorKey: "note", header: "Note" },
                                        ]}
                                        sorting={sortingTransactions}
                                        setSorting={setSortingTransactions}
                                        globalFilter={globalFilterTransactions}
                                        setGlobalFilter={setGlobalFilterTransactions}
                                        onLoadMore={
                                            bonusHasMore
                                                ? () => loadMoreBonus(slug, bonusOffset, false, startDate, endDate)
                                                : undefined
                                        }
                                    />
                                ),
                            },

                        ]}
                    />
                </>
            )}
        </div>
    );
}

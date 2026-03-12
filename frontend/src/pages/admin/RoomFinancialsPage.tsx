import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { RoomFinancialsMonthlyRow, RoomFinancialsMonthlySummaryResponse, RoomTransactionRow, SalesPeriodRow, SalesReportResponse, UserLiabilityPeriodRow, UserLiabilityReportResponse, FeePeriodRow, FeeReportResponse, ReconciliationPeriodRow, ReconciliationReportResponse, BonusPeriodRow, BonusReportResponse } from "../../types/webFinancials";
import { AdminTabLayout } from "../admin/AdminTabLayout";
import { AdminTable } from "../admin/AdminTable";
import { getRoomSlug } from "../../utils/roomSlug";
import {
    RoomFinancialSummary,
} from "../../types/webFinancials";
import { ColumnDef, SortingState } from "@tanstack/react-table";
// import { Card, CardContent } from "../../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid, ScatterChart, Scatter } from "recharts";
import { formatCurrency, formatShortDateTime } from "../../utils/format" // Utility for currency formatting
import { RoomSelector } from "../../components/RoomSelector";


type RoomFinancialsPageProps = {
    requiredPermission: string;
    initialRoomSlug?: string;
    enableRoomSelector?: boolean;
    tabMode?: "current" | "legacy";
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

function getISOWeek(date: Date): number {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    const diffDays = (utcDate.getTime() - yearStart.getTime()) / 86400000;
    return Math.ceil((diffDays + 1) / 7);
}

function getRecordValue<T>(record: Record<string, T> | undefined, keys: string[]): T | undefined {
    if (!record) return undefined;
    for (const key of keys) {
        const value = record[key];
        if (value !== undefined) return value;
    }
    return undefined;
}

function getSourceTotalCents(row: SalesPeriodRow, source: "platform" | "room"): number {
    const keys = source === "platform"
        ? ["PLATFORM", "platform", "Platform"]
        : ["ROOM", "room", "Room"];
    return getRecordValue(row.sales_by_source, keys) ?? 0;
}

function getRevenueTypeSourceCents(
    row: SalesPeriodRow,
    revenueType: "TABLE_TIME" | "STREAMING",
    source: "platform" | "room"
): number {
    const sourceTokens = source === "platform"
        ? ["PLATFORM", "platform", "Platform"]
        : ["ROOM", "room", "Room"];
    const revenueTokens = [revenueType, revenueType.toLowerCase()];

    const nestedByType = getRecordValue(
        row.sales_by_revenue_type_and_source,
        revenueTokens
    ) as Record<string, number> | undefined;
    if (nestedByType && typeof nestedByType === "object") {
        const nestedValue = getRecordValue(nestedByType, sourceTokens);
        if (nestedValue !== undefined) return nestedValue;
    }

    const combinedKeys: string[] = [];
    for (const rt of revenueTokens) {
        for (const src of sourceTokens) {
            combinedKeys.push(
                `${rt}_${src}`,
                `${rt}-${src}`,
                `${rt}:${src}`,
                `${rt}/${src}`,
                `${src}_${rt}`,
                `${src}-${rt}`,
                `${src}:${rt}`,
                `${src}/${rt}`
            );
        }
    }

    return getRecordValue(row.sales_by_revenue_type, combinedKeys)
        ?? getRecordValue(row.sales_by_source, combinedKeys)
        ?? 0;
}

function renderSalesTrendTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
    if (!active || !payload || payload.length === 0) return null;
    const label = payload[0]?.payload?.monthLabel ?? "";
    const sortedPayload = [...payload].sort((a, b) => {
        const aYear = a.payload?.[`${a.dataKey}Year`] ?? Number(a.name);
        const bYear = b.payload?.[`${b.dataKey}Year`] ?? Number(b.name);
        return bYear - aYear;
    });
    return (
        <div className="bg-gray-900 text-gray-100 text-xs rounded border border-gray-700 px-3 py-2">
            <div className="font-semibold mb-1">{label}</div>
            {sortedPayload.map((entry) => (
                <div key={entry.dataKey} className="flex items-center justify-between gap-3">
                    <span className="text-gray-300">
                        {entry.payload?.[`${entry.dataKey}Year`] ?? entry.name}
                    </span>
                    <span className="font-mono">{formatCurrency(entry.value)}</span>
                </div>
            ))}
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

function RoomFinancialsPageBase({
    requiredPermission,
    initialRoomSlug,
    enableRoomSelector = false,
    tabMode = "current",
}: RoomFinancialsPageProps) {
    const { idToken } = useAuth();
    // const [slug, setSlug] = useState<string>(initialRoomSlug ?? "");
    const [slug, setSlug] = useState<string | null>(initialRoomSlug ?? (enableRoomSelector ? "" : null));
    const [summary, setSummary] = useState<RoomFinancialSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState(() => (tabMode === "legacy" ? "summary" : "sales_report"));
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

    const [salesRows, setSalesRows] = useState<SalesPeriodRow[]>([]);
    const [salesLoading, setSalesLoading] = useState(false);
    const [salesError, setSalesError] = useState("");

    const [salesTrendRows, setSalesTrendRows] = useState<SalesPeriodRow[]>([]);
    const [salesTrendLoading, setSalesTrendLoading] = useState(false);
    const [salesTrendError, setSalesTrendError] = useState("");
    const [salesTrendPeriod, setSalesTrendPeriod] = useState<"day" | "week" | "month">("month");

    const [userLiabilityRows, setUserLiabilityRows] = useState<UserLiabilityPeriodRow[]>([]);
    const [userLiabilityLoading, setUserLiabilityLoading] = useState(false);
    const [userLiabilityError, setUserLiabilityError] = useState("");

    const [feeRows, setFeeRows] = useState<FeePeriodRow[]>([]);
    const [feeLoading, setFeeLoading] = useState(false);
    const [feeError, setFeeError] = useState("");

    const [reconciliationRows, setReconciliationRows] = useState<ReconciliationPeriodRow[]>([]);
    const [reconciliationLoading, setReconciliationLoading] = useState(false);
    const [reconciliationError, setReconciliationError] = useState("");

    const [bonusReportRows, setBonusReportRows] = useState<BonusPeriodRow[]>([]);
    const [bonusReportLoading, setBonusReportLoading] = useState(false);
    const [bonusReportError, setBonusReportError] = useState("");


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
                    `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/financials/monthly-summary/${slug}?months=36`,
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

    useEffect(() => {
        if (!slug) return;

        setSalesRows([]);
        setSalesLoading(true);
        setSalesError("");

        (async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${idToken}`,
                    "x-api-key": import.meta.env.VITE_API_KEY,
                };

                const res = await fetch(
                    `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/financials/sales-report/${slug}?period=month&count=36`,
                    { headers }
                );

                if (!res.ok) throw new Error(await res.text());

                const data: SalesReportResponse = await res.json();
                setSalesRows(data.rows ?? []);
            } catch (e: any) {
                setSalesError(e.message || "Unknown error");
            } finally {
                setSalesLoading(false);
            }
        })();
    }, [idToken, slug]);

    useEffect(() => {
        if (!slug || !idToken) return;
        if (salesTrendPeriod === "month") return;

        setSalesTrendRows([]);
        setSalesTrendLoading(true);
        setSalesTrendError("");

        (async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${idToken}`,
                    "x-api-key": import.meta.env.VITE_API_KEY,
                };

                const countByPeriod: Record<"day" | "week" | "month", number> = {
                    day: 800,
                    week: 260,
                    month: 60,
                };

                const res = await fetch(
                    `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/financials/sales-report/${slug}?period=${salesTrendPeriod}&count=${countByPeriod[salesTrendPeriod]}`,
                    { headers }
                );

                if (!res.ok) throw new Error(await res.text());

                const data: SalesReportResponse = await res.json();
                setSalesTrendRows(data.rows ?? []);
            } catch (e: any) {
                setSalesTrendError(e.message || "Unknown error");
            } finally {
                setSalesTrendLoading(false);
            }
        })();
    }, [idToken, slug, salesTrendPeriod]);

    useEffect(() => {
        if (!slug) return;

        setUserLiabilityRows([]);
        setUserLiabilityLoading(true);
        setUserLiabilityError("");

        (async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${idToken}`,
                    "x-api-key": import.meta.env.VITE_API_KEY,
                };

                const res = await fetch(
                    `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/financials/user-liability-report/${slug}?period=month&count=36`,
                    { headers }
                );

                if (!res.ok) throw new Error(await res.text());

                const data: UserLiabilityReportResponse = await res.json();
                setUserLiabilityRows(data.rows ?? []);
            } catch (e: any) {
                setUserLiabilityError(e.message || "Unknown error");
            } finally {
                setUserLiabilityLoading(false);
            }
        })();
    }, [idToken, slug]);

    useEffect(() => {
        if (!slug) return;

        setFeeRows([]);
        setFeeLoading(true);
        setFeeError("");

        (async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${idToken}`,
                    "x-api-key": import.meta.env.VITE_API_KEY,
                };

                const res = await fetch(
                    `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/financials/fee-report/${slug}?period=month&count=36`,
                    { headers }
                );

                if (!res.ok) throw new Error(await res.text());

                const data: FeeReportResponse = await res.json();
                setFeeRows(data.rows ?? []);
            } catch (e: any) {
                setFeeError(e.message || "Unknown error");
            } finally {
                setFeeLoading(false);
            }
        })();
    }, [idToken, slug]);

    useEffect(() => {
        if (!slug) return;

        setReconciliationRows([]);
        setReconciliationLoading(true);
        setReconciliationError("");

        (async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${idToken}`,
                    "x-api-key": import.meta.env.VITE_API_KEY,
                };

                const res = await fetch(
                    `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/financials/reconciliation-report/${slug}?period=month&count=36`,
                    { headers }
                );

                if (!res.ok) throw new Error(await res.text());

                const data: ReconciliationReportResponse = await res.json();
                setReconciliationRows(data.rows ?? []);
            } catch (e: any) {
                setReconciliationError(e.message || "Unknown error");
            } finally {
                setReconciliationLoading(false);
            }
        })();
    }, [idToken, slug]);

    useEffect(() => {
        if (!slug) return;

        setBonusReportRows([]);
        setBonusReportLoading(true);
        setBonusReportError("");

        (async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${idToken}`,
                    "x-api-key": import.meta.env.VITE_API_KEY,
                };

                const res = await fetch(
                    `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/financials/bonus-report/${slug}?period=month&count=36`,
                    { headers }
                );

                if (!res.ok) throw new Error(await res.text());

                const data: BonusReportResponse = await res.json();
                setBonusReportRows(data.rows ?? []);
            } catch (e: any) {
                setBonusReportError(e.message || "Unknown error");
            } finally {
                setBonusReportLoading(false);
            }
        })();
    }, [idToken, slug]);

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

    const salesColumns: ColumnDef<SalesPeriodRow>[] = [
        {
            id: "month",
            header: "Month",
            accessorFn: row => {
                const dt = new Date(row.period_start);
                return isNaN(dt.getTime())
                    ? "?"
                    : dt.toLocaleString("default", { month: "short", year: "numeric" });
            },
            cell: info => info.getValue() as string,
        },
        {
            header: "Table Time",
            columns: [
                {
                    id: "table_time_platform",
                    header: "Platform",
                    accessorFn: row => getRevenueTypeSourceCents(row, "TABLE_TIME", "platform"),
                    cell: info => formatCurrency((info.getValue() as number) / 100),
                },
                {
                    id: "table_time_room",
                    header: "Room",
                    accessorFn: row => getRevenueTypeSourceCents(row, "TABLE_TIME", "room"),
                    cell: info => formatCurrency((info.getValue() as number) / 100),
                },
                {
                    id: "table_time_total",
                    header: "Total",
                    accessorFn: row => row.sales_by_revenue_type?.TABLE_TIME ?? 0,
                    cell: info => formatCurrency((info.getValue() as number) / 100),
                },
            ],
        },
        {
            header: "Streaming",
            columns: [
                {
                    id: "streaming_platform",
                    header: "Platform",
                    accessorFn: row => getRevenueTypeSourceCents(row, "STREAMING", "platform"),
                    cell: info => formatCurrency((info.getValue() as number) / 100),
                },
                {
                    id: "streaming_room",
                    header: "Room",
                    accessorFn: row => getRevenueTypeSourceCents(row, "STREAMING", "room"),
                    cell: info => formatCurrency((info.getValue() as number) / 100),
                },
                {
                    id: "streaming_total",
                    header: "Total",
                    accessorFn: row => row.sales_by_revenue_type?.STREAMING ?? 0,
                    cell: info => formatCurrency((info.getValue() as number) / 100),
                },
            ],
        },
        {
            header: "Sales Total",
            columns: [
                {
                    id: "sales_total_platform",
                    header: "Platform",
                    accessorFn: row => getSourceTotalCents(row, "platform"),
                    cell: info => formatCurrency((info.getValue() as number) / 100),
                },
                {
                    id: "sales_total_room",
                    header: "Room",
                    accessorFn: row => getSourceTotalCents(row, "room"),
                    cell: info => formatCurrency((info.getValue() as number) / 100),
                },
                {
                    id: "sales_total_all",
                    header: "All Types / Sources",
                    accessorKey: "sales_total_cents",
                    cell: info => formatCurrency((info.getValue() as number) / 100),
                },
            ],
        },
    ];

    const userLiabilityColumns: ColumnDef<UserLiabilityPeriodRow>[] = [
        {
            id: "month",
            header: "Month",
            cell: info => {
                const row = info.row.original;
                const dt = new Date(row.period_start);
                return isNaN(dt.getTime())
                    ? "?"
                    : dt.toLocaleString("default", { month: "short", year: "numeric" });
            },
        },
        {
            header: "Deposits",
            accessorKey: "deposits_cents",
            cell: info => formatCurrency((info.getValue() as number) / 100),
        },
        {
            header: "Withdrawals",
            accessorKey: "withdrawals_cents",
            cell: info => formatCurrency((info.getValue() as number) / 100),
        },
        {
            id: "bank_deposit",
            header: "Bank Deposit",
            cell: info => {
                const row = info.row.original;
                const bankDeposit = row.deposits_cents - row.withdrawals_cents;
                return formatCurrency(bankDeposit / 100);
            },
        },
        {
            header: "Spend (Net)",
            accessorKey: "spend_cents",
            cell: info => formatCurrency((info.getValue() as number) / 100),
        },
        {
            header: "Refunds",
            accessorKey: "refunds_cents",
            cell: info => formatCurrency((info.getValue() as number) / 100),
        },
        {
            header: "Transfers",
            accessorKey: "transfer_cents",
            cell: info => formatCurrency((info.getValue() as number) / 100),
        },
        {
            id: "liability_change",
            header: "Liability Change",
            cell: info => {
                const row = info.row.original;
                const liabilityChange = row.deposits_cents - row.spend_cents - row.withdrawals_cents + row.refunds_cents + row.transfer_cents;
                return <span className="font-bold">{formatCurrency(liabilityChange / 100)}</span>;
            },
        },
        {
            header: "Room Balance",
            accessorKey: "room_liability_balance_cents",
            cell: info => {
                const value = info.getValue() as number | undefined;
                return value !== undefined ? <span className="font-bold">{formatCurrency(value / 100)}</span> : "";
            },
        },
    ];

    const feeColumns: ColumnDef<FeePeriodRow>[] = [
        {
            id: "month",
            header: "Month",
            cell: info => {
                const row = info.row.original;
                const dt = new Date(row.period_start);
                return isNaN(dt.getTime())
                    ? "?"
                    : dt.toLocaleString("default", { month: "short", year: "numeric" });
            },
        },
        {
            header: "Table Time Spend",
            id: "table_time_spend",
            cell: info => {
                const fees = info.row.original.fees_by_revenue_type?.find(f => f.revenue_type === "TABLE_TIME");
                return fees ? formatCurrency(fees.spend_cents / 100) : formatCurrency(0);
            },
        },
        {
            header: "Table Time Fees",
            id: "table_time_fees",
            cell: info => {
                const fees = info.row.original.fees_by_revenue_type?.find(f => f.revenue_type === "TABLE_TIME");
                return fees ? formatCurrency(fees.platform_fees_cents / 100) : formatCurrency(0);
            },
        },
        {
            header: "Streaming Spend",
            id: "streaming_spend",
            cell: info => {
                const fees = info.row.original.fees_by_revenue_type?.find(f => f.revenue_type === "STREAMING");
                return fees ? formatCurrency(fees.spend_cents / 100) : formatCurrency(0);
            },
        },
        {
            header: "Streaming Fees",
            id: "streaming_fees",
            cell: info => {
                const fees = info.row.original.fees_by_revenue_type?.find(f => f.revenue_type === "STREAMING");
                return fees ? formatCurrency(fees.platform_fees_cents / 100) : formatCurrency(0);
            },
        },
        {
            header: "Total Platform Spend",
            accessorKey: "total_platform_spend_cents",
            cell: info => formatCurrency((info.getValue() as number) / 100),
        },
        {
            header: "Processing Fees",
            accessorKey: "total_processing_fees_cents",
            cell: info => formatCurrency((info.getValue() as number) / 100),
        },
        {
            header: "Total Fees",
            accessorKey: "total_fees_cents",
            cell: info => <span className="font-bold">{formatCurrency((info.getValue() as number) / 100)}</span>,
        },
    ];

    const reconciliationColumns: ColumnDef<ReconciliationPeriodRow>[] = [
        {
            id: "month",
            header: "Month",
            cell: info => {
                const row = info.row.original;
                const dt = new Date(row.period_start);
                return isNaN(dt.getTime())
                    ? "?"
                    : dt.toLocaleString("default", { month: "short", year: "numeric" });
            },
        },
        {
            header: "Platform Sales",
            accessorKey: "platform_sales_cents",
            cell: info => formatCurrency((info.getValue() as number) / 100),
        },
        {
            header: "Tax Held",
            accessorKey: "platform_tax_held_cents",
            cell: info => formatCurrency((info.getValue() as number) / 100),
        },
        {
            header: "Total Fees",
            accessorKey: "total_fees_cents",
            cell: info => formatCurrency((info.getValue() as number) / 100),
        },
        {
            header: "Net to Room",
            accessorKey: "net_to_room_cents",
            cell: info => <span className="font-bold">{formatCurrency((info.getValue() as number) / 100)}</span>,
        },
    ];

    const bonusReportColumns: ColumnDef<BonusPeriodRow>[] = [
        {
            id: "month",
            header: "Month",
            cell: info => {
                const row = info.row.original;
                const dt = new Date(row.period_start);
                return isNaN(dt.getTime())
                    ? "?"
                    : dt.toLocaleString("default", { month: "short", year: "numeric" });
            },
        },
        {
            header: "Granted",
            accessorKey: "granted_cents",
            cell: info => formatCurrency((info.getValue() as number) / 100),
        },
        {
            header: "Revoked",
            accessorKey: "revoked_cents",
            cell: info => formatCurrency((info.getValue() as number) / 100),
        },
        {
            header: "Consumed",
            accessorKey: "consumed_cents",
            cell: info => formatCurrency((info.getValue() as number) / 100),
        },
        {
            header: "Bonus Balance",
            accessorKey: "bonus_balance_cents",
            cell: info => <span className="font-bold">{formatCurrency((info.getValue() as number) / 100)}</span>,
        },
    ];

    const salesTrendSourceRows = salesTrendPeriod === "month" ? salesRows : salesTrendRows;
    const salesTrendClosedRows = salesTrendSourceRows.filter(row => row.closed);
    const salesTrendPastRows = salesTrendClosedRows.filter(
        row => new Date(row.period_end).getTime() < Date.now()
    );
    const salesTrendLastClosedRow = salesTrendPastRows.length > 0
        ? salesTrendPastRows
            .slice()
            .sort((a, b) => new Date(a.period_end).getTime() - new Date(b.period_end).getTime())
            .at(-1)
        : salesTrendClosedRows
            .slice()
            .sort((a, b) => new Date(a.period_end).getTime() - new Date(b.period_end).getTime())
            .at(-1);
    const salesTrendAnchorDate = salesTrendLastClosedRow
        ? new Date(new Date(salesTrendLastClosedRow.period_end).getTime() - 1)
        : null;
    if (salesTrendAnchorDate && salesTrendPeriod !== "month") {
        if (salesTrendPeriod === "week") {
            salesTrendAnchorDate.setDate(salesTrendAnchorDate.getDate() - 7);
        } else {
            salesTrendAnchorDate.setDate(salesTrendAnchorDate.getDate() - 1);
        }
    }
    const salesTrendAnchorBaseDate = salesTrendAnchorDate
        ? (() => {
            const base = new Date(salesTrendAnchorDate.getTime());
            if (salesTrendPeriod === "month") {
                base.setHours(12, 0, 0, 0);
                base.setDate(15);
            } else if (salesTrendPeriod === "week") {
                base.setHours(12, 0, 0, 0);
                const day = base.getDay();
                const diff = (day === 0 ? -3 : 4 - day);
                base.setDate(base.getDate() + diff);
            } else {
                base.setHours(12, 0, 0, 0);
            }
            return base;
        })()
        : null;

    const salesTrendWindowSize = salesTrendPeriod === "month" ? 12 : salesTrendPeriod === "week" ? 52 : 365;
    const salesTrendMonthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const salesTrendShiftDate = (date: Date, offset: number) => {
        const d = new Date(date.getTime());
        if (salesTrendPeriod === "month") d.setMonth(d.getMonth() - offset);
        if (salesTrendPeriod === "week") d.setDate(d.getDate() - offset * 7);
        if (salesTrendPeriod === "day") d.setDate(d.getDate() - offset);
        return d;
    };

    const salesTrendWindow = salesTrendAnchorBaseDate
        ? Array.from({ length: salesTrendWindowSize }, (_, idx) => {
            const offset = salesTrendWindowSize - 1 - idx;
            const date = salesTrendShiftDate(salesTrendAnchorBaseDate, offset);
            return { offset, date, xIndex: idx };
        })
        : [];

    const salesTrendYears = Array.from(new Set(salesTrendClosedRows.map(row => row.year))).sort();

    const salesTrendValueMap = new Map<string, number>();
    salesTrendClosedRows.forEach(row => {
        const dt = new Date(row.period_start);
        if (isNaN(dt.getTime())) return;
        const year = row.year ?? dt.getFullYear();
        const month = row.month ?? dt.getMonth() + 1;
        const day = row.day ?? dt.getDate();
        const week = row.week ?? getISOWeek(dt);
        const key = salesTrendPeriod === "month"
            ? `${year}-M${month}`
            : salesTrendPeriod === "week"
                ? `${year}-W${week}`
                : `${year}-M${month}-D${day}`;
        salesTrendValueMap.set(key, row.sales_total_cents / 100);
    });

    const salesTrendChartData = salesTrendAnchorBaseDate
        ? salesTrendWindow.map(({ offset, date, xIndex }, idx) => {
            const monthLabel = salesTrendMonthOrder[date.getMonth()];
            const prevMonth = idx > 0 ? salesTrendWindow[idx - 1].date.getMonth() : null;
            const showLabel = idx === 0 || prevMonth !== date.getMonth();
            const point: Record<string, string | number> = {
                xIndex,
                monthLabel,
                tickLabel: showLabel ? monthLabel : "",
            };

            salesTrendYears.forEach(year => {
                const baseDate = new Date(salesTrendAnchorBaseDate.getTime());
                baseDate.setFullYear(year);
                const targetDate = salesTrendShiftDate(baseDate, offset);
                const targetYear = targetDate.getFullYear();
                const targetMonth = targetDate.getMonth() + 1;
                const targetDay = targetDate.getDate();
                const targetWeek = getISOWeek(targetDate);
                const key = salesTrendPeriod === "month"
                    ? `${targetYear}-M${targetMonth}`
                    : salesTrendPeriod === "week"
                        ? `${targetYear}-W${targetWeek}`
                        : `${targetYear}-M${targetMonth}-D${targetDay}`;

                if (salesTrendPeriod !== "day") {
                    point[`y${year}`] = salesTrendValueMap.get(key) ?? 0;
                    point[`y${year}Year`] = targetYear;
                    return;
                }

                const trailingValues: number[] = [];
                for (let i = 0; i < 7; i += 1) {
                    const trailingDate = salesTrendShiftDate(targetDate, i);
                    const trailingKey = `${trailingDate.getFullYear()}-M${trailingDate.getMonth() + 1}-D${trailingDate.getDate()}`;
                    const value = salesTrendValueMap.get(trailingKey);
                    if (value !== undefined) trailingValues.push(value);
                }
                const avg = trailingValues.length > 0
                    ? trailingValues.reduce((total, value) => total + value, 0) / trailingValues.length
                    : 0;
                point[`y${year}`] = avg;
                point[`y${year}Year`] = targetYear;
            });

            return point;
        })
        : [];

    const salesTrendIsMonthly = salesTrendPeriod === "month";
    const salesTrendIsLoading = salesTrendIsMonthly ? salesLoading : salesTrendLoading;
    const salesTrendDisplayError = salesTrendIsMonthly ? salesError : salesTrendError;

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

    const legacyTabs = [
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                                </Section>

                                <Section title="Room Wallets">
                                    <Row label="Sales:" value={<span className="font-bold">{formatCurrency(summary.room_wallet_sales_cents / 100)}</span>} />
                                    <Row label="Tax Collected:" value={formatCurrency(summary.room_wallet_tax_cents / 100)} />
                                    <Row label="Arenamatic Fees:" value={formatCurrency(summary.room_wallet_arenamatic_fees_cents / 100)} />
                                </Section>

                                <Section title="Platform Wallets">
                                    <Row label="Sales:" value={<span className="font-bold">{formatCurrency(summary.platform_wallet_sales_cents / 100)}</span>} />
                                    <Row label="Tax Collected:" value={formatCurrency(summary.platform_wallet_tax_cents / 100)} />
                                    <Row label="Arenamatic Fees:" value={formatCurrency(summary.platform_wallet_arenamatic_fees_cents / 100)} />
                                    <Row label="Processing Fees:" value={formatCurrency(summary.platform_processing_fees_cents / 100)} />
                                </Section>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                                <Section title="Bonus Liability">
                                    <Row label="Opening Bonus Outstanding" value={<span className="font-bold">{formatCurrency(summary.bonus_outstanding_start_cents / 100)}</span>} />
                                    <Row label="Net Bonus Granted:" value={formatCurrency(summary.bonus_granted_cents / 100)} />
                                    <Row label="Net Bonus Revoked:" value={formatCurrency(summary.bonus_revoked_cents / 100)} />
                                    <Row label="Net Bonus Consumed:" value={formatCurrency(summary.bonus_consumed_cents / 100)} />
                                    <Row label="Closing Bonus Outstanding" value={<span className="font-bold">{formatCurrency(summary.bonus_outstanding_end_cents / 100)}</span>} />
                                </Section>
                                <Section title="Room User Liability">
                                    <Row label="Opening Liability" value={<span className="font-bold">{formatCurrency(summary.room_user_liability_start_cents / 100)}</span>} />
                                    <Row label="Deposits:" value={formatCurrency(summary.room_wallet_deposits_cents / 100)} />
                                    <Row label="Withdrawals:" value={formatCurrency(summary.room_wallet_withdrawals_cents / 100)} />
                                    <Row label="Net Spend:" value={formatCurrency(summary.room_wallet_spend_cents / 100)} />
                                    <Row label="Closing Liability" value={<span className="font-bold">{formatCurrency(summary.room_user_liability_end_cents / 100)}</span>} />
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
    ];

    const currentTabs = [
        {
            id: "sales_report",
            label: "Sales",
            content: (
                salesLoading ? (
                    <div className="text-gray-400 p-8 text-center">Loading…</div>
                ) : salesError ? (
                    <div className="text-red-400 p-8 text-center">{salesError}</div>
                ) : (
                    <AdminTable
                        title="Sales Report (Last 36 Months)"
                        data={salesRows}
                        columns={salesColumns}
                        sorting={sorting}
                        setSorting={setSorting}
                        globalFilter={globalFilterTransactions}
                        setGlobalFilter={setGlobalFilterTransactions}
                    />
                )
            )
        },
        {
            id: "sales_trending",
            label: "Sales YoY",
            content: (
                <div>
                    <div className="flex flex-wrap items-end gap-4 mb-4">
                        <label className="text-sm text-gray-300">
                            Period
                            <select
                                value={salesTrendPeriod}
                                onChange={e => setSalesTrendPeriod(e.target.value as "day" | "week" | "month")}
                                className="ml-2 px-2 py-1 border rounded"
                            >
                                <option value="month">Monthly</option>
                                <option value="week">Weekly</option>
                                <option value="day">Daily</option>
                            </select>
                        </label>
                    </div>
                    {salesTrendIsLoading ? (
                        <div className="text-gray-400 p-8 text-center">Loading…</div>
                    ) : salesTrendDisplayError ? (
                        <div className="text-red-400 p-8 text-center">{salesTrendDisplayError}</div>
                    ) : (
                        <div className="bg-black/40 rounded-xl shadow-md p-4">
                            <div className="text-gray-400 text-sm mb-4">
                                Sales by {salesTrendPeriod} with YoY series (closed periods only).
                            </div>
                            <div className="h-[420px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={salesTrendChartData} margin={{ top: 10, right: 24, left: 0, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                                        <XAxis
                                            dataKey="xIndex"
                                            tick={{ fill: "#d1d5db", fontSize: 12 }}
                                            tickFormatter={(_value, index) => {
                                                const point = salesTrendChartData[index] as { tickLabel?: string } | undefined;
                                                return point?.tickLabel ?? "";
                                            }}
                                        />
                                        <YAxis tick={{ fill: "#d1d5db", fontSize: 12 }} />
                                        <Tooltip content={renderSalesTrendTooltip} />
                                        <Legend />
                                        {salesTrendYears.map((year, index) => (
                                            <Line
                                                key={year}
                                                type="monotone"
                                                dataKey={`y${year}`}
                                                name={`${year}`}
                                                stroke={["#38bdf8", "#fbbf24", "#34d399", "#f472b6", "#a78bfa", "#fb7185"][index % 6]}
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: "user_liability_report",
            label: "User Liability",
            content: (
                userLiabilityLoading ? (
                    <div className="text-gray-400 p-8 text-center">Loading…</div>
                ) : userLiabilityError ? (
                    <div className="text-red-400 p-8 text-center">{userLiabilityError}</div>
                ) : (
                    <AdminTable
                        title="User Liability Report (Last 36 Months)"
                        data={userLiabilityRows}
                        columns={userLiabilityColumns}
                        sorting={sorting}
                        setSorting={setSorting}
                        globalFilter={globalFilterTransactions}
                        setGlobalFilter={setGlobalFilterTransactions}
                    />
                )
            )
        },
        {
            id: "fee_report",
            label: "Fees",
            content: (
                feeLoading ? (
                    <div className="text-gray-400 p-8 text-center">Loading…</div>
                ) : feeError ? (
                    <div className="text-red-400 p-8 text-center">{feeError}</div>
                ) : (
                    <AdminTable
                        title="Fee Report (Last 36 Months)"
                        data={feeRows}
                        columns={feeColumns}
                        sorting={sorting}
                        setSorting={setSorting}
                        globalFilter={globalFilterTransactions}
                        setGlobalFilter={setGlobalFilterTransactions}
                    />
                )
            )
        },
        {
            id: "reconciliation_report",
            label: "Reconciliation",
            content: (
                reconciliationLoading ? (
                    <div className="text-gray-400 p-8 text-center">Loading…</div>
                ) : reconciliationError ? (
                    <div className="text-red-400 p-8 text-center">{reconciliationError}</div>
                ) : (
                    <AdminTable
                        title="Reconciliation Report (Last 36 Months)"
                        data={reconciliationRows}
                        columns={reconciliationColumns}
                        sorting={sorting}
                        setSorting={setSorting}
                        globalFilter={globalFilterTransactions}
                        setGlobalFilter={setGlobalFilterTransactions}
                    />
                )
            )
        },
        {
            id: "bonus_report",
            label: "Bonus Liability",
            content: (
                bonusReportLoading ? (
                    <div className="text-gray-400 p-8 text-center">Loading…</div>
                ) : bonusReportError ? (
                    <div className="text-red-400 p-8 text-center">{bonusReportError}</div>
                ) : (
                    <AdminTable
                        title="Bonus Liability (Last 36 Months)"
                        data={bonusReportRows}
                        columns={bonusReportColumns}
                        sorting={sorting}
                        setSorting={setSorting}
                        globalFilter={globalFilterTransactions}
                        setGlobalFilter={setGlobalFilterTransactions}
                    />
                )
            )
        },
        {
            id: "transactions",
            label: "Net Spend",
            content: (
                <AdminTable
                    title="Net Spend"
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
            label: "Net Deposits",
            content: (
                <AdminTable
                    title="Net Deposits"
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
            label: "Net Bonus Adds",
            content: (
                <AdminTable
                    title="Net Bonus Adds"
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
    ];

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
                        tabs={tabMode === "legacy" ? legacyTabs : currentTabs}
                    />
                </>
            )}
        </div>
    );
}

export function RoomFinancialsOldPage(props: RoomFinancialsPageProps) {
    return <RoomFinancialsPageBase {...props} tabMode="legacy" />;
}

export default function RoomFinancialsPage(props: RoomFinancialsPageProps) {
    return <RoomFinancialsPageBase {...props} tabMode="current" />;
}

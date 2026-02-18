import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { PlatformLiabilityPeriodRow, PlatformLiabilityReportResponse } from "../../types/webFinancials";
import { AdminTabLayout } from "./AdminTabLayout";
import { AdminTable } from "./AdminTable";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { formatCurrency } from "../../utils/format";

type PlatformLiabilityPageProps = {
    requiredPermission: string;
};

export default function PlatformLiabilityPage({
    requiredPermission,
}: PlatformLiabilityPageProps) {
    const { idToken } = useAuth();
    const [rows, setRows] = useState<PlatformLiabilityPeriodRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    useEffect(() => {
        if (!idToken) return;

        setRows([]);
        setLoading(true);
        setError("");

        (async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${idToken}`,
                    "x-api-key": import.meta.env.VITE_API_KEY,
                };

                const res = await fetch(
                    `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/financials/platform-liability-report?period=month&count=24`,
                    { headers }
                );

                if (!res.ok) throw new Error(await res.text());

                const data: PlatformLiabilityReportResponse = await res.json();
                setRows(data.rows ?? []);
            } catch (e: any) {
                setError(e.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        })();
    }, [idToken]);

    const columns: ColumnDef<PlatformLiabilityPeriodRow>[] = [
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
            id: "net_deposit",
            header: "Net Deposit",
            cell: info => {
                const row = info.row.original;
                const netDeposit = row.deposits_cents - row.withdrawals_cents;
                return formatCurrency(netDeposit / 100);
            },
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
                const liabilityChange =
                    row.deposits_cents -
                    row.spend_cents -
                    row.withdrawals_cents +
                    row.refunds_cents +
                    row.transfer_cents;
                return <span className="font-bold">{formatCurrency(liabilityChange / 100)}</span>;
            },
        },
        {
            header: "Platform Balance",
            accessorKey: "platform_liability_balance_cents",
            cell: info => {
                const value = info.getValue() as number | undefined;
                return value !== undefined
                    ? <span className="font-bold">{formatCurrency(value / 100)}</span>
                    : "";
            },
        },
    ];

    return (
        <div className="mt-20">
            <AdminTabLayout
                title="Platform Liability Report"
                requiredPermission={requiredPermission}
                activeTab="platform_liability"
                setActiveTab={() => { }}
                onRefresh={() => window.location.reload()}
                tabs={[
                    {
                        id: "platform_liability",
                        label: "Platform Liability",
                        content: (
                            loading ? (
                                <div className="text-gray-400 p-8 text-center">Loading…</div>
                            ) : error ? (
                                <div className="text-red-400 p-8 text-center">{error}</div>
                            ) : (
                                <AdminTable
                                    title="Platform Liability Report (Last 24 Months)"
                                    data={rows}
                                    columns={columns}
                                    sorting={sorting}
                                    setSorting={setSorting}
                                    globalFilter={globalFilter}
                                    setGlobalFilter={setGlobalFilter}
                                />
                            )
                        ),
                    },
                ]}
            />
        </div>
    );
}

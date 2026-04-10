import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { AdminTabLayout } from "./AdminTabLayout";
import { getRoomSlug } from "../../utils/roomSlug";
import { RoomSelector } from "../../components/RoomSelector";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, ReferenceLine, Legend,
} from "recharts";
import type {
    CapacityEfficiencyResponse,
    CapacityHeatmapResponse,
    CapacitySummary,
    CapacityTimeseriesResponse,
    CapacityTrendResponse,
    HeatmapCell,
} from "../../types/webCapacity";
import { AdminPageProps } from "../../constants/adminMenu";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function todayStr(): string {
    return new Date().toISOString().split("T")[0];
}

function daysAgoStr(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split("T")[0];
}

function fmtPct(v: number): string {
    return `${v.toFixed(1)}%`;
}

function fmtHours(v: number): string {
    return `${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}h`;
}

/** Label the bucket_start ISO string for the timeseries axis. */
function fmtBucketLabel(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
        " " + d.getHours().toString().padStart(2, "0") + ":00";
}

/** Utilization → heat colour (dark → green → yellow → orange → red). */
function heatColor(pct: number): string {
    if (pct < 1) return "#111827";    // gray-900  — dead slot
    if (pct < 10) return "#14532d";   // very dark green
    if (pct < 25) return "#166534";   // dark green
    if (pct < 40) return "#15803d";   // medium green
    if (pct < 55) return "#16a34a";   // bright green
    if (pct < 70) return "#ca8a04";   // yellow — busy
    if (pct < 85) return "#ea580c";   // orange — very busy
    return "#dc2626";                 // red — near/at capacity
}

/** Colour a utilisation % value for display. */
function utilColor(pct: number): string {
    if (pct >= 90) return "text-red-400";
    if (pct >= 70) return "text-orange-400";
    if (pct >= 40) return "text-green-400";
    return "text-gray-300";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
    label, value, sub, color = "text-white",
}: {
    label: string; value: string; sub?: string; color?: string;
}) {
    return (
        <div className="bg-gray-900/80 rounded-lg p-4 shadow flex-1 min-w-[140px]">
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
        </div>
    );
}

function InsightBadge({ text, level }: { text: string; level: "warning" | "info" | "ok" }) {
    const cls = level === "warning" ? "bg-red-900/60 text-red-300 border-red-700"
        : level === "ok" ? "bg-green-900/60 text-green-300 border-green-700"
            : "bg-blue-900/60 text-blue-300 border-blue-700";
    return (
        <div className={`text-xs rounded px-3 py-1 border ${cls}`}>{text}</div>
    );
}

// ---------------------------------------------------------------------------
// Heatmap tab
// ---------------------------------------------------------------------------

function HeatmapTab({
    data, slug, idToken, onLoad,
}: {
    data: CapacityHeatmapResponse | null;
    slug: string;
    idToken: string | null;
    onLoad: (d: CapacityHeatmapResponse) => void;
}) {
    const [startDate, setStartDate] = useState(daysAgoStr(90));
    const [endDate, setEndDate] = useState(todayStr());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function fetchData(s = startDate, e = endDate) {
        if (!slug || !idToken) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/capacity/heatmap/${slug}?start_date=${s}&end_date=${e}`,
                { headers: { Authorization: `Bearer ${idToken}`, "x-api-key": import.meta.env.VITE_API_KEY } },
            );
            if (!res.ok) throw new Error(await res.text());
            onLoad(await res.json());
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }

    useEffect(() => { if (slug) fetchData(); }, [slug, idToken]);

    // Build grid[hour][dow]
    const grid: (HeatmapCell | undefined)[][] = Array.from({ length: 24 }, () => Array(7).fill(undefined));
    if (data) {
        for (const cell of data.cells) {
            grid[cell.hour][cell.day_of_week] = cell;
        }
    }

    return (
        <div>
            {/* Controls */}
            <div className="flex flex-wrap gap-3 mb-4 items-end">
                <label className="text-sm text-gray-400">
                    From&nbsp;
                    <input type="date" value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="ml-1 bg-gray-800 text-white rounded px-2 py-0.5 text-sm border border-gray-600" />
                </label>
                <label className="text-sm text-gray-400">
                    To&nbsp;
                    <input type="date" value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="ml-1 bg-gray-800 text-white rounded px-2 py-0.5 text-sm border border-gray-600" />
                </label>
                <button onClick={() => fetchData()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded">
                    Apply
                </button>
            </div>

            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
            {loading && <div className="text-gray-400 text-sm mb-2">Loading…</div>}

            {data && (
                <>
                    <p className="text-xs text-gray-500 mb-3">
                        {data.total_tables} table{data.total_tables !== 1 ? "s" : ""} ·
                        utilization = used table-time / available table-time per slot ·
                        {data.start_date} → {data.end_date}
                    </p>

                    {/* Colour legend */}
                    <div className="flex gap-2 flex-wrap mb-4 text-xs text-gray-400 items-center">
                        {[
                            { label: "0–10%", color: "#166534" },
                            { label: "10–40%", color: "#15803d" },
                            { label: "40–55%", color: "#16a34a" },
                            { label: "55–70%", color: "#ca8a04" },
                            { label: "70–85%", color: "#ea580c" },
                            { label: "85%+", color: "#dc2626" },
                        ].map(({ label, color }) => (
                            <span key={label} className="flex items-center gap-1">
                                <span style={{ background: color, width: 14, height: 14, display: "inline-block", borderRadius: 2 }} />
                                {label}
                            </span>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="overflow-x-auto">
                        <table className="border-collapse text-xs select-none">
                            <thead>
                                <tr>
                                    <th className="w-12 text-right pr-2 text-gray-500 font-normal">hr</th>
                                    {DOW_LABELS.map(d => (
                                        <th key={d} className="w-10 text-center text-gray-400 font-semibold pb-1">{d}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 24 }, (_, hour) => (
                                    <tr key={hour}>
                                        <td className="text-right pr-2 text-gray-500 leading-none py-px">
                                            {hour.toString().padStart(2, "0")}:00
                                        </td>
                                        {Array.from({ length: 7 }, (_, dow) => {
                                            const cell = grid[hour][dow];
                                            const pct = cell?.utilization_pct ?? 0;
                                            const avg = cell?.avg_concurrent ?? 0;
                                            return (
                                                <td
                                                    key={dow}
                                                    title={`${DOW_LABELS[dow]} ${hour.toString().padStart(2, "0")}:00 — ${pct.toFixed(1)}% (avg ${avg.toFixed(1)} tables)`}
                                                    style={{
                                                        backgroundColor: heatColor(pct),
                                                        width: 40,
                                                        height: 20,
                                                        border: "1px solid #1f2937",
                                                    }}
                                                />
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Timeseries tab
// ---------------------------------------------------------------------------

function TimeseriesTab({
    slug, idToken,
}: {
    slug: string;
    idToken: string | null;
}) {
    const [startDate, setStartDate] = useState(daysAgoStr(7));
    const [endDate, setEndDate] = useState(todayStr());
    const [bucketHours, setBucketHours] = useState(1);
    const [data, setData] = useState<CapacityTimeseriesResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function fetchData(s = startDate, e = endDate, bh = bucketHours) {
        if (!slug || !idToken) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/capacity/timeseries/${slug}?start_date=${s}&end_date=${e}&bucket_hours=${bh}`,
                { headers: { Authorization: `Bearer ${idToken}`, "x-api-key": import.meta.env.VITE_API_KEY } },
            );
            if (!res.ok) throw new Error(await res.text());
            setData(await res.json());
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }

    useEffect(() => { if (slug) fetchData(); }, [slug, idToken]);

    const totalTables = data?.total_tables ?? 0;

    return (
        <div>
            <div className="flex flex-wrap gap-3 mb-4 items-end">
                <label className="text-sm text-gray-400">
                    From&nbsp;
                    <input type="date" value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="ml-1 bg-gray-800 text-white rounded px-2 py-0.5 text-sm border border-gray-600" />
                </label>
                <label className="text-sm text-gray-400">
                    To&nbsp;
                    <input type="date" value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="ml-1 bg-gray-800 text-white rounded px-2 py-0.5 text-sm border border-gray-600" />
                </label>
                <label className="text-sm text-gray-400">
                    Bucket&nbsp;
                    <select value={bucketHours}
                        onChange={e => setBucketHours(Number(e.target.value))}
                        className="ml-1 bg-gray-800 text-white rounded px-2 py-0.5 text-sm border border-gray-600">
                        <option value={1}>1 hour</option>
                        <option value={4}>4 hours</option>
                        <option value={24}>1 day</option>
                    </select>
                </label>
                <button onClick={() => fetchData()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded">
                    Apply
                </button>
            </div>

            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
            {loading && <div className="text-gray-400 text-sm mb-2">Loading…</div>}

            {data && (
                <>
                    <p className="text-xs text-gray-500 mb-3">
                        {totalTables} table{totalTables !== 1 ? "s" : ""} total capacity ·
                        red dashed line = full capacity threshold
                    </p>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={data.points}
                            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="bucket_start"
                                tickFormatter={fmtBucketLabel}
                                angle={-40}
                                textAnchor="end"
                                interval={Math.max(1, Math.floor(data.points.length / 20))}
                                tick={{ fontSize: 10, fill: "#9ca3af" }}
                            />
                            <YAxis
                                domain={[0, Math.max(totalTables + 1, 5)]}
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                label={{ value: "Tables in use", angle: -90, position: "insideLeft", fill: "#9ca3af", fontSize: 11 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", fontSize: 12 }}
                                formatter={(val: number) => [val, "Tables in use"]}
                                labelFormatter={(label: string) => fmtBucketLabel(label)}
                            />
                            <ReferenceLine
                                y={totalTables}
                                stroke="#ef4444"
                                strokeDasharray="5 3"
                                label={{ value: "Full capacity", fill: "#ef4444", fontSize: 10 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="tables_in_use"
                                stroke="#3b82f6"
                                dot={false}
                                strokeWidth={2}
                                name="Tables in use"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Trend tab
// ---------------------------------------------------------------------------

function TrendTab({
    slug, idToken,
}: {
    slug: string;
    idToken: string | null;
}) {
    const [period, setPeriod] = useState<"week" | "month">("week");
    const [count, setCount] = useState(12);
    const [data, setData] = useState<CapacityTrendResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function fetchData(p = period, c = count) {
        if (!slug || !idToken) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/capacity/trend/${slug}?period=${p}&count=${c}`,
                { headers: { Authorization: `Bearer ${idToken}`, "x-api-key": import.meta.env.VITE_API_KEY } },
            );
            if (!res.ok) throw new Error(await res.text());
            setData(await res.json());
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }

    useEffect(() => { if (slug) fetchData(); }, [slug, idToken]);

    // Sorted ascending
    const chartData = data ? [...data.points].sort((a, b) =>
        a.period_start.localeCompare(b.period_start)
    ) : [];

    return (
        <div>
            <div className="flex flex-wrap gap-3 mb-4 items-end">
                <label className="text-sm text-gray-400">
                    Period&nbsp;
                    <select value={period}
                        onChange={e => setPeriod(e.target.value as "week" | "month")}
                        className="ml-1 bg-gray-800 text-white rounded px-2 py-0.5 text-sm border border-gray-600">
                        <option value="week">Weekly</option>
                        <option value="month">Monthly</option>
                    </select>
                </label>
                <label className="text-sm text-gray-400">
                    Periods&nbsp;
                    <select value={count}
                        onChange={e => setCount(Number(e.target.value))}
                        className="ml-1 bg-gray-800 text-white rounded px-2 py-0.5 text-sm border border-gray-600">
                        <option value={8}>8</option>
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                        <option value={52}>52</option>
                    </select>
                </label>
                <button onClick={() => fetchData()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded">
                    Apply
                </button>
            </div>

            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
            {loading && <div className="text-gray-400 text-sm mb-2">Loading…</div>}

            {data && chartData.length > 0 && (
                <>
                    {/* Capacity pressure insight */}
                    {(() => {
                        const last4 = chartData.slice(-4);
                        const avgLast4Peak = last4.reduce((s, p) => s + p.peak_utilization_pct, 0) / last4.length;
                        const first4 = chartData.slice(0, 4);
                        const avgFirst4Peak = first4.reduce((s, p) => s + p.peak_utilization_pct, 0) / first4.length;
                        const trend = avgLast4Peak - avgFirst4Peak;
                        return (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {avgLast4Peak >= 90 && (
                                    <InsightBadge level="warning"
                                        text={`Peak utilization averaging ${avgLast4Peak.toFixed(0)}% — near full capacity`} />
                                )}
                                {trend > 10 && (
                                    <InsightBadge level="warning"
                                        text={`Peak utilization up ${trend.toFixed(0)}pp over the period — capacity pressure increasing`} />
                                )}
                                {trend < -5 && (
                                    <InsightBadge level="ok"
                                        text={`Peak utilization down ${Math.abs(trend).toFixed(0)}pp — capacity pressure easing`} />
                                )}
                            </div>
                        );
                    })()}

                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={chartData}
                            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="period_label"
                                angle={-40}
                                textAnchor="end"
                                tick={{ fontSize: 10, fill: "#9ca3af" }}
                            />
                            <YAxis
                                domain={[0, 100]}
                                unit="%"
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", fontSize: 12 }}
                                formatter={(val: number, name: string) => [`${val.toFixed(1)}%`, name]}
                            />
                            <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af", paddingTop: 8 }} />
                            <ReferenceLine y={90} stroke="#dc2626" strokeDasharray="4 2"
                                label={{ value: "90%", fill: "#dc2626", fontSize: 10, position: "right" }} />
                            <Line
                                type="monotone"
                                dataKey="avg_utilization_pct"
                                stroke="#3b82f6"
                                dot={{ r: 3 }}
                                strokeWidth={2}
                                name="Avg utilization"
                            />
                            <Line
                                type="monotone"
                                dataKey="peak_utilization_pct"
                                stroke="#f97316"
                                dot={{ r: 3 }}
                                strokeWidth={2}
                                name="Peak utilization"
                            />
                            <Line
                                type="monotone"
                                dataKey="pct_time_full"
                                stroke="#a78bfa"
                                dot={{ r: 2 }}
                                strokeWidth={1.5}
                                strokeDasharray="4 3"
                                name="% time at full capacity"
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    {/* Period table */}
                    <div className="overflow-x-auto mt-4">
                        <table className="text-xs text-gray-300 w-full">
                            <thead>
                                <tr className="text-gray-500 border-b border-gray-700">
                                    <th className="text-left py-1 pr-3">Period</th>
                                    <th className="text-right py-1 pr-3">Avg util</th>
                                    <th className="text-right py-1 pr-3">Peak util</th>
                                    <th className="text-right py-1 pr-3">Time full</th>
                                    <th className="text-right py-1">Matches</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...chartData].reverse().map((p) => (
                                    <tr key={p.period_label} className="border-b border-gray-800">
                                        <td className="py-0.5 pr-3 font-mono">{p.period_label}</td>
                                        <td className={`text-right py-0.5 pr-3 ${utilColor(p.avg_utilization_pct)}`}>
                                            {fmtPct(p.avg_utilization_pct)}
                                        </td>
                                        <td className={`text-right py-0.5 pr-3 ${utilColor(p.peak_utilization_pct)}`}>
                                            {fmtPct(p.peak_utilization_pct)}
                                        </td>
                                        <td className="text-right py-0.5 pr-3">{fmtPct(p.pct_time_full)}</td>
                                        <td className="text-right py-0.5">{p.match_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            {data && chartData.length === 0 && (
                <div className="text-gray-500 text-sm">No match data found for this period.</div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Efficiency tab
// ---------------------------------------------------------------------------

function fmtCents(cents: number, currency: string): string {
    const sym = currency === "GBP" ? "£" : "$";
    return `${sym}${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function EfficiencyTab({
    slug, idToken,
}: {
    slug: string;
    idToken: string | null;
}) {
    const [period, setPeriod] = useState<"week" | "month">("week");
    const [count, setCount] = useState(12);
    const [data, setData] = useState<CapacityEfficiencyResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [backfilling, setBackfilling] = useState(false);
    const [backfillResult, setBackfillResult] = useState<string | null>(null);

    async function fetchData(p = period, c = count) {
        if (!slug || !idToken) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/capacity/efficiency/${slug}?period=${p}&count=${c}`,
                { headers: { Authorization: `Bearer ${idToken}`, "x-api-key": import.meta.env.VITE_API_KEY } },
            );
            if (!res.ok) throw new Error(await res.text());
            setData(await res.json());
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }

    async function runBackfill() {
        if (!idToken) return;
        setBackfilling(true);
        setBackfillResult(null);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/capacity/backfill-table-seconds`,
                { method: "POST", headers: { Authorization: `Bearer ${idToken}`, "x-api-key": import.meta.env.VITE_API_KEY } },
            );
            if (!res.ok) throw new Error(await res.text());
            const r = await res.json();
            setBackfillResult(`Done — ${r.day_windows_updated} day + ${r.aggregate_windows_updated} aggregate windows updated`);
            fetchData();
        } catch (err: any) { setBackfillResult(`Error: ${err.message}`); }
        finally { setBackfilling(false); }
    }

    useEffect(() => { if (slug) fetchData(); }, [slug, idToken]);

    const chartData = data ? [...data.points].sort((a, b) =>
        a.period_start.localeCompare(b.period_start)
    ) : [];

    const currency = data?.currency ?? "CAD";

    return (
        <div>
            <div className="flex flex-wrap gap-3 mb-4 items-end">
                <label className="text-sm text-gray-400">
                    Period&nbsp;
                    <select value={period}
                        onChange={e => setPeriod(e.target.value as "week" | "month")}
                        className="ml-1 bg-gray-800 text-white rounded px-2 py-0.5 text-sm border border-gray-600">
                        <option value="week">Weekly</option>
                        <option value="month">Monthly</option>
                    </select>
                </label>
                <label className="text-sm text-gray-400">
                    Periods&nbsp;
                    <select value={count}
                        onChange={e => setCount(Number(e.target.value))}
                        className="ml-1 bg-gray-800 text-white rounded px-2 py-0.5 text-sm border border-gray-600">
                        <option value={8}>8</option>
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                        <option value={52}>52</option>
                    </select>
                </label>
                <button onClick={() => fetchData()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded">
                    Apply
                </button>
                <button onClick={runBackfill} disabled={backfilling}
                    className="ml-4 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm px-3 py-1 rounded border border-gray-500">
                    {backfilling ? "Backfilling…" : "Backfill historical data"}
                </button>
            </div>

            {backfillResult && (
                <div className="text-xs text-green-400 mb-2">{backfillResult}</div>
            )}
            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
            {loading && <div className="text-gray-400 text-sm mb-2">Loading…</div>}

            {data && chartData.length > 0 && (
                <>
                    {/* Table-hours chart */}
                    <p className="text-xs text-gray-500 mb-1">Table-hours used per period (de-duplicated)</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}
                            margin={{ top: 8, right: 20, left: 0, bottom: 55 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="period_label"
                                angle={-40}
                                textAnchor="end"
                                tick={{ fontSize: 10, fill: "#9ca3af" }}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                label={{ value: "Table-hours", angle: -90, position: "insideLeft", fill: "#9ca3af", fontSize: 11 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", fontSize: 12 }}
                                formatter={(val: number) => [`${val.toFixed(1)}h`, "Table-hours"]}
                            />
                            <Line
                                type="monotone"
                                dataKey="table_hours"
                                stroke="#22d3ee"
                                dot={{ r: 3 }}
                                strokeWidth={2}
                                name="Table-hours"
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    {/* Revenue per table-hour chart */}
                    <p className="text-xs text-gray-500 mb-1 mt-4">Revenue per table-hour</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart
                            data={chartData.filter(p => p.revenue_cents_per_table_hour !== null)}
                            margin={{ top: 8, right: 20, left: 0, bottom: 55 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="period_label"
                                angle={-40}
                                textAnchor="end"
                                tick={{ fontSize: 10, fill: "#9ca3af" }}
                            />
                            <YAxis
                                tickFormatter={(v: number) => fmtCents(v, currency)}
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                label={{ value: `/ table-hr`, angle: -90, position: "insideLeft", fill: "#9ca3af", fontSize: 11 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", fontSize: 12 }}
                                formatter={(val: number) => [fmtCents(val, currency), "Revenue / table-hr"]}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue_cents_per_table_hour"
                                stroke="#34d399"
                                dot={{ r: 3 }}
                                strokeWidth={2}
                                name="Revenue / table-hr"
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    {/* Period table */}
                    <div className="overflow-x-auto mt-4">
                        <table className="text-xs text-gray-300 w-full">
                            <thead>
                                <tr className="text-gray-500 border-b border-gray-700">
                                    <th className="text-left py-1 pr-3">Period</th>
                                    <th className="text-right py-1 pr-3">Table-hours</th>
                                    <th className="text-right py-1 pr-3">Net sales</th>
                                    <th className="text-right py-1">Revenue / table-hr</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...chartData].reverse().map((p) => (
                                    <tr key={p.period_label} className="border-b border-gray-800">
                                        <td className="py-0.5 pr-3 font-mono">{p.period_label}</td>
                                        <td className="text-right py-0.5 pr-3">{p.table_hours.toFixed(1)}h</td>
                                        <td className="text-right py-0.5 pr-3">
                                            {fmtCents(p.net_sales_cents, currency)}
                                        </td>
                                        <td className="text-right py-0.5">
                                            {p.revenue_cents_per_table_hour !== null
                                                ? fmtCents(p.revenue_cents_per_table_hour, currency)
                                                : <span className="text-gray-600">—</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            {data && chartData.length === 0 && (
                <div className="text-gray-500 text-sm">No rollup data found. Run a backfill or wait for the next scheduled refresh.</div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Summary tab
// ---------------------------------------------------------------------------

function SummaryTab({
    slug, idToken,
}: {
    slug: string;
    idToken: string | null;
}) {
    const [startDate, setStartDate] = useState(daysAgoStr(90));
    const [endDate, setEndDate] = useState(todayStr());
    const [data, setData] = useState<CapacitySummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function fetchData(s = startDate, e = endDate) {
        if (!slug || !idToken) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `${import.meta.env.VITE_WEB_FIN_API_BASE}/web/capacity/summary/${slug}?start_date=${s}&end_date=${e}`,
                { headers: { Authorization: `Bearer ${idToken}`, "x-api-key": import.meta.env.VITE_API_KEY } },
            );
            if (!res.ok) throw new Error(await res.text());
            setData(await res.json());
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }

    useEffect(() => { if (slug) fetchData(); }, [slug, idToken]);

    return (
        <div>
            <div className="flex flex-wrap gap-3 mb-4 items-end">
                <label className="text-sm text-gray-400">
                    From&nbsp;
                    <input type="date" value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="ml-1 bg-gray-800 text-white rounded px-2 py-0.5 text-sm border border-gray-600" />
                </label>
                <label className="text-sm text-gray-400">
                    To&nbsp;
                    <input type="date" value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="ml-1 bg-gray-800 text-white rounded px-2 py-0.5 text-sm border border-gray-600" />
                </label>
                <button onClick={() => fetchData()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded">
                    Apply
                </button>
            </div>

            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
            {loading && <div className="text-gray-400 text-sm mb-2">Loading…</div>}

            {data && (
                <>
                    {/* Insight flags */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        {data.peak_utilization_pct >= 90 && (
                            <InsightBadge level="warning"
                                text={`Peak utilization ${fmtPct(data.peak_utilization_pct)} — consider expansion`} />
                        )}
                        {data.pct_time_full >= 5 && (
                            <InsightBadge level="warning"
                                text={`${fmtPct(data.pct_time_full)} of time at full capacity — demand likely constrained`} />
                        )}
                        {data.avg_utilization_pct < 20 && (
                            <InsightBadge level="info"
                                text={`Avg utilization ${fmtPct(data.avg_utilization_pct)} — significant off-peak capacity remains`} />
                        )}
                        {data.peak_utilization_pct < 50 && (
                            <InsightBadge level="ok" text="No capacity constraints detected in this period" />
                        )}
                    </div>

                    {/* Stat cards */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <StatCard
                            label="Avg utilization"
                            value={fmtPct(data.avg_utilization_pct)}
                            sub="used table-time / available table-time"
                            color={utilColor(data.avg_utilization_pct)}
                        />
                        <StatCard
                            label="Peak utilization"
                            value={fmtPct(data.peak_utilization_pct)}
                            sub={`${data.peak_concurrent} of ${data.total_tables} tables simultaneously`}
                            color={utilColor(data.peak_utilization_pct)}
                        />
                        <StatCard
                            label="Time at full capacity"
                            value={fmtPct(data.pct_time_full)}
                            sub="% of calendar time (all hours)"
                            color={data.pct_time_full >= 5 ? "text-red-400" : "text-gray-300"}
                        />
                        <StatCard
                            label="Total tables"
                            value={String(data.total_tables)}
                            sub="currently in service"
                        />
                    </div>

                    {/* Secondary stats */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        <StatCard
                            label="Matches played"
                            value={data.total_matches.toLocaleString()}
                            sub={`${data.start_date} → ${data.end_date}`}
                        />
                        <StatCard
                            label="Table-hours used"
                            value={fmtHours(data.total_table_hours_used)}
                            sub={`of ${fmtHours(data.total_available_table_hours)} available`}
                        />
                    </div>

                    <p className="text-xs text-gray-600 mt-2">
                        Note: avg utilization is computed over all 24h/day including off-hours.
                        Peak utilization reflects the single highest simultaneous table count observed.
                    </p>
                </>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------

type CapacityTab = "summary" | "heatmap" | "over_time" | "trend" | "efficiency";

type RoomCapacityPageProps = AdminPageProps & {
    initialRoomSlug?: string;
    enableRoomSelector?: boolean;
};

function RoomCapacityPageBase({
    requiredPermission,
    initialRoomSlug,
    enableRoomSelector = false,
}: RoomCapacityPageProps) {
    const { idToken } = useAuth();
    const [slug, setSlug] = useState<string | null>(
        initialRoomSlug ?? (enableRoomSelector ? "" : null)
    );
    const [activeTab, setActiveTab] = useState<CapacityTab>("summary");
    const [heatmapData, setHeatmapData] = useState<CapacityHeatmapResponse | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!initialRoomSlug && !enableRoomSelector && slug === null) {
            (async () => {
                const s = await getRoomSlug();
                setSlug(s ?? "");
            })();
        }
    }, [initialRoomSlug, enableRoomSelector, slug]);

    const effectiveSlug = slug ?? "";

    const tabs = [
        {
            id: "summary" as CapacityTab, label: "Summary",
            content: <SummaryTab key={`s-${effectiveSlug}-${refreshKey}`} slug={effectiveSlug} idToken={idToken} />,
        },
        {
            id: "heatmap" as CapacityTab, label: "Heatmap",
            content: <HeatmapTab key={`h-${effectiveSlug}-${refreshKey}`} data={heatmapData} slug={effectiveSlug} idToken={idToken} onLoad={setHeatmapData} />,
        },
        {
            id: "over_time" as CapacityTab, label: "Over Time",
            content: <TimeseriesTab key={`t-${effectiveSlug}-${refreshKey}`} slug={effectiveSlug} idToken={idToken} />,
        },
        {
            id: "trend" as CapacityTab, label: "Trend",
            content: <TrendTab key={`tr-${effectiveSlug}-${refreshKey}`} slug={effectiveSlug} idToken={idToken} />,
        },
        {
            id: "efficiency" as CapacityTab, label: "Efficiency",
            content: <EfficiencyTab key={`ef-${effectiveSlug}-${refreshKey}`} slug={effectiveSlug} idToken={idToken} />,
        },
    ];

    const tabLayout = (
        <AdminTabLayout
            title="Room Capacity"
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onRefresh={() => { setHeatmapData(null); setRefreshKey(k => k + 1); }}
            requiredPermission={requiredPermission}
        />
    );

    if (enableRoomSelector) {
        return (
            <div>
                <div className="max-w-2xl mx-auto mt-20 px-8 mb-4">
                    <RoomSelector
                        value={slug ?? ""}
                        onChange={(s) => { setSlug(s); setHeatmapData(null); }}
                    />
                    {!slug && (
                        <div className="text-gray-400 mt-4">
                            Please select a room to view capacity analytics.
                        </div>
                    )}
                </div>
                {slug && tabLayout}
            </div>
        );
    }

    return tabLayout;
}

export default function RoomCapacityPage(props: RoomCapacityPageProps) {
    return <RoomCapacityPageBase {...props} />;
}

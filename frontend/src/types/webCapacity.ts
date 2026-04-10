/** day_of_week: 0 = Monday … 6 = Sunday */
export interface HeatmapCell {
    day_of_week: number;
    hour: number;
    utilization_pct: number;
    avg_concurrent: number;
}

export interface CapacityHeatmapResponse {
    room_slug: string;
    total_tables: number;
    start_date: string;
    end_date: string;
    cells: HeatmapCell[]; // 168 entries (7 × 24)
}

export interface TimeseriesPoint {
    bucket_start: string; // ISO datetime UTC
    tables_in_use: number;
    total_tables: number;
    utilization_pct: number;
}

export interface CapacityTimeseriesResponse {
    room_slug: string;
    total_tables: number;
    bucket_minutes: number;
    points: TimeseriesPoint[];
}

export interface CapacitySummary {
    room_slug: string;
    total_tables: number;
    start_date: string;
    end_date: string;
    avg_utilization_pct: number;
    peak_utilization_pct: number;
    peak_concurrent: number;
    pct_time_full: number;
    total_matches: number;
    total_table_hours_used: number;
    total_available_table_hours: number;
}

export interface TrendPoint {
    period_label: string;
    period_start: string;
    period_end: string;
    avg_utilization_pct: number;
    peak_utilization_pct: number;
    pct_time_full: number;
    match_count: number;
}

export interface CapacityTrendResponse {
    room_slug: string;
    total_tables: number;
    period: string;
    points: TrendPoint[];
}

export interface EfficiencyPoint {
    period_label: string;
    period_start: string;  // ISO datetime UTC
    period_end: string;
    table_hours: number;
    net_sales_cents: number;
    revenue_cents_per_table_hour: number | null;
    currency: string;
}

export interface CapacityEfficiencyResponse {
    room_slug: string;
    currency: string;
    period: string;
    points: EfficiencyPoint[];
}

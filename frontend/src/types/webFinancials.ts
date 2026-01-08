// types/webFinancials.ts
export type RevenueTypeSummary = {
    sales_cents: number;
    tax_collected_cents: number;
    arenamatic_fee_cents: number;
    stripe_clawback_cents: number;
};

export type RoomFinancialSummary = {
    room_slug: string;
    currency: string;
    // Period info
    period_start?: string;
    period_end?: string;
    year?: number;
    month?: number;
    week?: number;
    quarter?: number;

    // Room wallet
    room_wallet_sales_cents: number;
    room_wallet_tax_cents: number;
    room_wallet_arenamatic_fees_cents: number;

    // Platform wallet
    platform_wallet_sales_cents: number;
    platform_wallet_tax_cents: number;
    platform_wallet_arenamatic_fees_cents: number;
    platform_processing_fees_cents: number;

    // Settlement
    total_due_to_room_cents: number;

    // Bonus summary
    bonus_granted_cents: number;
    bonus_revoked_cents: number;
    bonus_consumed_cents: number;
    bonus_outstanding_start_cents: number;
    bonus_outstanding_end_cents: number;

    // Room user liability
    room_user_liability_start_cents: number;
    room_wallet_deposits_cents: number;
    room_wallet_withdrawals_cents: number;
    room_wallet_spend_cents: number;    // (net: spends - refunds)
    room_user_liability_end_cents: number;

    // Revenue breakdowns (optional, for UI detail)
    room_wallet_breakdown?: { [key: string]: RevenueTypeSummary };
    platform_wallet_breakdown?: { [key: string]: RevenueTypeSummary };
    all_wallet_breakdown?: { [key: string]: RevenueTypeSummary };
};

export type RoomTransactionRow = {
    id: number;
    date: string;
    user: string;
    type: "spend" | "refund";
    amount: number;
    tax?: number | null;
    bonus_spend?: number | null;
    room_spend?: number | null;
    arenamatic_spend?: number | null;
    arenamatic_fee?: number | null;
    processing_fee?: number | null;
    revenue?: number | null;
    revenue_type?: string | null;
    due_to_club?: number | null;
    note: string;
    refunded: boolean | null;
    is_refund: boolean | null;
};


// --- Revenue Summary (high-level totals) ---
export interface RoomRevenueSummary {
    room_slug: string;
    currency: string;
    total_gross_cents: number;
    total_net_cents: number;
    total_fees_cents: number;
    total_tax_cents: number;
    arenamatic_fees_cents: number;
    stripe_fees_cents: number;
    total_payout_cents: number;
    period_start: string; // ISO date
    period_end: string;   // ISO date
}

// --- Monthly series (trend chart) ---
export interface MonthlyAggregate {
    period: string; // "YYYY-MM"
    gross_cents: number;
    net_cents: number;
    fees_cents: number;
    tax_cents: number;
    arenamatic_fees_cents: number;
    stripe_fees_cents: number;
    payout_cents: number;
}

export interface RoomMonthlySeries {
    room_slug: string;
    currency: string;
    series: MonthlyAggregate[];
}

// --- Revenue Breakdown (by type, e.g. TABLE_TIME, STREAMING, etc) ---
export interface RevenueTypeBreakdown {
    revenue_type: string;
    gross_cents: number;
    net_cents: number;
    fees_cents: number;
    tax_cents: number;
    arenamatic_fees_cents: number;
    stripe_fees_cents: number;
}

export interface RoomRevenueBreakdown {
    room_slug: string;
    currency: string;
    breakdown: RevenueTypeBreakdown[];
    total_gross_cents: number;
    total_net_cents: number;
}

// --- Paginated Journals (table explorer) ---
export interface JournalEntrySummary {
    journal_id: number;
    created_at: string; // ISO datetime
    amount_cents: number;
    currency: string;
    revenue_type?: string | null;
    account_type: string;
    user_id?: number | null;
    user_name?: string | null;
    memo?: string | null;
    // Add any other columns as needed for your explorer
}

export interface PaginatedJournalList {
    results: JournalEntrySummary[];
    next_cursor?: string | null; // ISO datetime or id (use whatever backend returns)
}

// --- Journal Detail (for modal/drilldown) ---
export interface JournalLeg {
    leg_id: number;
    account_code: string;
    account_type: string;
    debit_cents: number;
    credit_cents: number;
    currency: string;
}

export interface JournalDetail {
    journal_id: number;
    created_at: string; // ISO datetime
    legs: JournalLeg[];
    memo?: string | null;
    posted_by?: string | null;
}

// --- Fees Summary ---
export interface FeesSummary {
    room_slug: string;
    currency: string;
    arenamatic_fees_cents: number;
    stripe_fees_cents: number;
    period_start: string; // ISO date
    period_end: string;   // ISO date
}

// --- Stripe Summary (refunds, chargebacks, etc) ---
export interface StripeSummary {
    room_slug: string;
    stripe_fees_cents: number;
    refunds_cents: number;
    chargebacks_cents: number;
    period_start: string;
    period_end: string;
}

export type RoomFinancialsMonthlyRow = {
    year: number;
    month: number;
    period_start: string; // ISO
    period_end: string;   // ISO
    sales_platform_cents: number;
    sales_room_cents: number;
    sales_total_cents: number;
    tax_platform_cents: number;
    tax_room_cents: number;
    tax_total_cents: number;
    arenamatic_fees_platform_cents: number;
    arenamatic_fees_room_cents: number;
    arenamatic_fees_total_cents: number;
    processing_fees_cents: number;
    net_cents: number;
};

export type RoomFinancialsMonthlySummaryResponse = {
    months: RoomFinancialsMonthlyRow[];
};

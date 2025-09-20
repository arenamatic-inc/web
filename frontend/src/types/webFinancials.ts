// types/webFinancials.ts
export type RevenueTypeSummary = {
    room_revenue_cents: number;
    tax_collected_cents: number;
    arenamatic_fee_cents: number;
    stripe_clawback_cents: number;
};

export type ArenamaticFeesBreakdown = {
    processing_fees_cents: number; // Stripe
    arenamatic_share_cents: number; // Your platform fee
    total_fees_cents: number;
};

export type BonusSummary = {
    net_granted_cents: number;
    net_consumed_cents: number;
    opening_outstanding_cents: number;
    closing_outstanding_cents: number;
};

export type RoomFinancialSummary = {
    room_slug: string;
    currency: string;
    // Totals
    total_player_spend_cents: number;
    room_revenue_cents: number;
    tax_collected_cents: number;
    arenamatic_fee_cents: number;
    stripe_clawback_cents: number;

    // Revenue by type
    revenue_by_type: { [key: string]: RevenueTypeSummary; };
    fees_by_type: { [key: string]: ArenamaticFeesBreakdown };

    // Source of spend, settlement, liabilities, etc
    room_wallet_spend_cents: number;
    arenamatic_wallet_spend_cents: number;
    arenamatic_fees_due_cents: number;
    stripe_clawback_due_cents: number; // NEW!
    arena_wallets_due_to_club_cents: number;
    net_due_cents: number;
    opening_liability_cents: number;
    net_deposits_cents: number;
    room_wallet_spend_period_cents: number;
    closing_liability_cents: number;
    bonus: BonusSummary;

    // Reconciliation
    room_revenue_from_arenamatic_cents: number;
    arenamatic_tax_collected: number;
    arenamatic_fees_from_room_wallet: number;

    period_start: string; // ISO date
    period_end: string;   // ISO date
};

export type RoomTransactionRow = {
    date: string;               // ISO timestamp
    user: string;               // display name or user ID
    type: "spend" | "refund";
    amount: number;             // tax-excluded, in cents
    tax?: number | null;        // in cents
    bonus_spend?: number | null;
    room_spend?: number | null;
    arenamatic_spend?: number | null;
    arenamatic_fee?: number | null;
    processing_fee?: number | null;
    revenue?: number | null;        // club recognized revenue, in cents
    due_to_club?: number | null;    // revenue + tax, in cents
    note: string;               // memo, can be empty string
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

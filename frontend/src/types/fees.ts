// types/fees.ts

import { PricingModel, FeeRevenueType } from "../constants/enums";

export interface RoomFeeScheduleOut {
  id: number;
  room_id: number;
  revenue_type: FeeRevenueType;
  pricing_model: PricingModel;
  lower_bound_cents: number | null;
  upper_bound_cents: number | null;
  percent: number | null;
  flat_cents: number | null;
}

export interface RoomFeeScheduleIn {
  revenue_type: FeeRevenueType;
  pricing_model: PricingModel;
  percent: number | null;           // was: rate_percent
  flat_cents: number | null;
  lower_bound_cents: number | null; // was: min_cents
  upper_bound_cents: number | null; // was: max_cents
}


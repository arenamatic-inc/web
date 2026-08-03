import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { FeeRevenueType, PricingModel } from "../constants/enums";
import { RoomFeeScheduleIn, RoomFeeScheduleOut } from "../types/fees";
import { RoomFeeForm } from "./RoomFeeForm";

function defaultFeeRows(): RoomFeeScheduleIn[] {
  return [
    {
      revenue_type: FeeRevenueType.TABLE_TIME,
      pricing_model: PricingModel.PERCENTAGE,
      percent: 10,
      flat_cents: null,
      lower_bound_cents: 0,
      upper_bound_cents: null,
    },
    {
      revenue_type: FeeRevenueType.STREAMING,
      pricing_model: PricingModel.PERCENTAGE,
      percent: 10,
      flat_cents: null,
      lower_bound_cents: 0,
      upper_bound_cents: null,
    },
  ];
}

type Props = {
  roomSlug: string;
};

export function RoomFeeEditor({ roomSlug }: Props) {
  const { idToken } = useAuth();
  const [fees, setFees] = useState<RoomFeeScheduleOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadFees() {
    if (!idToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/web/admin/room-fees/${roomSlug}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "x-api-key": import.meta.env.VITE_API_KEY,
        },
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setFees(data.fees || []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load room fee schedule";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFees();
  }, [idToken, roomSlug]);

  const initialFees = useMemo(() => {
    if (fees.length === 0) {
      return defaultFeeRows();
    }
    return fees.map((fee) => ({
      revenue_type: fee.revenue_type,
      pricing_model: fee.pricing_model,
      percent: fee.percent,
      flat_cents: fee.flat_cents,
      lower_bound_cents: fee.lower_bound_cents,
      upper_bound_cents: fee.upper_bound_cents,
    }));
  }, [fees]);

  const handleSave = async (updated: RoomFeeScheduleIn[]) => {
    if (!idToken) return;

    const payload = updated.map((fee) => ({
      ...fee,
      percent: Number.isFinite(fee.percent as number) ? fee.percent : null,
      flat_cents: Number.isFinite(fee.flat_cents as number) ? fee.flat_cents : null,
      lower_bound_cents: Number.isFinite(fee.lower_bound_cents as number) ? fee.lower_bound_cents : null,
      upper_bound_cents: Number.isFinite(fee.upper_bound_cents as number) ? fee.upper_bound_cents : null,
    }));

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/web/admin/room-fees/${roomSlug}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "x-api-key": import.meta.env.VITE_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      setMessage("Fee schedule saved.");
      await loadFees();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save room fee schedule";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading fee schedule...</div>;
  }

  return (
    <div className="space-y-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {message && <div className="text-green-700 text-sm">{message}</div>}
      {saving && <div className="text-gray-600 text-sm">Saving...</div>}

      <RoomFeeForm key={roomSlug} initialFees={initialFees} onSave={handleSave} />
    </div>
  );
}

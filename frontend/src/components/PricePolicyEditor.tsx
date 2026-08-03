import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";

type PriceMatrix = number[][];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface PricePolicy {
  id: number;
  name: string;
  room_id: number;
  price_matrix: PriceMatrix;
}

interface PricePolicyEditorProps {
  roomSlug: string;
}

export function PricePolicyEditor({ roomSlug }: PricePolicyEditorProps) {
  const { idToken } = useAuth();

  const [policies, setPolicies] = useState<PricePolicy[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);
  const [loadingPolicies, setLoadingPolicies] = useState(false);

  // Form state — matrix is stored in DOLLARS (e.g. 15.00) for display;
  // converted to/from cents when loading from / saving to the backend.
  const [policyName, setPolicyName] = useState("");
  const [priceMatrix, setPriceMatrix] = useState<PriceMatrix>(
    Array(7)
      .fill(null)
      .map(() => Array(24).fill(15))
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load policies on mount
  useEffect(() => {
    loadPolicies();
  }, [idToken, roomSlug]);

  async function loadPolicies() {
    if (!idToken || !roomSlug) return;
    setLoadingPolicies(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/room/admin/${roomSlug}/price-policies`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error("Failed to load price policies");
      const data = await res.json();
      setPolicies(data);
      if (data.length === 0) {
        setIsCreating(true);
        setPolicyName("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingPolicies(false);
    }
  }

  function centsToDollars(matrix: PriceMatrix): PriceMatrix {
    return matrix.map(row => row.map(cents => Math.round(cents) / 100));
  }

  function dollarsToCents(matrix: PriceMatrix): PriceMatrix {
    return matrix.map(row => row.map(dollars => Math.round(dollars * 100)));
  }

  async function selectPolicy(policyId: number) {
    const policy = policies.find((p) => p.id === policyId);
    if (!policy) return;
    setSelectedPolicyId(policyId);
    setPolicyName(policy.name);
    setPriceMatrix(centsToDollars(policy.price_matrix));
    setIsCreating(false);
    setError(null);
    setSuccessMessage(null);
  }

  function newPolicy() {
    setSelectedPolicyId(null);
    setPolicyName("");
    setPriceMatrix(
      Array(7)
        .fill(null)
        .map(() => Array(24).fill(15))
    );
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);
  }

  function updateCell(day: number, hour: number, value: string) {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0) return;
    const newMatrix = priceMatrix.map(r => [...r]) as PriceMatrix;
    newMatrix[day][hour] = parsed;
    setPriceMatrix(newMatrix);
  }

  function fillRow(day: number, value: string) {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0) return;
    const newMatrix = priceMatrix.map(r => [...r]) as PriceMatrix;
    newMatrix[day] = Array(24).fill(parsed);
    setPriceMatrix(newMatrix);
  }

  function fillAll(value: string) {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0) return;
    setPriceMatrix(
      Array(7)
        .fill(null)
        .map(() => Array(24).fill(parsed))
    );
  }

  async function savePolicy() {
    if (!policyName.trim()) {
      setError("Policy name is required");
      return;
    }
    if (!idToken || !roomSlug) return;

    setIsSaving(true);
    setError(null);
    try {
      const payload = { name: policyName, price_matrix: dollarsToCents(priceMatrix) };
      const method = isCreating ? "POST" : "PUT";
      const url = isCreating
        ? `${import.meta.env.VITE_API_BASE}/room/admin/${roomSlug}/price-policies`
        : `${import.meta.env.VITE_API_BASE}/room/admin/${roomSlug}/price-policies/${selectedPolicyId}`;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to save policy");
      }

      const saved = await res.json();
      setSuccessMessage(isCreating ? "Policy created successfully" : "Policy updated successfully");
      await loadPolicies();
      setIsCreating(false);
      setSelectedPolicyId(saved.id);
      setPolicyName(saved.name);
      setPriceMatrix(centsToDollars(saved.price_matrix));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePolicy() {
    if (!selectedPolicyId || !idToken || !roomSlug) return;
    if (!confirm("Delete this price policy?")) return;

    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/room/admin/${roomSlug}/price-policies/${selectedPolicyId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to delete policy");
      }

      setSuccessMessage("Policy deleted successfully");
      await loadPolicies();
      newPolicy();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsDeleting(false);
    }
  }

  function cancelEdit() {
    setIsCreating(false);
    setSelectedPolicyId(null);
    setPolicyName("");
    setError(null);
    setSuccessMessage(null);
  }

  if (loadingPolicies) {
    return <div className="p-4 bg-gray-50 rounded">Loading price policies...</div>;
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded border border-gray-200">
      <div>
        <h3 className="text-lg font-semibold mb-4">Price Policies</h3>

        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded mb-4">{error}</div>}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded mb-4">{successMessage}</div>
        )}

        {!isCreating && selectedPolicyId === null && policies.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-sm text-gray-600">Select a policy to edit:</p>
            <div className="flex gap-2 flex-wrap">
              {policies.map((policy) => (
                <button
                  key={policy.id}
                  onClick={() => selectPolicy(policy.id)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                >
                  {policy.name}
                </button>
              ))}
            </div>
            <button
              onClick={newPolicy}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              + New Policy
            </button>
          </div>
        )}

        {isCreating || selectedPolicyId !== null ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Policy Name</label>
              <input
                type="text"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                placeholder="e.g., Snooker, Pool"
                className="w-full px-2 py-1 border border-gray-300 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Hourly Rates ($)</label>
                <button
                  onClick={() => {
                    const val = prompt("Fill all cells with this rate ($):", "15.00");
                    if (val) fillAll(val);
                  }}
                  className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Fill All
                </button>
              </div>

              <div className="overflow-x-auto border border-gray-300 rounded">
                <table className="border-collapse text-xs" style={{ minWidth: "max-content" }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-1 sticky left-0 bg-gray-100 z-10" style={{ minWidth: "4rem" }}>Day</th>
                      {HOURS.map((h) => (
                        <th key={h} className="border border-gray-300 p-1 bg-gray-50 text-center" style={{ minWidth: "5rem" }}>
                          {h}:00
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day, dayIdx) => (
                      <tr key={dayIdx}>
                        <td className="border border-gray-300 p-1 bg-gray-50 font-medium text-xs sticky left-0 z-10" style={{ minWidth: "4rem" }}>
                          <div className="flex flex-col gap-0.5 items-start">
                            <span>{day.slice(0, 3)}</span>
                            <button
                              onClick={() => {
                                const val = prompt(`Fill ${day} with rate ($):`, "15.00");
                                if (val) fillRow(dayIdx, val);
                              }}
                              className="text-xs px-1 bg-blue-100 hover:bg-blue-200 rounded"
                            >
                              Fill
                            </button>
                          </div>
                        </td>
                        {HOURS.map((hour) => (
                          <td key={`${dayIdx}-${hour}`} className="border border-gray-300 p-0">
                            <input
                              type="number"
                              value={priceMatrix[dayIdx][hour]}
                              onChange={(e) => updateCell(dayIdx, hour, e.target.value)}
                              min="0"
                              step="0.5"
                              className="h-8 border-0 text-center text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                              style={{ width: "5rem" }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={savePolicy}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : isCreating ? "Create Policy" : "Update Policy"}
              </button>
              {!isCreating && (
                <button
                  onClick={deletePolicy}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              )}
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          policies.length === 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
              No price policies yet.{" "}
              <button onClick={newPolicy} className="font-semibold underline">
                Create one now
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

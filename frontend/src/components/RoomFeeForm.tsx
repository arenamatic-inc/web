import { useState } from "react";
import { RoomFeeScheduleIn } from "../types/fees";
import { FeeRevenueType, PricingModel } from "../constants/enums";

interface Props {
    initialFees: RoomFeeScheduleIn[];
    onSave: (updated: RoomFeeScheduleIn[]) => void;
}

export function RoomFeeForm({ initialFees, onSave }: Props) {
    const [fees, setFees] = useState<RoomFeeScheduleIn[]>(initialFees);

    const handleChange = (index: number, field: keyof RoomFeeScheduleIn, value: any) => {
        const updated = [...fees];
        updated[index] = { ...updated[index], [field]: value };
        setFees(updated);
    };

    const handleAdd = () => {
        setFees([
            ...fees,
            {
                revenue_type: FeeRevenueType.TABLE_TIME,
                pricing_model: PricingModel.PERCENTAGE,
                lower_bound_cents: 0,
                upper_bound_cents: 999999,
                percent: 0,
                flat_cents: 0,
            },
        ]);
    };

    const handleDelete = (index: number) => {
        const updated = [...fees];
        updated.splice(index, 1);
        setFees(updated);
    };

    const inputClass =
        "w-full border px-1 py-0.5 bg-white text-black dark:bg-gray-900 dark:text-white rounded";
    const selectClass =
        "w-full border px-1 py-0.5 bg-white text-black dark:bg-gray-900 dark:text-white rounded";

    const sortedFees = [...fees].sort((a, b) => {
        // First: sort by revenue_type (TABLE_TIME before STREAMING)
        const typeOrder = {
            [FeeRevenueType.TABLE_TIME]: 0,
            [FeeRevenueType.STREAMING]: 1,
        };
        const aType = typeOrder[a.revenue_type] ?? 99;
        const bType = typeOrder[b.revenue_type] ?? 99;
        if (aType !== bType) return aType - bType;

        // Then: sort by lower_bound_cents
        return (a.lower_bound_cents ?? 0) - (b.lower_bound_cents ?? 0);
    });

    return (
        <div className="space-y-4">
            <table className="w-full text-sm border border-gray-300 dark:border-gray-700">
                <thead className="bg-gray-100 text-black dark:bg-gray-800 dark:text-white">
                    <tr>
                        <th className="p-2 border dark:border-gray-700">Revenue Type</th>
                        <th className="p-2 border dark:border-gray-700">Pricing Model</th>
                        <th className="p-2 border dark:border-gray-700">Min (¢)</th>
                        <th className="p-2 border dark:border-gray-700">Max (¢)</th>
                        <th className="p-2 border dark:border-gray-700">Rate (%)</th>
                        <th className="p-2 border dark:border-gray-700">Flat (¢)</th>
                        <th className="p-2 border dark:border-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedFees.map((fee, i) => (
                        <tr key={i}>
                            <td className="p-1 border dark:border-gray-700">
                                <select
                                    value={fee.revenue_type}
                                    onChange={(e) => handleChange(i, "revenue_type", e.target.value)}
                                    className={selectClass}
                                >
                                    {Object.values(FeeRevenueType).map((val) => (
                                        <option key={val} value={val}>
                                            {val.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="p-1 border dark:border-gray-700">
                                <select
                                    value={fee.pricing_model}
                                    onChange={(e) => handleChange(i, "pricing_model", e.target.value)}
                                    className={selectClass}
                                >
                                    {Object.values(PricingModel).map((val) => (
                                        <option key={val} value={val}>
                                            {val.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="p-1 border dark:border-gray-700">
                                <input
                                    type="number"
                                    value={fee.lower_bound_cents ?? ""}
                                    onChange={(e) => handleChange(i, "lower_bound_cents", Number(e.target.value))}
                                    className={inputClass}
                                />
                            </td>
                            <td className="p-1 border dark:border-gray-700">
                                <input
                                    type="number"
                                    value={fee.upper_bound_cents ?? ""}
                                    onChange={(e) => handleChange(i, "upper_bound_cents", Number(e.target.value))}
                                    className={inputClass}
                                />
                            </td>
                            <td className="p-1 border dark:border-gray-700">
                                <input
                                    type="number"
                                    value={fee.percent ?? ""}
                                    onChange={(e) => handleChange(i, "percent", Number(e.target.value))}
                                    className={inputClass}
                                />
                            </td>
                            <td className="p-1 border dark:border-gray-700">
                                <input
                                    type="number"
                                    value={fee.flat_cents ?? ""}
                                    onChange={(e) => handleChange(i, "flat_cents", Number(e.target.value))}
                                    className={inputClass}
                                />
                            </td>
                            <td className="p-1 border text-center dark:border-gray-700">
                                <button
                                    onClick={() => handleDelete(i)}
                                    className="text-red-600 hover:underline dark:text-red-400"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-between">
                <button
                    onClick={handleAdd}
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-500"
                >
                    Add Row
                </button>
                <button
                    onClick={() => onSave(fees)}
                    className="bg-blue-700 text-white px-4 py-1 rounded hover:bg-blue-600"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}

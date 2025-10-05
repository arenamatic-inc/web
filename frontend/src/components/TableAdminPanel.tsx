import { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth";

// Table admin types
type Table = {
    id: number;
    room_id: number;
    name: string;
    table_type: string;
    in_service: boolean;
    table_controller_id?: number;
    light_controller?: string;
    price_policy_id: number;
};

type TableInput = Omit<Table, "id" | "room_id">;

type Props = {
    roomSlug: string;
};

export function TableAdminPanel({ roomSlug }: Props) {
    const { idToken } = useAuth();
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [editTable, setEditTable] = useState<Table | null>(null);
    const [error, setError] = useState("");

    // Fetch tables for this room
    const fetchTables = () => {
        if (!idToken || !roomSlug) return;
        setLoading(true);
        fetch(`${import.meta.env.VITE_API_BASE}/room/admin/${roomSlug}/table`, {
            headers: { Authorization: `Bearer ${idToken}` },
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch tables");
                return res.json();
            })
            .then(setTables)
            .catch(() => setTables([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTables();
        // eslint-disable-next-line
    }, [roomSlug, idToken]);

    const handleSave = async (table: TableInput, id?: number) => {
        setError("");
        try {
            const url = `${import.meta.env.VITE_API_BASE}/room/admin/${roomSlug}/table${id ? "/" + id : ""}`;
            const method = id ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(table),
            });
            if (!res.ok) throw new Error(await res.text());
            fetchTables();
            setShowCreate(false);
            setEditTable(null);
        } catch (err: any) {
            setError(err.message || "Failed to save table.");
        }
    };

    const handleDelete = async (id: number) => {
        setError("");
        if (!window.confirm("Remove this table? (It will remain in database, but not available for use.)")) return;
        try {
            await fetch(
                `${import.meta.env.VITE_API_BASE}/room/admin/${roomSlug}/table/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${idToken}` },
                }
            );
            fetchTables();
        } catch (err: any) {
            setError("Failed to remove table.");
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Tables</h3>
                <button
                    className="bg-black text-white px-3 py-1 rounded hover:bg-red-400"
                    onClick={() => setShowCreate(true)}
                >
                    Add Table
                </button>
            </div>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <div>
                {tables.length === 0 ? (
                    <div className="text-gray-500">No tables configured for this room.</div>
                ) : (
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100 text-xs">
                                <th>Name</th>
                                <th>Type</th>
                                <th>Controller</th>
                                <th>Light</th>
                                <th>Policy</th>
                                <th>In Service</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tables.map((t) => (
                                <tr key={t.id}>
                                    <td>{t.name}</td>
                                    <td>{t.table_type}</td>
                                    <td>{t.table_controller_id ?? ""}</td>
                                    <td>{t.light_controller ?? ""}</td>
                                    <td>{t.price_policy_id}</td>
                                    <td>{t.in_service ? "✅" : "❌"}</td>
                                    <td>
                                        <button
                                            className="text-xs text-blue-700 hover:underline mr-2"
                                            onClick={() => setEditTable(t)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="text-xs text-red-700 hover:underline"
                                            onClick={() => handleDelete(t.id)}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {(showCreate || editTable) && (
                <TableEditModal
                    table={editTable}
                    onClose={() => {
                        setShowCreate(false);
                        setEditTable(null);
                    }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

// TableEditModal is a simple form for add/edit. You may want to add price policy lookup in production.
function TableEditModal({
    table,
    onClose,
    onSave,
}: {
    table?: Table | null;
    onClose: () => void;
    onSave: (data: TableInput, id?: number) => void;
}) {
    const [form, setForm] = useState<TableInput>(
        table
            ? {
                name: table.name,
                table_type: table.table_type,
                in_service: table.in_service,
                table_controller_id: table.table_controller_id,
                light_controller: table.light_controller,
                price_policy_id: table.price_policy_id,
            }
            : {
                name: "",
                table_type: "",
                in_service: true,
                table_controller_id: undefined,
                light_controller: "",
                price_policy_id: 1,
            }
    );
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setForm((f) => ({
            ...f,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        await onSave(form, table?.id);
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
                <h2 className="text-lg font-bold mb-4">
                    {table ? "Edit Table" : "Add Table"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name *</label>
                        <input
                            className="w-full border rounded px-3 py-2"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Type *</label>
                        <input
                            className="w-full border rounded px-3 py-2"
                            name="table_type"
                            value={form.table_type}
                            onChange={handleChange}
                            required
                        />
                        {/* You might want to use a select for table_type if you have enums */}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Table Controller ID
                        </label>
                        <input
                            className="w-full border rounded px-3 py-2"
                            name="table_controller_id"
                            type="number"
                            value={form.table_controller_id ?? ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Light Controller
                        </label>
                        <input
                            className="w-full border rounded px-3 py-2"
                            name="light_controller"
                            value={form.light_controller ?? ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Price Policy ID *</label>
                        <input
                            className="w-full border rounded px-3 py-2"
                            name="price_policy_id"
                            type="number"
                            value={form.price_policy_id}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            <input
                                type="checkbox"
                                name="in_service"
                                checked={!!form.in_service}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            In Service
                        </label>
                    </div>
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            className="text-gray-500 hover:underline"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-black text-white px-4 py-2 rounded hover:bg-red-400"
                            disabled={submitting}
                        >
                            {submitting ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

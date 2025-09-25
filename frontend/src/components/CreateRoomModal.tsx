import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { TimezonePicker } from "./TimezonePicker"; // <-- import

type CreateRoomModalProps = {
    onClose: () => void;
    onCreated?: (room: Room) => void;
};

type Room = {
    id: number;
    name: string;
    slug: string;
    tz: string;
    currency: string;
    // Add other fields as needed
};

export function CreateRoomModal({ onClose, onCreated }: CreateRoomModalProps) {
    const { idToken } = useAuth();

    // Form state
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [tz, setTimezone] = useState("America/Toronto"); // default to local
    const [currency, setCurrency] = useState("CAD");
    const [email, setEmail] = useState("");
    const [showInApp, setShowInApp] = useState(false);
    const [enableWeb, setEnableWeb] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        if (!name || !slug || !tz || !currency) {
            setError("Please fill all required fields.");
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/room/admin/create`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    slug,
                    tz,
                    currency,
                    email,
                    show_in_app: showInApp,
                    enable_web: enableWeb,
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            const createdRoom = await res.json();
            if (onCreated) onCreated(createdRoom);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to create room.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
                <h2 className="text-lg font-bold mb-4">Create New Room</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name *</label>
                        <input
                            className="w-full border rounded px-3 py-2"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Slug *</label>
                        <input
                            className="w-full border rounded px-3 py-2"
                            value={slug}
                            onChange={e => setSlug(e.target.value)}
                            placeholder="e.g. ottawasnookerclub"
                            required
                        />
                    </div>
                    <TimezonePicker value={tz} onChange={setTimezone} />
                    <div>
                        <label className="block text-sm font-medium mb-1">Currency *</label>
                        <input
                            className="w-full border rounded px-3 py-2"
                            value={currency}
                            onChange={e => setCurrency(e.target.value)}
                            placeholder="CAD"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Contact Email</label>
                        <input
                            className="w-full border rounded px-3 py-2"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Optional"
                        />
                    </div>
                    <div>
                        <label>
                            <input type="checkbox" checked={showInApp} onChange={e => setShowInApp(e.target.checked)} />
                            Show in app
                        </label>
                    </div>
                    <div>
                        <label>
                            <input type="checkbox" checked={enableWeb} onChange={e => setEnableWeb(e.target.checked)} />
                            Enable website
                        </label>
                    </div>

                    {error && <div className="text-red-600">{error}</div>}
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
                            {submitting ? "Creating..." : "Create Room"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

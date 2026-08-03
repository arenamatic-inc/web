import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { TimezonePicker } from "./TimezonePicker";
import { RoomIPEditor } from "./RoomIPEditor";

type RoomIP = {
    id: number;
    room_id: number;
    ip: string;
};

type Room = {
    id: number;
    name: string;
    slug: string;
    street_address?: string;
    city?: string;
    province?: string;
    country?: string;
    postcode?: string;
    tz: string;
    currency: string;
    email?: string | null;
    tagline?: string | null;
    subline?: string | null;
    youtube_url?: string | null;
    instagram_url?: string | null;
    facebook_url?: string | null;
    stream_description?: string | null;
    stream_price_per_hour?: number | null;
    tax_name_1?: string | null;
    tax_pctx1000_1?: number;
    tax_name_2?: string | null;
    tax_pctx1000_2?: number;
    minimum_balance_to_play?: number;
    max_solo_minutes?: number;
    max_minutes_per_frame?: number;
    max_minutes_per_6reds?: number;
    show_in_app?: boolean;
    enable_web?: boolean;
    ips?: RoomIP[];
};

type Props = {
    room: Room;
    onSaved: (room: Room) => void;
};

const OPTIONAL_TEXT_FIELDS: Array<keyof Room> = [
    "email",
    "tagline",
    "subline",
    "youtube_url",
    "instagram_url",
    "facebook_url",
    "stream_description",
    "tax_name_1",
    "tax_name_2",
];

const NUMERIC_FIELDS: Array<keyof Room> = [
    "stream_price_per_hour",
    "tax_pctx1000_1",
    "tax_pctx1000_2",
    "minimum_balance_to_play",
    "max_solo_minutes",
    "max_minutes_per_frame",
    "max_minutes_per_6reds",
];

export function RoomConfigForm({ room, onSaved }: Props) {
    const { idToken } = useAuth();
    const [form, setForm] = useState<Room>(room);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [ips, setIps] = useState<RoomIP[]>(room.ips || []);

    useEffect(() => {
        setForm(room);
    }, [room]);

    useEffect(() => {
        if (!room.ips) {
            fetch(`${import.meta.env.VITE_API_BASE}/room/admin/${room.slug}/ip`, {
                headers: { Authorization: `Bearer ${idToken}` },
            })
                .then(res => res.json())
                .then(setIps)
                .catch(() => setIps([]));
        }
    }, [room.slug, room.ips, idToken]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setForm(prev => {
            if (type === "checkbox") {
                return { ...prev, [name]: checked };
            }

            if (NUMERIC_FIELDS.includes(name as keyof Room)) {
                return { ...prev, [name]: value === "" ? null : Number(value) };
            }

            return { ...prev, [name]: value };
        });

        setSuccess(false);
    };

    const handleTimezoneChange = (tz: string) => {
        setForm(prev => ({ ...prev, tz }));
        setSuccess(false);
    };

    const buildPayload = (current: Room) => {
        const payload: Record<string, unknown> = {
            ...current,
            timezone: current.tz,
        };

        for (const key of OPTIONAL_TEXT_FIELDS) {
            const value = payload[key as string];
            if (typeof value === "string" && value.trim() === "") {
                payload[key as string] = null;
            }
        }

        return payload;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess(false);

        try {
            const payload = buildPayload(form);
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/room/admin/${room.slug}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(await res.text());
            const updated = await res.json();
            onSaved(updated);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to update room.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-6 shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium mb-1">Slug</label>
                    <input
                        className="w-full border rounded px-3 py-2 bg-gray-100"
                        name="slug"
                        value={form.slug}
                        onChange={handleChange}
                        disabled
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TimezonePicker value={form.tz} onChange={handleTimezoneChange} />
                <div>
                    <label className="block text-sm font-medium mb-1">Currency</label>
                    <input
                        className="w-full border rounded px-3 py-2 bg-gray-100"
                        name="currency"
                        value={form.currency}
                        onChange={handleChange}
                        disabled
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Street Address</label>
                    <input className="w-full border rounded px-3 py-2" name="street_address" value={form.street_address || ""} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input className="w-full border rounded px-3 py-2" name="city" value={form.city || ""} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Province/State</label>
                    <input className="w-full border rounded px-3 py-2" name="province" value={form.province || ""} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input className="w-full border rounded px-3 py-2" name="country" value={form.country || ""} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Postcode</label>
                    <input className="w-full border rounded px-3 py-2" name="postcode" value={form.postcode || ""} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Contact Email</label>
                    <input className="w-full border rounded px-3 py-2" name="email" value={form.email || ""} onChange={handleChange} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Tagline</label>
                    <input className="w-full border rounded px-3 py-2" name="tagline" value={form.tagline || ""} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Subline</label>
                    <input className="w-full border rounded px-3 py-2" name="subline" value={form.subline || ""} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">YouTube URL</label>
                    <input className="w-full border rounded px-3 py-2" name="youtube_url" value={form.youtube_url || ""} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Instagram URL</label>
                    <input className="w-full border rounded px-3 py-2" name="instagram_url" value={form.instagram_url || ""} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Facebook URL</label>
                    <input className="w-full border rounded px-3 py-2" name="facebook_url" value={form.facebook_url || ""} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Stream Price Per Hour (cents)</label>
                    <input
                        className="w-full border rounded px-3 py-2"
                        name="stream_price_per_hour"
                        type="number"
                        min={0}
                        value={form.stream_price_per_hour ?? ""}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Stream Description</label>
                <textarea
                    className="w-full border rounded px-3 py-2 min-h-[90px]"
                    name="stream_description"
                    value={form.stream_description || ""}
                    onChange={handleChange}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Tax Name 1</label>
                    <input className="w-full border rounded px-3 py-2" name="tax_name_1" value={form.tax_name_1 || ""} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Tax Rate 1 (x1000)</label>
                    <input
                        className="w-full border rounded px-3 py-2"
                        name="tax_pctx1000_1"
                        type="number"
                        value={form.tax_pctx1000_1 ?? 0}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Tax Name 2</label>
                    <input className="w-full border rounded px-3 py-2" name="tax_name_2" value={form.tax_name_2 || ""} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Tax Rate 2 (x1000)</label>
                    <input
                        className="w-full border rounded px-3 py-2"
                        name="tax_pctx1000_2"
                        type="number"
                        value={form.tax_pctx1000_2 ?? 0}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Minimum Balance To Play (cents)</label>
                    <input
                        className="w-full border rounded px-3 py-2"
                        name="minimum_balance_to_play"
                        type="number"
                        min={0}
                        value={form.minimum_balance_to_play ?? 0}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Max Solo Minutes</label>
                    <input className="w-full border rounded px-3 py-2" name="max_solo_minutes" type="number" min={0} value={form.max_solo_minutes ?? 0} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Max Minutes Per Frame</label>
                    <input className="w-full border rounded px-3 py-2" name="max_minutes_per_frame" type="number" min={0} value={form.max_minutes_per_frame ?? 0} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Max Minutes Per 6 Reds</label>
                    <input className="w-full border rounded px-3 py-2" name="max_minutes_per_6reds" type="number" min={0} value={form.max_minutes_per_6reds ?? 0} onChange={handleChange} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-sm font-medium mb-1">
                    <input
                        type="checkbox"
                        name="show_in_app"
                        checked={!!form.show_in_app}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    Show in App
                </label>
                <label className="block text-sm font-medium mb-1">
                    <input
                        type="checkbox"
                        name="enable_web"
                        checked={!!form.enable_web}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    Enable Web
                </label>
            </div>

            <div>
                <RoomIPEditor roomSlug={room.slug} ips={ips} onChanged={setIps} />
            </div>

            {error && <div className="text-red-600">{error}</div>}
            {success && <div className="text-green-600">Changes saved.</div>}

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded hover:bg-red-400"
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}

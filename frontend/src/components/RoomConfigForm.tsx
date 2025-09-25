import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { TimezonePicker } from "./TimezonePicker"; // <-- import

type Room = {
  id: number;
  name: string;
  slug: string;
  tz: string;
  currency: string;
  email?: string;
  show_in_app?: boolean;
  enable_web?: boolean;
  // Add more as needed
};

type Props = {
  room: Room;
  onSaved: (room: Room) => void;
};

export function RoomConfigForm({ room, onSaved }: Props) {
  const { idToken } = useAuth();
  const [form, setForm] = useState<Room>(room);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSuccess(false);
  };

  // NEW: Handle timezone change
  const handleTimezoneChange = (tz: string) => {
    setForm(f => ({ ...f, tz }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/room/admin/${room.slug}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );
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
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl p-6 shadow">
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
      <TimezonePicker value={form.tz} onChange={handleTimezoneChange} />
      <div>
        <label className="block text-sm font-medium mb-1">Currency *</label>
        <input
          className="w-full border rounded px-3 py-2"
          name="currency"
          value={form.currency}
          onChange={handleChange}
          required
          disabled
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Contact Email</label>
        <input
          className="w-full border rounded px-3 py-2"
          name="email"
          value={form.email || ""}
          onChange={handleChange}
          placeholder="Optional"
        />
      </div>
      <div>
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
      </div>
      <div>
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
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">Changes saved!</div>}
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

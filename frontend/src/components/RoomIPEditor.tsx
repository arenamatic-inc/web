import { useState } from "react";
import { useAuth } from "../auth/useAuth";

type RoomIP = {
  id: number;
  room_id: number;
  ip: string;
};

type Props = {
  roomSlug: string;
  ips: RoomIP[];
  onChanged: (newIps: RoomIP[]) => void;
};

export function RoomIPEditor({ roomSlug, ips, onChanged }: Props) {
  const { idToken } = useAuth();
  const [newIp, setNewIp] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingIp, setEditingIp] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const apiBase = import.meta.env.VITE_API_BASE;

  // Add new IP
  const handleAdd = async () => {
    if (!newIp.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/room/admin/${roomSlug}/ip`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ip: newIp }),
      });
      if (!res.ok) throw new Error(await res.text());
      const added: RoomIP = await res.json();
      onChanged([...ips, added]);
      setNewIp("");
    } catch (err: any) {
      setError(err.message || "Failed to add IP");
    } finally {
      setSaving(false);
    }
  };

  // Edit existing IP
  const handleEdit = (ip: RoomIP) => {
    setEditingId(ip.id);
    setEditingIp(ip.ip);
  };

  const handleSaveEdit = async (id: number) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/room/admin/${roomSlug}/ip/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ip: editingIp }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated: RoomIP = await res.json();
      onChanged(ips.map(ip => (ip.id === id ? updated : ip)));
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || "Failed to update IP");
    } finally {
      setSaving(false);
    }
  };

  // Delete IP
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this IP?")) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/room/admin/${roomSlug}/ip/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      onChanged(ips.filter(ip => ip.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete IP");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded p-4 my-4">
      <label className="block text-sm font-medium mb-1">Allowed Room IPs</label>
      <div className="space-y-1">
        {ips.map(ip => (
          <div key={ip.id} className="flex items-center gap-2">
            {editingId === ip.id ? (
              <>
                <input
                  className="border rounded px-2 py-1 text-sm"
                  value={editingIp}
                  onChange={e => setEditingIp(e.target.value)}
                  maxLength={16}
                />
                <button
                  type="button"
                  className="text-green-600 text-xs"
                  onClick={() => handleSaveEdit(ip.id)}
                  disabled={saving}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="text-gray-500 text-xs"
                  onClick={() => setEditingId(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="text-xs font-mono">{ip.ip}</span>
                <button
                  type="button"
                  className="text-blue-500 text-xs"
                  onClick={() => handleEdit(ip)}
                  disabled={saving}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="text-red-500 text-xs"
                  onClick={() => handleDelete(ip.id)}
                  disabled={saving}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          className="border rounded px-2 py-1 text-sm"
          placeholder="Add IP"
          value={newIp}
          onChange={e => setNewIp(e.target.value)}
          maxLength={16}
        />
        <button
          type="button"
          className="bg-black text-white text-xs px-3 py-1 rounded"
          onClick={handleAdd}
          disabled={saving}
        >
          Add
        </button>
      </div>
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
}

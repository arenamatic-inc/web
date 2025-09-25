// components/RoomSelector.tsx

import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";

type Room = {
  id: number;
  name: string;
  slug: string;
};

type RoomSelectorProps = {
  value: string | null;         // slug, not id!
  onChange: (roomSlug: string) => void;
};

export function RoomSelector({ value, onChange }: RoomSelectorProps) {
  const { idToken } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idToken) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_BASE}/room`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then(res => res.json())
      .then(setRooms)
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [idToken]);

  return (
    <div>
      <label className="block font-medium text-sm mb-1">Select Room:</label>
      <select
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="border px-3 py-1 rounded w-64"
      >
        <option value="" disabled>
          -- Choose a room --
        </option>
        {rooms.map(room => (
          <option key={room.slug} value={room.slug}>
            {room.name} ({room.slug})
          </option>
        ))}
      </select>
      {loading && <div className="text-gray-400 text-xs">Loading rooms…</div>}
    </div>
  );
}

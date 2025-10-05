import { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { RoomSelector } from "../../components/RoomSelector";
import { CreateRoomModal } from "../../components/CreateRoomModal";
import { RoomConfigForm } from "../../components/RoomConfigForm";
import { TableAdminPanel } from "../../components/TableAdminPanel";

type Room = {
  id: number;
  name: string;
  slug: string;
  tz: string;
  currency: string;
  email?: string;
  show_in_app?: boolean;
  enable_web?: boolean;
};

export default function RoomAdminPage() {
  const { idToken } = useAuth();
  const [selectedRoomSlug, setSelectedRoomSlug] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [roomsVersion, setRoomsVersion] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedRoomSlug || !idToken) {
      setRoom(null);
      return;
    }
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_BASE}/room/admin/${selectedRoomSlug}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${idToken}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Room not found");
        return res.json();
      })
      .then(setRoom)
      .catch(() => setRoom(null))
      .finally(() => setLoading(false));
  }, [selectedRoomSlug, idToken, roomsVersion]);

  const handleCreatedRoom = (newRoom: Room) => {
    setShowCreate(false);
    setRoomsVersion(v => v + 1);
    setSelectedRoomSlug(newRoom.slug);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center space-x-4 mb-6">
        <RoomSelector
          value={selectedRoomSlug}
          onChange={setSelectedRoomSlug}
          key={roomsVersion}
        />
        <button
          className="bg-black text-white px-4 py-2 rounded hover:bg-red-400"
          onClick={() => setShowCreate(true)}
        >
          Create Room
        </button>
      </div>
      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreatedRoom}
        />
      )}
      {loading && <div className="mt-8 text-gray-500">Loading room info…</div>}
      {!room && selectedRoomSlug && !loading && (
        <div className="mt-8 text-red-500">Room not found.</div>
      )}
      {room && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 items-start">
          <div>
            <h2 className="text-xl font-semibold mb-4">Room Config</h2>
            <RoomConfigForm room={room} onSaved={setRoom} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Table Admin</h2>
            <TableAdminPanel roomSlug={room.slug} />
          </div>
        </div>
      )}
    </div>
  );
}

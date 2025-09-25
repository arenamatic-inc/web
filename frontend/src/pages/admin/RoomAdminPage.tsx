import { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { RoomSelector } from "../../components/RoomSelector";
import { CreateRoomModal } from "../../components/CreateRoomModal";
import { RoomConfigForm } from "../../components/RoomConfigForm";

type Room = {
  id: number;
  name: string;
  slug: string;
  tz: string;
  currency: string;
  email?: string;
  show_in_app?: boolean;
  enable_web?: boolean;
  // ...any other fields for config
};

export default function RoomAdminPage() {
  const { idToken } = useAuth();

  const [selectedRoomSlug, setSelectedRoomSlug] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [roomsVersion, setRoomsVersion] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch selected room details
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

  // On create, refresh selector and select the new room
  const handleCreatedRoom = (newRoom: Room) => {
    setShowCreate(false);
    setRoomsVersion(v => v + 1);
    setSelectedRoomSlug(newRoom.slug); // auto-select by slug
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
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
      {room && !loading && (
        <div className="mt-8">
          <RoomConfigForm room={room} onSaved={setRoom} />
        </div>
      )}
      {!room && selectedRoomSlug && !loading && (
        <div className="mt-8 text-red-500">Room not found.</div>
      )}
    </div>
  );
}

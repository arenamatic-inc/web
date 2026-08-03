import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";

type UserSummary = {
    id?: string | null;
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    display_name?: string | null;
};

type RoomAdminManagerProps = {
    roomSlug: string;
};

function formatUserLabel(user: UserSummary) {
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
    const nickname = user.display_name?.trim();
    if (fullName && nickname) {
        return `${fullName} (${nickname})`;
    }
    return fullName || nickname || user.email || user.id || "Unknown user";
}

export function RoomAdminManager({ roomSlug }: RoomAdminManagerProps) {
    const { idToken } = useAuth();
    const [admins, setAdmins] = useState<UserSummary[]>([]);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserSummary[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [searching, setSearching] = useState(false);
    const [mutatingUserId, setMutatingUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!idToken || !roomSlug) {
            setAdmins([]);
            return;
        }

        setLoadingAdmins(true);
        setError(null);

        fetch(`${import.meta.env.VITE_API_BASE}/room/admin/${roomSlug}/admins`, {
            headers: { Authorization: `Bearer ${idToken}` },
        })
            .then(async res => {
                if (!res.ok) {
                    throw new Error("Failed to load room admins");
                }
                return res.json();
            })
            .then(setAdmins)
            .catch(err => {
                setError(err instanceof Error ? err.message : "Failed to load room admins");
                setAdmins([]);
            })
            .finally(() => setLoadingAdmins(false));
    }, [idToken, roomSlug]);

    useEffect(() => {
        if (!idToken || query.trim().length < 3) {
            setResults([]);
            return;
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => {
            setSearching(true);
            fetch(
                `${import.meta.env.VITE_API_BASE}/room/admin/users/search?search_string=${encodeURIComponent(query.trim())}`,
                {
                    headers: { Authorization: `Bearer ${idToken}` },
                    signal: controller.signal,
                },
            )
                .then(async res => {
                    if (!res.ok) {
                        throw new Error("Failed to search users");
                    }
                    return res.json();
                })
                .then(setResults)
                .catch(err => {
                    if (err instanceof DOMException && err.name === "AbortError") {
                        return;
                    }
                    setError(err instanceof Error ? err.message : "Failed to search users");
                    setResults([]);
                })
                .finally(() => setSearching(false));
        }, 250);

        return () => {
            controller.abort();
            window.clearTimeout(timeoutId);
        };
    }, [idToken, query]);

    const adminIds = useMemo(() => new Set(admins.map(admin => admin.id).filter(Boolean)), [admins]);

    const visibleResults = results.filter(result => result.id && !adminIds.has(result.id));

    const updateAdmins = async (url: string, method: "POST" | "DELETE", userId: string) => {
        if (!idToken) {
            return;
        }

        setMutatingUserId(userId);
        setError(null);

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json",
                },
                body: method === "POST" ? JSON.stringify({ user_id: userId }) : undefined,
            });

            if (!res.ok) {
                throw new Error(method === "POST" ? "Failed to add room admin" : "Failed to remove room admin");
            }

            const updatedAdmins = await res.json();
            setAdmins(updatedAdmins);
            if (method === "POST") {
                setQuery("");
                setResults([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update room admins");
        } finally {
            setMutatingUserId(null);
        }
    };

    return (
        <div className="border rounded-lg p-4 space-y-4 bg-white">
            <div>
                <h2 className="text-xl font-semibold">Room Admins</h2>
                <p className="text-sm text-gray-600">
                    Room admins receive the full room permission set, including permission delegation.
                </p>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Add room admin</label>
                <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Search users by name, email, or phone"
                    className="w-full border rounded px-3 py-2"
                />
                <div className="text-xs text-gray-500">Search is global and restricted to global room admins.</div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            {query.trim().length > 0 && query.trim().length < 3 && (
                <div className="text-sm text-gray-500">Enter at least 3 characters to search.</div>
            )}

            {searching && <div className="text-sm text-gray-500">Searching users…</div>}

            {!searching && visibleResults.length > 0 && (
                <div className="border rounded divide-y">
                    {visibleResults.map(result => (
                        <div key={result.id} className="flex items-center justify-between px-3 py-2 gap-3">
                            <div>
                                <div className="font-medium">{formatUserLabel(result)}</div>
                                <div className="text-sm text-gray-500">{result.email || result.id}</div>
                            </div>
                            <button
                                type="button"
                                disabled={!result.id || mutatingUserId === result.id}
                                onClick={() => result.id && updateAdmins(`${import.meta.env.VITE_API_BASE}/room/admin/${roomSlug}/admins`, "POST", result.id)}
                                className="bg-black text-white px-3 py-1 rounded disabled:opacity-50"
                            >
                                {mutatingUserId === result.id ? "Adding..." : "Add"}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {!searching && query.trim().length >= 3 && visibleResults.length === 0 && (
                <div className="text-sm text-gray-500">No matching users available to add.</div>
            )}

            <div className="space-y-2">
                <div className="text-sm font-medium">Current room admins</div>
                {loadingAdmins ? (
                    <div className="text-sm text-gray-500">Loading room admins…</div>
                ) : admins.length === 0 ? (
                    <div className="text-sm text-gray-500">No room admins assigned yet.</div>
                ) : (
                    <div className="border rounded divide-y">
                        {admins.map(admin => (
                            <div key={admin.id} className="flex items-center justify-between px-3 py-2 gap-3">
                                <div>
                                    <div className="font-medium">{formatUserLabel(admin)}</div>
                                    <div className="text-sm text-gray-500">{admin.email || admin.id}</div>
                                </div>
                                <button
                                    type="button"
                                    disabled={!admin.id || mutatingUserId === admin.id}
                                    onClick={() =>
                                        admin.id &&
                                        updateAdmins(
                                            `${import.meta.env.VITE_API_BASE}/room/admin/${roomSlug}/admins/${admin.id}`,
                                            "DELETE",
                                            admin.id,
                                        )
                                    }
                                    className="border border-red-300 text-red-700 px-3 py-1 rounded disabled:opacity-50"
                                >
                                    {mutatingUserId === admin.id ? "Removing..." : "Remove"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
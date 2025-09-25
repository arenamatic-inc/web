import React, { useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { useSite } from "../../SiteContext";

export default function ArenamaticAdmin() {
    const { user, login, logout, permissions } = useAuth();
    const { isArenamaticSite } = useSite();

    useEffect(() => {
        document.title = "Arenamatic Admin";

        const favicon = document.querySelector("link[rel='icon']") || document.createElement("link");
        favicon.setAttribute("rel", "icon");
        favicon.setAttribute("href", "https://d2o72uxgym8vs9.cloudfront.net/arenamatic/arenamatic_favicon.png");
        document.head.appendChild(favicon);
    }, []);

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans py-20 px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Arenamatic Admin</h1>

                {user ? (
                    <div className="text-lg text-gray-800 space-y-4">
                        <div>
                            Logged in as <span className="font-semibold">{user.email}</span>.
                        </div>
                        <div>
                            <h1>Is Arenamatic Site: {isArenamaticSite ? "Yes" : "No"}</h1>
                        </div>
                        <h1>Permissions</h1>:
                        {permissions && (
                            <div className="text-sm text-gray-700">
                                <div className="mb-2 font-semibold">Global Permissions:</div>
                                <ul className="list-disc list-inside ml-4">
                                    {permissions.global_permissions?.length > 0 ? (
                                        permissions.global_permissions.map(p => <li key={p}>{p}</li>)
                                    ) : (
                                        <li className="italic text-gray-500">None</li>
                                    )}
                                </ul>

                                <div className="mt-4 mb-2 font-semibold">Room Permissions:</div>
                                <ul className="list-disc list-inside ml-4">
                                    {permissions.room_permissions?.length > 0 ? (
                                        permissions.room_permissions.map(p => <li key={p}>{p}</li>)
                                    ) : (
                                        <li className="italic text-gray-500">None</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={logout}
                            className="bg-gray-200 text-gray-800 px-5 py-2 rounded hover:bg-gray-300 transition"
                        >
                            Logout
                        </button>
                        {permissions?.global_permissions.includes("GlobalManageRoomFees") && (
                            <div className="mt-6">
                                <a
                                    href="/admin/room-fees"
                                    className="bg-blue-900 text-white px-5 py-2 rounded hover:bg-blue-800 transition"
                                >
                                    Manage Room Fees
                                </a>
                            </div>
                        )}
                        {permissions?.global_permissions.includes("GlobalManageRooms") && (
                            <div className="mt-6">
                                <a
                                    href="/admin/room-config"
                                    className="bg-blue-900 text-white px-5 py-2 rounded hover:bg-blue-800 transition"
                                >
                                    Manage Rooms
                                </a>
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="text-lg text-red-600">
                        Not logged in.
                        <div className="mt-4">
                            <button
                                onClick={login}
                                className="bg-blue-900 text-white px-5 py-2 rounded hover:bg-blue-800 transition"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

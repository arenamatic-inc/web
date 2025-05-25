import { useEffect, useState } from "react";
import { useAuth } from "./auth/useAuth";
import PageLayout from "./PageLayout";
import { authFetch } from "./utils/authFetch";
import { getRoomSlug } from "./utils/roomSlug";

type UserInfo = {
    id: string;
    email: string;
    email_verified: boolean;
    first_name: string;
    last_name: string;
    phone_number: string;
    display_name: string;
    handicap: number;
    id_verified: boolean;
};

type Permissions = {
    user_id: string;
    global_permissions: string[];
    room_permissions: string[];
    event_permissions: string[];
};

export default function Account() {
    const { user, idToken } = useAuth();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [permissions, setPermissions] = useState<Permissions | null>(null);
    const [error, setError] = useState<string | null>(null);
    const slug = getRoomSlug();

    useEffect(() => {
        async function loadAccountData() {
            const slug = await getRoomSlug();
            if (!slug) return;

            try {
                const [userRes, permRes] = await Promise.all([
                    authFetch(`${import.meta.env.VITE_API_BASE}/user/me`),
                    authFetch(`${import.meta.env.VITE_API_BASE}/user/web/mypermissions`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ room_slug: slug }),
                    }),
                ]);

                const [userData, permData] = await Promise.all([
                    userRes.json(),
                    permRes.json(),
                ]);

                setUserInfo(userData);
                setPermissions(permData);
            } catch (err) {
                console.error("Error loading account data:", err);
                setError("Failed to load account info or permissions");
            }
        }

        loadAccountData();
    }, []);
    if (!user) {
        return (
            <PageLayout>
                <div className="p-8 text-white">Not logged in.</div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
          <div className="max-w-2xl mx-auto p-8 text-white space-y-4">
            <h1 className="text-2xl font-bold">Account</h1>
      
            {error && (
              <div className="bg-red-900 p-4 rounded text-sm text-red-300">
                Error: {error}
              </div>
            )}
      
            {userInfo && (
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">First Name:</span> {userInfo.first_name}
                </div>
                <div>
                  <span className="font-semibold">Last Name:</span> {userInfo.last_name}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {userInfo.email}
                </div>
              </div>
            )}
          </div>
        </PageLayout>
      );
      }

import { useEffect, useState } from "react";
import { useAuth } from "./auth/useAuth";
import PageLayout from "./PageLayout";
import { authFetch } from "./utils/authFetch";

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
    const slug = localStorage.getItem("room_slug")

    useEffect(() => {
        authFetch(`${import.meta.env.VITE_API_BASE}/user/me`)
          .then(res => res.json())
          .then(setUserInfo)
          .catch(err => {
            console.error("User info fetch failed:", err);
            setError("Failed to load user info");
          });
    
          authFetch(`${import.meta.env.VITE_API_BASE}/user/web/mypermissions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json", // required for FastAPI to parse JSON
            },
            body: JSON.stringify({
              room_slug: slug,
            }),
          })
            .then(res => res.json())
            .then(setPermissions)
            .catch(err => {
              console.error("Permissions fetch failed:", err);
              setError("Failed to load permissions");
            });
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
            <div className="max-w-3xl mx-auto p-8 text-white space-y-8">
                <h1 className="text-2xl font-bold">Account</h1>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Cognito User</h2>
                    <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </section>

                {error && (
                    <div className="bg-red-900 p-4 rounded text-sm text-red-300">
                        Error: {error}
                    </div>
                )}

                {userInfo && (
                    <section>
                        <h2 className="text-xl font-semibold mb-2">User Info (/user/me)</h2>
                        <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(userInfo, null, 2)}
                        </pre>
                    </section>
                )}

                {permissions && (
                    <section>
                        <h2 className="text-xl font-semibold mb-2">Permissions (/user/mypermissions)</h2>
                        <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(permissions, null, 2)}
                        </pre>
                    </section>
                )}
            </div>
        </PageLayout>
    );
}

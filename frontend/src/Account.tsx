import { useEffect, useState } from "react";
import { useAuth } from "./auth/useAuth";
import PageLayout from "./PageLayout";

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

    useEffect(() => {
        const token = localStorage.getItem('id_token');

        fetch(`${import.meta.env.VITE_API_BASE}/user/me`, {
            headers: {
                Authorization: `Bearer ${token}`, // if needed
            },
        })
            .then(res => res.json())
            .then(data => console.log('User data:', data))
            .catch(err => console.error('Error fetching user:', err));
    }, []);

    useEffect(() => {
        if (!user || !idToken) return;

        const fetchData = async () => {
            try {
                const resUser = await fetch(`${import.meta.env.VITE_API_BASE}/user/me`, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });
                if (!resUser.ok) throw new Error("Failed to fetch /user/me");
                const userData = await resUser.json();
                setUserInfo(userData);

                const resPerms = await fetch("https://api.ottawasnookerclub.com/user/mypermissions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                });
                if (!resPerms.ok) throw new Error("Failed to fetch /user/mypermissions");
                const permsData = await resPerms.json();
                setPermissions(permsData);
            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchData();
    }, [user, idToken]);

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

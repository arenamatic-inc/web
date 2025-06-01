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

export default function Account() {
  const { user, permissions } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccountData() {
      try {
        const res = await authFetch(`${import.meta.env.VITE_API_BASE}/user/me`);
        if (!res.ok) throw new Error("Failed to fetch user info");
        const userData = await res.json();
        setUserInfo(userData);
      } catch (err) {
        console.error("Error loading account data:", err);
        setError("Failed to load account info");
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

        <div className="mt-6">
          <h2 className="text-xl font-semibold">Permissions</h2>
          {permissions ? (
            <pre className="bg-gray-800 text-green-200 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(permissions, null, 2)}
            </pre>
          ) : (
            <p>Loading permissions...</p>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

import { useEffect, useState } from "react";

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

export function useUserProfile() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resUser = await fetch(`${import.meta.env.VITE_API_BASE}/user/me`);
        if (!resUser.ok) throw new Error("Failed to fetch user");
        const user: UserInfo = await resUser.json();
        setUserInfo(user);

        const resPerms = await fetch(`${import.meta.env.VITE_API_BASE}/user/mypermissions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("id_token")}`,
            },
            body: JSON.stringify({}),
          });
                            if (!resPerms.ok) throw new Error("Failed to fetch permissions");
        const perms: Permissions = await resPerms.json();
        setPermissions(perms);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { userInfo, permissions, loading, error };
}

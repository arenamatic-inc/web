import { createContext, useEffect, useState } from "react";
import { generateCodeChallenge, generateRandomString } from "./pkce";
import { getRoomSlug } from "../utils/roomSlug";
import { useSite } from "../SiteContext";

type User = {
  sub: string;
  email?: string;
  name?: string;
  [key: string]: any;
};

type Permissions = {
  user_id: string;
  global_permissions: string[];
  room_permissions: string[];
  event_permissions: string[];
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  idToken: string | null;
  permissions: Permissions | null;
  login: () => void;
  logout: () => void;
  refreshAuth: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isArenamaticSite } = useSite();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);

  // ✅ Always run on first load
  useEffect(() => {
    refreshAuth();
  }, []);

  // ✅ Re-fetch permissions if token and site identity are both available
  useEffect(() => {
    console.log("[AuthContext] Should we fecth? isArenamaticSite =", isArenamaticSite);

    if (idToken && isArenamaticSite !== undefined) {
      fetchPermissions(idToken);
    }
  }, [idToken, isArenamaticSite]);

  const refreshAuth = () => {
    const idTokenRaw = localStorage.getItem("id_token");
    const access = localStorage.getItem("access_token");

    if (idTokenRaw && access) {
      try {
        const decoded = JSON.parse(atob(idTokenRaw.split(".")[1]));
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp && decoded.exp < now) {
          console.warn("ID token expired");
          localStorage.removeItem("id_token");
          localStorage.removeItem("access_token");
          localStorage.removeItem("pkce_verifier");
          setUser(null);
          setAccessToken(null);
          setIdToken(null);
          setPermissions(null);
          return;
        }

        setUser(decoded);
        setAccessToken(access);
        setIdToken(idTokenRaw);

        // Optional immediate fetch if context is already resolved
        if (isArenamaticSite !== undefined) {
          fetchPermissions(idTokenRaw);
        }
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("id_token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("pkce_verifier");
        setUser(null);
        setAccessToken(null);
        setIdToken(null);
        setPermissions(null);
      }
    } else {
      setUser(null);
      setAccessToken(null);
      setIdToken(null);
      setPermissions(null);
    }
  };

  const fetchPermissions = async (token: string) => {
    try {
      const slug = isArenamaticSite ? "ottawa" : await getRoomSlug();

      console.log("[AuthContext] Fetching permissions with slug:", slug);

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/user/web/mypermissions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ room_slug: slug }),
      });

      if (!res.ok) throw new Error("Failed to fetch permissions");

      const data = await res.json();

      if (isArenamaticSite) {
        data.room_permissions = [];
        data.event_permissions = [];
      }

      setPermissions(data);
    } catch (err) {
      console.error("[AuthContext] Failed to load permissions", err);
      setPermissions(null);
    }
  };

  const login = () => {
    const state = `${window.location.origin}/login/finish`;
    window.location.href = `https://${import.meta.env.VITE_AUTH_HOST}/login?state=${encodeURIComponent(state)}`;
  };

  const logout = () => {
    const currentUrl = window.location.href;
    localStorage.removeItem("id_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("pkce_verifier");
    setUser(null);
    setAccessToken(null);
    setIdToken(null);
    setPermissions(null);

    const logoutUrl = `https://${import.meta.env.VITE_AUTH_HOST}/logout?state=${encodeURIComponent(currentUrl)}`;
    window.location.href = logoutUrl;
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, idToken, permissions, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

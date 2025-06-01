// src/auth/AuthContext.tsx
import { createContext, useEffect, useState } from "react";
import { generateCodeChallenge, generateRandomString } from "./pkce";
import { getRoomSlug } from "../utils/roomSlug"; // at the top

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
  const [idToken, setIdToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);

  useEffect(() => {
    refreshAuth();
  }, []);

  const refreshAuth = () => {
    const idTokenRaw = localStorage.getItem("id_token");
    const access = localStorage.getItem("access_token");
    if (idTokenRaw && access) {
      try {
        const decoded = JSON.parse(atob(idTokenRaw.split(".")[1]));
        setUser(decoded);
        setAccessToken(access);
        setIdToken(idTokenRaw);
      } catch (err) {
        console.error("Invalid token", err);
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

  useEffect(() => {
    if (!idToken) return;
  
    (async () => {
      try {
        const slug = await getRoomSlug();
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/user/web/mypermissions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ room_slug: slug }),
        });
  
        if (!res.ok) throw new Error("Failed to fetch permissions");
        const data = await res.json();
        setPermissions(data);
      } catch (err) {
        console.error("[AuthContext] Failed to load permissions", err);
        setPermissions(null);
      }
    })();
  }, [idToken]);
    
  function login() {
    const state = `${window.location.origin}/login/finish`; // The same as before, this is where the user will end up after login.
    window.location.href = `https://${import.meta.env.VITE_AUTH_HOST}/login?state=${encodeURIComponent(state)}`;
  }

  const logout = () => {
    const currentUrl = window.location.href;  // The club site URL to return after logout
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


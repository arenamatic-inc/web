// src/auth/AuthContext.tsx
import { createContext, useEffect, useState } from "react";

type User = {
  sub: string;
  email?: string;
  name?: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  refreshAuth: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    refreshAuth();
  }, []);

  const refreshAuth = () => {
    const idToken = localStorage.getItem("id_token");
    const access = localStorage.getItem("access_token");
    if (idToken && access) {
      try {
        const decoded = JSON.parse(atob(idToken.split(".")[1]));
        setUser(decoded);
        setAccessToken(access);
      } catch (err) {
        console.error("Invalid token", err);
        setUser(null);
        setAccessToken(null);
      }
    } else {
      setUser(null);
      setAccessToken(null);
    }
  };

  const login = () => {
    window.location.href = "/"; // or trigger PKCE logic if needed
  };

  const logout = () => {
    localStorage.removeItem("id_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("pkce_verifier");
    setUser(null);
    setAccessToken(null);

    const clubReturnUrl = window.location.origin; // e.g. https://mysnookerclub.click
    const fragment = `#return=${encodeURIComponent(clubReturnUrl)}`;

    const logoutUrl =
      `https://ca-central-1zs2itfxku.auth.ca-central-1.amazoncognito.com/logout` +
      `?client_id=569l6bgvhq1pltqjhk58s1ufek` +
      `&logout_uri=https://auth.arenamatic.ca/logout/callback` +
      fragment; // 👈 goes after the query string

    console.log("[Logout] Redirecting to:", logoutUrl);
    window.location.href = logoutUrl;
  };
  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}


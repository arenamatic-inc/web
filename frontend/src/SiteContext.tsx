import React, { createContext, useContext } from "react";

type SiteContextType = {
  isArenamaticSite: boolean | undefined;
  isAuthHost: boolean;
};

const SiteContext = createContext<SiteContextType>({
  isArenamaticSite: undefined,  // ✅ so consumers can detect loading
  isAuthHost: false,
});

export const SiteProvider = ({ children }: { children: React.ReactNode }) => {
  const hostname = window.location.hostname.toLowerCase();

  const parseHosts = (raw: string | undefined): string[] =>
    (raw || "")
      .split(",")
      .map(h => h.trim().toLowerCase())
      .filter(Boolean);

  const arenamaticHosts = parseHosts(
    import.meta.env.VITE_ARENAMATIC_HOSTS || import.meta.env.VITE_ARENAMATIC_HOST
  );
  const authHosts = parseHosts(
    import.meta.env.VITE_AUTH_HOSTS || import.meta.env.VITE_AUTH_HOST
  );

  const isArenamaticSite = arenamaticHosts.includes(hostname);
  const isAuthHost = authHosts.includes(hostname);

  return (
    <SiteContext.Provider value={{ isArenamaticSite, isAuthHost }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => useContext(SiteContext);

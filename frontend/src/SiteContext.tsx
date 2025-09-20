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

const isArenamaticSite = (
  hostname === "www.arenamatic.ca" ||
  hostname === "wwwstaging.arenamatic.ca"
);

const isAuthHost = hostname === "auth.arenamatic.ca";

  return (
    <SiteContext.Provider value={{ isArenamaticSite, isAuthHost }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => useContext(SiteContext);

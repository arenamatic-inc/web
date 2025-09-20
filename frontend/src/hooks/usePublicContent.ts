import { useEffect, useState } from "react";
import { useSite } from "../SiteContext";

export type WebPublicContent = {
  name: string;
  slug: string;
  tagline: string;
  subline: string;
  sections: { title: string; html: string }[];
  social?: {
    youtube?: string;
    instagram?: string;
    facebook?: string;
    email?: string;
  };
};

export function usePublicContent() {
  const [publicContent, setPublicContent] = useState<WebPublicContent | null>(null);
  const { isArenamaticSite } = useSite();

  useEffect(() => {
    if (isArenamaticSite) {
      return; // Skip fetch — no public content for arenamatic.ca
    }

    fetch(`${import.meta.env.VITE_API_BASE}/web/public_content`, {
      headers: {
        "X-Club-Host": window.location.hostname,
      },
    })
      .then((res) => res.json())
      .then(setPublicContent)
      .catch(console.error);
  }, [isArenamaticSite]);

  return { publicContent };
}

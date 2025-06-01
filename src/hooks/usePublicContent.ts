import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/web/public_content`, {
      headers: {
        "X-Club-Host": window.location.hostname,
      },
    })
      .then((res) => res.json())
      .then(setPublicContent)
      .catch(console.error);
  }, []);

  return { publicContent };
}

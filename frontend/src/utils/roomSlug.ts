export async function getRoomSlug(): Promise<string | null> {
    const cached = localStorage.getItem("room_slug");
    if (cached) return cached;
  
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/web/room_slug`, {
        headers: {
          'X-Club-Host': window.location.hostname,
        },
      });
  
      if (!res.ok) throw new Error("Failed to fetch room slug");
      const json = await res.json();
  
      if (json.slug) {
        localStorage.setItem("room_slug", json.slug);
        return json.slug;
      }
  
      return null;
    } catch (err) {
      console.error("Error getting room slug:", err);
      return null;
    }
  }
  
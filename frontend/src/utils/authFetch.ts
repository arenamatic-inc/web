// src/utils/authFetch.ts
export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
    const token = localStorage.getItem("id_token");
  
    if (!token) {
      throw new Error("No token found. User may not be logged in.");
    }
  
    const res = await fetch(input, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (res.status === 401) {
      // Handle expired or invalid token
      localStorage.removeItem("id_token");
      localStorage.removeItem("access_token");
      // Optional: show modal or redirect
      window.location.href = "/login";
      throw new Error("Session expired. Redirecting to login.");
    }
  
    return res;
  }
  
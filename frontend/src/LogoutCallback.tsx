import { useEffect } from "react";

export default function LogoutCallback() {
  useEffect(() => {
    // Clean up any leftovers
    localStorage.removeItem("id_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("pkce_verifier");

    // 👇 Parse the URL fragment, e.g. "#return=https%3A%2F%2Fmysnookerclub.click"
    const rawHash = window.location.hash.slice(1); // removes the #
    const returnUrl = decodeURIComponent(
      new URLSearchParams(rawHash).get("return") || "/"
    );

    console.log("[LogoutCallback] Redirecting to:", returnUrl);
    window.location.replace(returnUrl);
  }, []);

  return <div className="p-8 text-white">Logging you out…</div>;
}

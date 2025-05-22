import { useEffect } from "react";

export default function LogoutCallback() {
  useEffect(() => {
    // Extract the state from the fragment (after the #)
    const fragment = window.location.hash;
    const state = new URLSearchParams(fragment.replace('#', '')).get('state');

    console.log("[LogoutCallback] Redirecting user to state:", state);

    // Redirect to the state (original site)
    window.location.replace(state || '/');
  }, []);

  return <div className="p-8 text-white">Logging you out…</div>;
}
// export default function LogoutCallback() {
//   useEffect(() => {
//     // Clean up any leftovers (e.g., remove local session data)
//     localStorage.removeItem("id_token");
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("pkce_verifier");

//     // Redirect back to the original URL (club site or home page)
//     window.location.replace(document.referrer || "/");  // Default to homepage if referrer isn't available
//   }, []);

//   return <div className="p-8 text-white">Logging you out…</div>;
// }

// export default function LogoutCallback() {
//   useEffect(() => {
//     // Clean up any leftovers
//     localStorage.removeItem("id_token");
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("pkce_verifier");

//     // 👇 Parse the URL fragment, e.g. "#return=https%3A%2F%2Fmysnookerclub.click"
//     const rawHash = window.location.hash.slice(1); // removes the #
//     const returnUrl = decodeURIComponent(
//       new URLSearchParams(rawHash).get("return") || "/"
//     );

//     console.log("[LogoutCallback] Redirecting to:", returnUrl);
//     window.location.replace(returnUrl);
//   }, []);

//   return <div className="p-8 text-white">Logging you out…</div>;
// }

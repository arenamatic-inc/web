import { useEffect } from "react";
import { generatePKCE } from "../pkce"; // adjust path as needed

export default function Logout() {
  useEffect(() => {
    // Capture the state (original URL) from the query string
    const params = new URLSearchParams(window.location.search);
    // const returnUrl = decodeURIComponent(params.get("state") || "/");
    // const referrerUrl = document.referrer || window.location.origin; // Default to current site if referrer isn't available

    // Redirect to Cognito’s logout URL with both logout_uri and redirect_uri as the referring URL (the club site)
    // const cognitoLogoutUrl = `https://${import.meta.env.VITE_COGNITO_DOMAIN}/logout?client_id=${import.meta.env.VITE_COGNITO_CLIENT_ID}&logout_uri=${encodeURIComponent(returnUrl)}&redirect_uri=${encodeURIComponent(returnUrl)}`;
    // const cognitoLogoutUrl = `https://${import.meta.env.VITE_COGNITO_DOMAIN}/logout?client_id=${import.meta.env.VITE_COGNITO_CLIENT_ID}&logout_uri=${encodeURIComponent(referrerUrl)}&redirect_uri=${encodeURIComponent(referrerUrl)}`;
    const state = decodeURIComponent(params.get("state") || "/"); 
    const cognitoLogoutUrl = `https://${import.meta.env.VITE_COGNITO_DOMAIN}/logout?client_id=${import.meta.env.VITE_COGNITO_CLIENT_ID}&logout_uri=${encodeURIComponent(window.location.origin + '/logout/callback')}&redirect_uri=${encodeURIComponent(window.location.origin + '/logout/callback')}#state=${encodeURIComponent(state)}`;

    window.location.href = cognitoLogoutUrl;  // Redirect to Cognito's logout endpoint
  }, []);

  return <div className="p-8 text-white">Logging you out...</div>;
}

// export default function LogoutCallback() {
//   useEffect(() => {
//     // Capture the state (original URL) from the query string
//     const params = new URLSearchParams(window.location.search);
//     const returnUrl = decodeURIComponent(params.get("state") || "/");

//     // Redirect to Cognito’s logout URL with the logout_uri pointing to the callback
//     const cognitoLogoutUrl = `https://wpstaging.auth.ca-central-1.amazoncognito.com/logout?client_id=${import.meta.env.VITE_COGNITO_CLIENT_ID}&logout_uri=${encodeURIComponent(returnUrl)}`;

//     // Perform the actual redirect to Cognito's logout endpoint
//     window.location.href = cognitoLogoutUrl;
//   }, []);

//   return <div className="p-8 text-white">Logging you out...</div>;
// }

// export default function LogoutCallback() {
//   useEffect(() => {
//     // Clean up any leftovers
//     localStorage.removeItem("id_token");
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("pkce_verifier");

//     // Extract the state (the original URL) from the query parameters
//     const params = new URLSearchParams(window.location.search);
//     const returnUrl = decodeURIComponent(params.get("state") || "/");  // Default to home if no state

//     // Redirect the user to the original URL or home page
//     console.log("[LogoutCallback] Redirecting to:", returnUrl);
//     window.location.replace(returnUrl);  // Redirect to the original URL or / if not available
//   }, []);

//   return <div className="p-8 text-white">Logging you out…</div>;
// }

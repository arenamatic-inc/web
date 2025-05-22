import { useEffect } from "react";

export default function LoginCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state") || "https://mysnookerclub.click/login/finish";
    const verifier = localStorage.getItem("pkce_verifier");

    if (!code || !verifier) {
      console.error("Missing code or verifier.");
      setTimeout(() => window.location.replace(state), 3000);
      return;
    }

    // ✅ Use env vars
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
    const domain = import.meta.env.VITE_COGNITO_DOMAIN;

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    });

    fetch(`https://${domain}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })
      .then(res => res.json())
      .then(tokens => {
        console.log("[LoginCallback] Token response:", tokens);
        console.log("[LoginCallback] State:", state);

        debugger;

        if (tokens.id_token && tokens.access_token) {
          const redirectTo = `${state}#id_token=${tokens.id_token}&access_token=${tokens.access_token}`;
          console.log("[LoginCallback] Redirecting to:", redirectTo);
          setTimeout(() => window.location.replace(redirectTo), 5000);
        } else {
          console.error("[LoginCallback] No id_token returned", tokens);
          setTimeout(() => window.location.replace(state), 5000);
        }
      })
      .catch(err => {
        console.error("[LoginCallback] Token exchange error", err);
        window.location.replace(state);
      });
  }, []);

  return <div className="p-8 text-white">Completing login…</div>;
}

import { useEffect } from "react";

export default function LoginCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state") || "https://mysnookerclub.click/login/finish";
    const verifier = localStorage.getItem("pkce_verifier");

    if (!code || !verifier) {
      console.error("Missing code or verifier.");
      setTimeout(() => {
        window.location.replace(state);
      }, 3000);
      return;
    }

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: "569l6bgvhq1pltqjhk58s1ufek",
      code,
      redirect_uri: "https://auth.arenamatic.ca/login/callback",
      code_verifier: verifier,
    });

    fetch("https://ca-central-1zs2itfxku.auth.ca-central-1.amazoncognito.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })
      .then(res => res.json())
      .then(tokens => {
        console.log("[LoginCallback] Token response:", tokens);
        console.log("[LoginCallback] State:", state);
        console.log("[LoginCallback] Tokens:", tokens);
        console.log("[LoginCallback] Redirecting to:", `${state}#id_token=${tokens.id_token}&access_token=${tokens.access_token}`);
        
        if (tokens.id_token && tokens.access_token) {
          // Redirect to original club with tokens in hash
          const redirectTo = `${state}#id_token=${tokens.id_token}&access_token=${tokens.access_token}`;
          // window.location.replace(redirectTo);
          setTimeout(() => {
            window.location.replace(redirectTo);
          }, 5000); // ⏳ Give yourself 5 seconds to read the logs
        
        } else {
          console.error("[LoginCallback] No id_token returned", tokens);
          // window.location.replace(state);
          setTimeout(() => {
            window.location.replace(state);
          }, 5000); // ⏳ Give yourself 5 seconds to read the logs
                }
      })
      .catch(err => {
        console.error("[LoginCallback] Token exchange error", err);
        window.location.replace(state);
      });
  }, []);

  return <div className="p-8 text-white">Completing login…</div>;
}

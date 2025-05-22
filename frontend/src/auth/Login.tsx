import { useEffect } from "react";
import { generatePKCE } from "../pkce"; // adjust path as needed

export default function Login() {
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const state = params.get("state") || "https://mysnookerclub.click/login/finish"; // Default to the finish page of the requesting domain.
  
      generatePKCE().then(({ verifier, challenge }) => {
        localStorage.setItem("pkce_verifier", verifier);
        console.log("[Auth Login] Saved verifier:", verifier);
  
        const loginUrl = `https://${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/authorize` +
          `?client_id=${import.meta.env.VITE_COGNITO_CLIENT_ID}` +
          `&response_type=code` +
          `&scope=email+openid` +
          `&redirect_uri=${encodeURIComponent(import.meta.env.VITE_COGNITO_REDIRECT_URI)}` +
          `&code_challenge=${challenge}` +
          `&code_challenge_method=S256` +
          `&state=${encodeURIComponent(state)}`;

        debugger;
        window.location.href = loginUrl;
      });
    }, []);
  
    return <div className="p-8 text-white">Preparing login…</div>;
  }
  
// export default function Login() {
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const state = params.get("state") || "https://mysnookerclub.click/login/finish";

//     generatePKCE().then(({ verifier, challenge }) => {
//       localStorage.setItem("pkce_verifier", verifier);
//       console.log("[Auth Login] Saved verifier:", verifier);

//       const loginUrl = `https://ca-central-1zs2itfxku.auth.ca-central-1.amazoncognito.com/login` +
//         `?client_id=569l6bgvhq1pltqjhk58s1ufek` +
//         `&response_type=code` +
//         `&scope=email+openid` +
//         `&redirect_uri=https://auth.arenamatic.ca/login/callback` +
//         `&code_challenge=${challenge}` +
//         `&code_challenge_method=S256` +
//         `&state=${encodeURIComponent(state)}`;

//       window.location.href = loginUrl;
//     });
//   }, []);

//   return <div className="p-8 text-white">Preparing login…</div>;
// }

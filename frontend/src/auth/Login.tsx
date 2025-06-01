import { useEffect } from "react";
import { generatePKCE } from "../pkce"; // adjust path as needed
import PageLayout from "../PageLayout";
import { centerHeroText } from "../utils/classnames";

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

    return (<PageLayout>
            {/* <div className={centerHeroText}> */}
            <div>
            Logging you in…
        </div>
    </PageLayout>
    )
}
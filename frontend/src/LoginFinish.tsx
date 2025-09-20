// LoginFinish.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import PageLayout from "./PageLayout";
import { centerHeroText } from "./utils/classnames";
import { useSite } from "./SiteContext";

export default function LoginFinish() {
    const { refreshAuth } = useAuth();
    const navigate = useNavigate();
    const { isArenamaticSite } = useSite();

    useEffect(() => {
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const idToken = hash.get("id_token");
        const accessToken = hash.get("access_token");

        if (idToken && accessToken) {
            localStorage.setItem("id_token", idToken);
            localStorage.setItem("access_token", accessToken);
            refreshAuth?.();
        } else {
            console.error("[LoginFinish] Missing token(s)");
        }

    setTimeout(() => {
        navigate(isArenamaticSite ? "/admin" : "/");
    }, 100);
  
    }, []);

    return (
        <PageLayout>
            {/* <div className={centerHeroText}> */}
            <div>
                Logging you in...
            </div>
        </PageLayout>
    );
}

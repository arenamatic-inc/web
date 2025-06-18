import { useEffect } from "react";
import PageLayout from "./PageLayout";
import { centerHeroText } from "./utils/classnames";

export default function LogoutCallback() {
  useEffect(() => {
    localStorage.removeItem("id_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("pkce_verifier");

    const fragment = window.location.hash;
    const state = new URLSearchParams(fragment.replace('#', '')).get('state');
    const returnUrl = state || '/';
    window.location.replace(returnUrl);
  }, []);
  return <div className="p-8 text-white">Logging you out…</div>;
}

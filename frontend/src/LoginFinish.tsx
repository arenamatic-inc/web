// LoginFinish.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth/useAuth";

export default function LoginFinish() {
  const { refreshAuth } = useAuth();
  const navigate = useNavigate();

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

    navigate("/"); // Or return to where user was before
  }, []);

  return <div className="p-8 text-white">Logging you in…</div>;
}

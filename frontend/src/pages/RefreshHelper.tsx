import { useEffect } from "react";

export default function RefreshHelper() {
    useEffect(() => {
        const listener = async (event: MessageEvent) => {
            if (event.data?.action !== "refresh") return;

            const allowedOrigins = [
                "https://ottawasnookerclub.com",
                "https://www.ottawasnookerclub.com",
                "https://wwwstaging.ottawasnookerclub.com",
                "https://mysnookerclub.click",
                "http://localhost:5173", // dev
            ];

            if (!event.origin || !allowedOrigins.includes(event.origin) || !event.source) {
                console.warn("Blocked token refresh request from untrusted origin:", event.origin);
                return;
            }

            try {
                const response = await fetch("/api/refresh", {
                    method: "POST",
                    credentials: "include",
                });

                const data = await response.json();
                const allowedOrigin: string = event.origin;

                if (data.access_token && data.id_token) {
                    (event.source as Window).postMessage(
                        {
                            access_token: data.access_token,
                            id_token: data.id_token,
                            expires_in: data.expires_in,
                        },
                        allowedOrigin
                    );
                } else {
                    (event.source as Window).postMessage({ error: "no_tokens" }, allowedOrigin);
                }
            } catch (err) {
                (event.source as Window).postMessage({ error: "refresh_failed" }, event.origin as string);
            }
        };

        window.addEventListener("message", listener);
        return () => window.removeEventListener("message", listener);
    }, []);

    return <div className="p-4 text-white">Refresh helper loaded</div>;
}

import { useEffect } from "react";
import PageLayout from "./PageLayout";

export default function LogoutFinish() {
  useEffect(() => {
    localStorage.removeItem("just_logged_out_at");
    // Optionally: show a banner or flash a "You’ve been logged out" message
    console.log("[LogoutFinish] Logout complete");
  }, []);

  return (
    <PageLayout>
      <div className="p-8 text-white">
        You’ve been logged out.
      </div>
    </PageLayout>
  );
}

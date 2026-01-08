import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { AdminTabLayout } from "../admin/AdminTabLayout";
import FaqEditor from "../../components/FaqEditor";
import { AdminPageProps } from "../../constants/adminMenu";
import { getRoomSlug } from "../../utils/roomSlug";

type FaqItem = {
  question: string;
  answer: string;
  sequence?: number;
};

type FaqCategory = {
  title: string;
  sequence?: number;
  items: FaqItem[];
};

type WebFaq = {
  categories: FaqCategory[];
};

export default function FaqAdminPage({ requiredPermission }: AdminPageProps) {
  const { idToken, permissions } = useAuth();

  // ⭐ FIX 1 — getRoomSlug must be async, so store it in state
  const [roomSlug, setRoomSlug] = useState<string | null>(null);

  const [faq, setFaq] = useState<WebFaq | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load slug once, just like other admin pages do
  useEffect(() => {
    getRoomSlug().then(setRoomSlug);
  }, []);

  // ⭐ FIX 2 — only load FAQ once slug, idToken, permissions are ready
  useEffect(() => {
    if (!roomSlug || !idToken) return;

    setLoading(true);

    fetch(`${import.meta.env.VITE_API_BASE}/web/faq`, {
      headers: {
        "X-Club-Host": window.location.hostname,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFaq(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load FAQ");
        setLoading(false);
      });
  }, [roomSlug, idToken]);

  const handleSave = async () => {
    if (!faq || !roomSlug) return;

    setSaving(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/web/admin/faq/${roomSlug}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "x-api-key": import.meta.env.VITE_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(faq),
        }
      );

      if (!res.ok) throw new Error(await res.text());
      alert("FAQ updated successfully.");
    } catch (e: any) {
      alert(`Failed to update FAQ: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ⭐ FIX 3 — Don't render AdminTabLayout until both permissions and roomSlug have settled
  if (permissions === null || roomSlug === null) {
    return <div className="p-6">Loading…</div>;
  }

  // Correct permission name casing
  const hasPermission =
    permissions.room_permissions?.includes("RoomManageWebContent");

  if (!hasPermission) {
    return <div className="p-6 text-red-600">Not authorized.</div>;
  }

  return (
    <AdminTabLayout
      title="FAQ Editor"
      requiredPermission={requiredPermission}
      activeTab="faq"
      onRefresh={() => {}}
      setActiveTab={() => {}}
      tabs={[
        {
          id: "faq",
          label: "FAQ",
          content: (
            <div className="space-y-6">
              {loading && <div>Loading FAQ…</div>}
              {error && <div className="text-red-600">{error}</div>}

              {!loading && faq && (
                <>
                  <FaqEditor faq={faq} setFaq={setFaq} />

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white"
                  >
                    {saving ? "Saving…" : "Save FAQ"}
                  </button>
                </>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}

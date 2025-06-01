import { useAuth } from "../../auth/useAuth";
import PageLayout from "../../PageLayout";

export default function RoomActivityPage() {
  const { permissions } = useAuth();

  const hasPermission = permissions?.room_permissions.includes("RoomReadActivity");

  return (
    <PageLayout>
      {!hasPermission ? (
        <div className="p-8 text-red-400">Access Denied</div>
      ) : (
        <div className="p-8 text-white">Room Activity Page (Under Construction)</div>
      )}
    </PageLayout>
  );
}

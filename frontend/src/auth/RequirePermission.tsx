import { useAuth } from "./useAuth";

type RequirePermissionProps = {
  permission: string;
  children: React.ReactNode;
};

export default function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { user, permissions } = useAuth();

  if (!user) {
    return <div className="p-8 text-red-400">Please log in to continue.</div>;
  }

  if (!permissions) {
    return <div className="p-8 text-gray-300">Loading permissions...</div>;
  }

  const hasPermission =
    permissions?.global_permissions?.includes(permission) ||
    permissions?.room_permissions?.includes(permission);

  if (!hasPermission) {
    return <div className="p-8 text-red-400">Access Denied</div>;
  }

  return <>{children}</>;
}

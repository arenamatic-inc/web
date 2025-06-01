import { useAuth } from "./useAuth";

type RequirePermissionProps = {
  permission: string;
  children: React.ReactNode;
};

export default function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { permissions } = useAuth();

  const hasPermission =
    permissions?.global_permissions?.includes(permission) ||
    permissions?.room_permissions?.includes(permission);

  if (!hasPermission) {
    return <div className="p-8 text-red-400">Access Denied</div>;
  }

  return <>{children}</>;
}

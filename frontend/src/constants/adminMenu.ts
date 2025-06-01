// src/constants/adminMenu.ts
export type AdminMenuItem = {
    label: string;
    path: string;
    requiredPermission: string;
  };
  
  export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
    {
      label: "Room Activity",
      path: "/admin/room-activity",
      requiredPermission: "RoomReadActivity",
    },
    // {
    //   label: "User Management",
    //   path: "/admin/users",
    //   requiredPermission: "UserManage",
    // },
    // Add more as needed
  ];
  
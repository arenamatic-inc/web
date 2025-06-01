// src/constants/adminMenu.ts
// src/constants/adminMenu.ts
import { JSX } from "react";
import RoomActivityPage from "../pages/admin/RoomActivity";
import { ComponentType } from "react";

export type AdminMenuItem = {
  label: string;
  path: string;
  requiredPermission: string;
  component: ComponentType;
};

  export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
    {
        label: "Room Activity",
        path: "/admin/room-activity",
        requiredPermission: "RoomReadActivity",
        component: RoomActivityPage,
      },
        // {
    //   label: "User Management",
    //   path: "/admin/users",
    //   requiredPermission: "UserManage",
    // },
    // Add more as needed
  ];
  
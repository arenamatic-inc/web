import { JSX } from "react";
import RoomActivityPage from "../pages/admin/RoomActivity";
import RoomFeeAdminPage from "../pages/admin/RoomFeeAdmin";
import RoomFinancialsPage, { RoomFinancialsOldPage } from "../pages/admin/RoomFinancialsPage";
import RoomAdminPage from "../pages/admin/RoomAdminPage";
import FaqAdminPage from "../pages/admin/AdminFaq";
import PlatformLiabilityPage from "../pages/admin/PlatformLiabilityPage";

export type AdminPageProps = {
  requiredPermission: string;
};

export type AdminMenuItem = {
  label: string;
  path: string;
  requiredPermission: string;
  element: () => JSX.Element;
};

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    path: "/admin/room-activity",
    label: "Room Activity",
    requiredPermission: "RoomReadActivity",
    element: () => {
      return <RoomActivityPage requiredPermission="RoomReadActivity" />;
    },
  },
  {
    path: "/admin/room-financials",
    label: "Room Financials",
    requiredPermission: "RoomReadFinancials",
    element: () => {
      return <RoomFinancialsPage requiredPermission="RoomGiveRefund" />;
    },
  },
  // Legacy tab set: comment out this block to hide.
  {
    path: "/admin/room-financials-old",
    label: "Room Financials-old",
    requiredPermission: "RoomReadFinancials",
    element: () => {
      return <RoomFinancialsOldPage requiredPermission="RoomGiveRefund" />;
    },
  },
  {
    path: "/admin/faq",
    label: "Edit FAQ",
    requiredPermission: "RoomManageWebContent",
    element: () => <FaqAdminPage requiredPermission="RoomManageWebContent" />,
  }
];

export const ARENAMATIC_ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    path: "/admin/room-fees",
    label: "Room Fees",
    requiredPermission: "GlobalManageRoomFees",
    element: () => <RoomFeeAdminPage />,
  },
  {
    path: "/admin/room-config",
    label: "Room",
    requiredPermission: "GlobalManageRooms",
    element: () => <RoomAdminPage />,
  },
  {
    path: "/admin/room-financials",
    label: "Room Financials",
    requiredPermission: "GlobalRoomReadFinancials",
    element: () => <RoomFinancialsPage requiredPermission="GlobalRoomReadFinancials" enableRoomSelector={true} />,
  },
  // Legacy tab set: comment out this block to hide.
  {
    path: "/admin/room-financials-old",
    label: "Room Financials-old",
    requiredPermission: "GlobalRoomReadFinancials",
    element: () => <RoomFinancialsOldPage requiredPermission="GlobalRoomReadFinancials" enableRoomSelector={true} />,
  },
  {
    path: "/admin/platform-liability",
    label: "Platform Liability",
    requiredPermission: "GlobalRoomReadFinancials",
    element: () => <PlatformLiabilityPage requiredPermission="GlobalRoomReadFinancials" />,
  },
  {
    path: "/admin/faq",
    label: "FAQ Editor",
    requiredPermission: "RoomManageFaq",
    element: () => <FaqAdminPage requiredPermission="RoomManageWebContent" />,
  }

];

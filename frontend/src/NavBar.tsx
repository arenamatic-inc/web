import { useEffect, useRef, useState } from "react";
import { useAuth } from "./auth/useAuth";

const ADMIN_MENU_ITEMS = [
  {
    label: "Activity",
    href: "/admin/activity",
    requiredPermission: "RoomReadActivity",
  },
  // Add more as needed
];


export default function NavBar() {
  const { user, permissions, logout, login } = useAuth();

  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setShowAdminDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasAdminAccess = permissions?.room_permissions?.some(p =>
    ADMIN_MENU_ITEMS.some(item => item.requiredPermission === p)
  );

  const visibleAdminItems = ADMIN_MENU_ITEMS.filter(item =>
    permissions?.room_permissions?.includes(item.requiredPermission)
  );

  return (
    <nav className="fixed top-0 left-0 w-full z-30 bg-black/50 backdrop-blur-md text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">
          <a href="/">OSC</a>
        </div>
        <div className="space-x-6 text-sm font-medium">
          <a href="/" className="hover:text-red-400">Home</a>
          <a href="/leagues" className="hover:text-red-400">Leagues</a>

          {hasAdminAccess && (
            <div className="relative inline-block" ref={adminDropdownRef}>
              <button
                onClick={() => setShowAdminDropdown(prev => !prev)}
                className="hover:text-red-400"
              >
                Admin
              </button>
              {showAdminDropdown && (
                <div className="absolute left-0 mt-2 bg-black p-2 rounded shadow-lg text-sm min-w-[140px] text-left z-50">
                  {visibleAdminItems.map(({ label, href }) => (
                    <a key={href} href={href} className="block px-4 py-2 text-white hover:text-red-400">
                      {label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="relative inline-block">
              <button onClick={logout} className="hover:text-red-400">
                {user.email || "Logout"}
              </button>
            </div>
          ) : (
            <button onClick={login} className="hover:text-red-400">Login</button>
          )}
        </div>
      </div>
    </nav>
  );
}
